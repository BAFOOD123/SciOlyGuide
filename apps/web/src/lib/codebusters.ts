import "server-only";
import { and, desc, eq, inArray, isNotNull, ne } from "drizzle-orm";
import {
  CIPHERS,
  generate,
  type CipherType,
  type Puzzle,
  type PuzzleSpec,
  type Response,
} from "@sciolyguide/codebusters";
import { db, schema } from "./db";
import type { PublicPuzzle, Reveal } from "./codebusters-types";

/** Strip everything that would give the answer away before sending to the browser. */
export function toPublic(p: Puzzle): PublicPuzzle {
  return {
    type: p.type,
    title: p.title,
    prompt: p.prompt,
    display: p.display,
    points: p.points,
    answer: {
      kind: p.answer.kind,
      freeErrors: p.answer.freeErrors,
      label: p.answer.label,
      length: p.answer.value.length,
    },
  };
}

export function revealOf(p: Puzzle, wrong: number[] = []): Reveal {
  return {
    plaintext: p.plaintext,
    attribution: p.attribution,
    solution: p.solution,
    expected: p.answer.value,
    wrong,
  };
}

export function parseSpec(json: string): PuzzleSpec {
  return JSON.parse(json) as PuzzleSpec;
}

export function puzzleFor(attempt: Pick<schema.Attempt, "spec">): Puzzle {
  return generate(parseSpec(attempt.spec));
}

export function emptyResponse(p: Puzzle): Response {
  return { plain: Array.from({ length: p.display.answerLength }, () => ""), final: "" };
}

export function parseResponse(json: string): Response {
  const r = JSON.parse(json) as Partial<Response>;
  return { plain: Array.isArray(r.plain) ? r.plain.map(String) : [], final: typeof r.final === "string" ? r.final : "" };
}

/** Clamp an untrusted response from the client to the puzzle's shape. */
export function sanitizeResponse(p: Puzzle, r: unknown): Response {
  const obj = (r ?? {}) as { plain?: unknown; final?: unknown };
  const plainIn = Array.isArray(obj.plain) ? obj.plain : [];
  const plain = Array.from({ length: p.display.answerLength }, (_, i) => {
    const v = plainIn[i];
    return typeof v === "string" ? v.slice(0, 2).toUpperCase() : "";
  });
  const final = typeof obj.final === "string" ? obj.final.slice(0, 40).toUpperCase() : "";
  return { plain, final };
}

export async function getOwnedAttempt(userId: string, id: string) {
  const [row] = await db
    .select()
    .from(schema.attempts)
    .where(and(eq(schema.attempts.id, id), eq(schema.attempts.userId, userId)))
    .limit(1);
  return row ?? null;
}

/* ------------------------------------ Stats ----------------------------------- */

export interface CipherStats {
  type: CipherType;
  attempts: number;
  solved: number;
  accuracy: number | null;
  avgErrors: number | null;
  bestMs: number | null;
  medianMs: number | null;
  lastAt: number | null;
}

export interface UserStats {
  byType: Record<CipherType, CipherStats>;
  totalSolved: number;
  totalAttempts: number;
  streakDays: number;
  bestTimedMs: number | null;
  recommended: CipherType | null;
}

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : Math.round((s[m - 1]! + s[m]!) / 2);
};

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const rows = await db
    .select({
      cipherType: schema.attempts.cipherType,
      kind: schema.attempts.kind,
      status: schema.attempts.status,
      errors: schema.attempts.errors,
      elapsedMs: schema.attempts.elapsedMs,
      finishedAt: schema.attempts.finishedAt,
    })
    .from(schema.attempts)
    .where(
      and(
        eq(schema.attempts.userId, userId),
        isNotNull(schema.attempts.finishedAt),
        inArray(schema.attempts.status, ["solved", "unsolved", "revealed"]),
      ),
    );

  const byType = Object.fromEntries(
    CIPHERS.map((c) => [
      c.type,
      { type: c.type, attempts: 0, solved: 0, accuracy: null, avgErrors: null, bestMs: null, medianMs: null, lastAt: null },
    ]),
  ) as Record<CipherType, CipherStats>;

  const times = new Map<CipherType, number[]>();
  const errs = new Map<CipherType, number[]>();
  let bestTimedMs: number | null = null;
  const days = new Set<string>();

  for (const r of rows) {
    const t = r.cipherType as CipherType;
    const s = byType[t];
    if (!s) continue;
    s.attempts++;
    if (r.status === "solved") {
      s.solved++;
      // Test questions share the test clock, so they don't count toward solve times.
      if (r.kind !== "test") (times.get(t) ?? times.set(t, []).get(t)!).push(r.elapsedMs);
      if (r.kind === "timed") bestTimedMs = bestTimedMs === null ? r.elapsedMs : Math.min(bestTimedMs, r.elapsedMs);
    }
    if (r.errors !== null && r.status !== "revealed") (errs.get(t) ?? errs.set(t, []).get(t)!).push(r.errors);
    const at = r.finishedAt!.getTime();
    s.lastAt = Math.max(s.lastAt ?? 0, at);
    days.add(dayKey(r.finishedAt!));
  }

  for (const s of Object.values(byType)) {
    if (s.attempts) s.accuracy = s.solved / s.attempts;
    const ts = times.get(s.type) ?? [];
    s.bestMs = ts.length ? Math.min(...ts) : null;
    s.medianMs = median(ts);
    const es = errs.get(s.type) ?? [];
    s.avgErrors = es.length ? es.reduce((a, b) => a + b, 0) / es.length : null;
  }

  // Streak: consecutive days (ending today or yesterday) with a finished attempt.
  let streakDays = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (days.has(dayKey(cursor))) {
    streakDays++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  // Recommend: never tried first, then lowest accuracy, then least recent.
  const all = Object.values(byType);
  const untried = all.filter((s) => s.attempts === 0);
  const recommended =
    untried[0]?.type ??
    all
      .slice()
      .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0) || (a.lastAt ?? 0) - (b.lastAt ?? 0))[0]?.type ??
    null;

  return {
    byType,
    totalSolved: all.reduce((n, s) => n + s.solved, 0),
    totalAttempts: all.reduce((n, s) => n + s.attempts, 0),
    streakDays,
    bestTimedMs,
    recommended,
  };
}

export async function recentAttempts(userId: string, limit = 10) {
  return db
    .select()
    .from(schema.attempts)
    .where(
      and(eq(schema.attempts.userId, userId), isNotNull(schema.attempts.finishedAt), ne(schema.attempts.status, "skipped")),
    )
    .orderBy(desc(schema.attempts.finishedAt))
    .limit(limit);
}
