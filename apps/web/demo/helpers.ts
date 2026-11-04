import { CIPHERS, type CipherType, type Puzzle, type Response } from "@sciolyguide/codebusters";
import type { PublicPuzzle, Reveal } from "@/lib/codebusters-types";
import type { DemoAttempt } from "./store";

// Same as src/lib/codebusters.ts (which is server-only).
export function toPublic(p: Puzzle): PublicPuzzle {
  return {
    type: p.type,
    title: p.title,
    prompt: p.prompt,
    display: p.display,
    points: p.points,
    answer: { kind: p.answer.kind, freeErrors: p.answer.freeErrors, label: p.answer.label, length: p.answer.value.length },
  };
}

export function revealOf(p: Puzzle, wrong: number[] = []): Reveal {
  return { plaintext: p.plaintext, attribution: p.attribution, solution: p.solution, expected: p.answer.value, wrong };
}

export function emptyResponse(p: Puzzle): Response {
  return { plain: Array.from({ length: p.display.answerLength }, () => ""), final: "" };
}

export interface CipherStats {
  type: CipherType;
  attempts: number;
  solved: number;
  accuracy: number | null;
  bestMs: number | null;
  medianMs: number | null;
  lastAt: number | null;
}

/** Port of getUserStats() for the in-browser store. */
export function computeStats(all: DemoAttempt[]) {
  const done = all.filter((a) => a.finishedAt && ["solved", "unsolved", "revealed"].includes(a.status));
  const byType = Object.fromEntries(
    CIPHERS.map((c) => [c.type, { type: c.type, attempts: 0, solved: 0, accuracy: null, bestMs: null, medianMs: null, lastAt: null }]),
  ) as Record<CipherType, CipherStats>;
  const times = new Map<CipherType, number[]>();
  let bestTimedMs: number | null = null;
  const days = new Set<string>();
  for (const a of done) {
    const s = byType[a.cipherType as CipherType];
    if (!s) continue;
    s.attempts++;
    if (a.status === "solved") {
      s.solved++;
      if (a.kind !== "test") (times.get(s.type) ?? times.set(s.type, []).get(s.type)!).push(a.elapsedMs);
      if (a.kind === "timed") bestTimedMs = bestTimedMs === null ? a.elapsedMs : Math.min(bestTimedMs, a.elapsedMs);
    }
    s.lastAt = Math.max(s.lastAt ?? 0, a.finishedAt!);
    days.add(new Date(a.finishedAt!).toISOString().slice(0, 10));
  }
  for (const s of Object.values(byType)) {
    if (s.attempts) s.accuracy = s.solved / s.attempts;
    const ts = (times.get(s.type) ?? []).sort((x, y) => x - y);
    s.bestMs = ts[0] ?? null;
    s.medianMs = ts.length ? ts[Math.floor(ts.length / 2)]! : null;
  }
  let streakDays = 0;
  const cursor = new Date();
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streakDays++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const list = Object.values(byType);
  const recommended =
    list.find((s) => s.attempts === 0)?.type ??
    list.slice().sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0) || (a.lastAt ?? 0) - (b.lastAt ?? 0))[0]?.type ??
    null;
  return {
    byType,
    totalSolved: list.reduce((n, s) => n + s.solved, 0),
    totalAttempts: list.reduce((n, s) => n + s.attempts, 0),
    streakDays,
    bestTimedMs,
    recommended,
    recent: done.sort((a, b) => b.finishedAt! - a.finishedAt!).slice(0, 8),
  };
}
