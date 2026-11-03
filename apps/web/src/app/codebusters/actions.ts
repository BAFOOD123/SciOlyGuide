"use server";

import { and, asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  SCORING,
  buildTest,
  generate,
  grade,
  isCipherType,
  randomSeed,
  specialBonus,
  timedBonus,
  type CipherType,
  type PuzzleOptions,
  type PuzzleSpec,
  type Response,
} from "@sciolyguide/codebusters";
import { newId, requireUser } from "@/lib/auth";
import { emptyResponse, getOwnedAttempt, puzzleFor, revealOf, sanitizeResponse } from "@/lib/codebusters";
import type { CheckResult, Reveal } from "@/lib/codebusters-types";
import { db, schema } from "@/lib/db";

const MAX_NOTES_BYTES = 20_000;
const MAX_PRACTICE_MS = 6 * 60 * 60_000;

function cleanOptions(o: unknown): PuzzleOptions {
  const src = (o ?? {}) as Record<string, unknown>;
  const pick = <T extends string>(v: unknown, allowed: readonly T[]) => (allowed.includes(v as T) ? (v as T) : undefined);
  return {
    mode: pick(src.mode, ["decode", "cryptanalysis", "keyword"]),
    alphabet: pick(src.alphabet, ["random", "k1", "k2", "k3"]),
    hint: pick(src.hint, ["none", "word", "letters"]),
    length: pick(src.length, ["short", "medium", "long"]),
    symbols: pick(src.symbols, ["letters", "symbols"]),
  };
}

function notesJson(notes: unknown): string | undefined {
  if (notes === undefined) return undefined;
  const s = JSON.stringify(notes ?? {});
  return s.length <= MAX_NOTES_BYTES ? s : undefined;
}

async function insertAttempt(userId: string, kind: "practice" | "timed" | "test", spec: PuzzleSpec, extra: { testId?: string; questionIndex?: number } = {}) {
  const puzzle = generate(spec);
  const id = newId();
  const now = new Date();
  await db.insert(schema.attempts).values({
    id,
    userId,
    kind,
    cipherType: spec.type,
    spec: JSON.stringify(spec),
    testId: extra.testId,
    questionIndex: extra.questionIndex,
    status: "active",
    response: JSON.stringify(emptyResponse(puzzle)),
    points: puzzle.points,
    startedAt: now,
    updatedAt: now,
  });
  return id;
}

/* ---------------------------------- Practice ---------------------------------- */

/** Start a fresh practice puzzle. Any untouched active puzzle of this type is skipped. */
export async function newPractice(type: string, options: unknown): Promise<void> {
  const user = await requireUser();
  if (!isCipherType(type)) throw new Error("unknown cipher");
  await db
    .update(schema.attempts)
    .set({ status: "skipped", finishedAt: new Date() })
    .where(
      and(
        eq(schema.attempts.userId, user.id),
        eq(schema.attempts.kind, "practice"),
        eq(schema.attempts.cipherType, type),
        eq(schema.attempts.status, "active"),
      ),
    );
  await insertAttempt(user.id, "practice", { type, seed: randomSeed(), options: cleanOptions(options) });
  redirect(`/codebusters/practice/${type}`);
}

export async function saveProgress(attemptId: string, response: Response, elapsedMs: number, notes?: unknown): Promise<{ ok: boolean }> {
  const user = await requireUser();
  const attempt = await getOwnedAttempt(user.id, attemptId);
  if (!attempt || attempt.status !== "active") return { ok: false };
  if (attempt.testId) {
    const [test] = await db.select().from(schema.tests).where(eq(schema.tests.id, attempt.testId));
    if (!test || test.finishedAt || Date.now() > test.endsAt.getTime() + 30_000) return { ok: false };
  }
  const puzzle = puzzleFor(attempt);
  const set: Partial<schema.Attempt> = {
    response: JSON.stringify(sanitizeResponse(puzzle, response)),
    updatedAt: new Date(),
  };
  if (attempt.kind === "practice") set.elapsedMs = Math.max(0, Math.min(MAX_PRACTICE_MS, Math.round(elapsedMs)));
  if (notes !== undefined) {
    const prev = JSON.parse(attempt.notes ?? "{}") as { _hinted?: number[] };
    const n = notesJson({ ...(notes as object), _hinted: prev._hinted });
    if (n !== undefined) set.notes = n;
  }
  await db.update(schema.attempts).set(set).where(eq(schema.attempts.id, attemptId));
  return { ok: true };
}

/**
 * Check an answer. Solving finishes the attempt. A failed check only reports how many
 * errors there are (like raising your hand at a tournament), so you can keep working.
 */
export async function checkAnswer(attemptId: string, response: Response, elapsedMs: number): Promise<CheckResult> {
  const user = await requireUser();
  const attempt = await getOwnedAttempt(user.id, attemptId);
  if (!attempt || attempt.kind === "test") return { solved: false, errors: 0, score: 0, points: 0, error: "Not found" };
  const puzzle = puzzleFor(attempt);
  const clean = sanitizeResponse(puzzle, response);
  const g = grade(puzzle, clean);
  if (attempt.status !== "active") {
    return { solved: attempt.status === "solved", errors: g.errors, score: attempt.score ?? 0, points: puzzle.points, reveal: revealOf(puzzle, g.wrong) };
  }

  const now = new Date();
  const elapsed =
    attempt.kind === "timed"
      ? now.getTime() - attempt.startedAt.getTime()
      : Math.max(0, Math.min(MAX_PRACTICE_MS, Math.round(elapsedMs)));
  const base = { response: JSON.stringify(clean), checks: attempt.checks + 1, updatedAt: now, elapsedMs: elapsed };

  if (g.solved) {
    await db
      .update(schema.attempts)
      .set({ ...base, status: "solved", score: g.score, errors: g.errors, finishedAt: now })
      .where(eq(schema.attempts.id, attemptId));
    const bonus = attempt.kind === "timed" ? timedBonus(elapsed / 1000) : undefined;
    return { solved: true, errors: g.errors, score: g.score, points: puzzle.points, bonus, elapsedMs: elapsed, reveal: revealOf(puzzle, g.wrong) };
  }
  await db.update(schema.attempts).set({ ...base, errors: g.errors }).where(eq(schema.attempts.id, attemptId));
  return { solved: false, errors: g.errors, score: g.score, points: puzzle.points, elapsedMs: elapsed };
}

/** Give up and see the answer. Counts as unsolved. */
export async function revealAnswer(attemptId: string, response: Response, elapsedMs: number): Promise<Reveal | null> {
  const user = await requireUser();
  const attempt = await getOwnedAttempt(user.id, attemptId);
  if (!attempt || attempt.kind === "test") return null;
  const puzzle = puzzleFor(attempt);
  const clean = sanitizeResponse(puzzle, response);
  const g = grade(puzzle, clean);
  if (attempt.status === "active") {
    const now = new Date();
    await db
      .update(schema.attempts)
      .set({
        status: "revealed",
        response: JSON.stringify(clean),
        errors: g.errors,
        score: 0,
        finishedAt: now,
        updatedAt: now,
        elapsedMs: attempt.kind === "timed" ? now.getTime() - attempt.startedAt.getTime() : Math.round(elapsedMs),
      })
      .where(eq(schema.attempts.id, attemptId));
  }
  return revealOf(puzzle, g.wrong);
}

/** Reveal one answer letter (practice only). Hints are tracked in your stats. */
export async function hintLetter(attemptId: string, index: number): Promise<{ letter: string } | null> {
  const user = await requireUser();
  const attempt = await getOwnedAttempt(user.id, attemptId);
  if (!attempt || attempt.kind !== "practice" || attempt.status !== "active") return null;
  const puzzle = puzzleFor(attempt);
  if (puzzle.answer.kind !== "plaintext" || !Number.isInteger(index) || index < 0 || index >= puzzle.answer.value.length) return null;
  const notes = JSON.parse(attempt.notes ?? "{}") as { _hinted?: number[] };
  const hinted = new Set(notes._hinted ?? []);
  if (!hinted.has(index)) {
    hinted.add(index);
    await db
      .update(schema.attempts)
      .set({ hints: attempt.hints + 1, notes: JSON.stringify({ ...notes, _hinted: [...hinted] }) })
      .where(eq(schema.attempts.id, attemptId));
  }
  return { letter: puzzle.answer.value[index]! };
}

/* ------------------------------- Timed question ------------------------------- */

export async function startTimed(): Promise<void> {
  const user = await requireUser();
  await db
    .update(schema.attempts)
    .set({ status: "skipped", finishedAt: new Date() })
    .where(and(eq(schema.attempts.userId, user.id), eq(schema.attempts.kind, "timed"), eq(schema.attempts.status, "active")));
  const alphabet = (["random", "random", "k1", "k2"] as const)[Math.floor(Math.random() * 4)];
  await insertAttempt(user.id, "timed", { type: "aristocrat", seed: randomSeed(), options: { timed: true, alphabet, length: "medium" } });
  redirect("/codebusters/timed");
}

/* ---------------------------------- Mock tests --------------------------------- */

export async function createTest(level: "regional" | "state"): Promise<void> {
  const user = await requireUser();
  const lvl = level === "state" ? "state" : "regional";
  const seed = randomSeed();
  const plan = buildTest(lvl, seed);
  const puzzles = plan.specs.map(generate);
  const id = newId();
  const now = Date.now();
  await db.insert(schema.tests).values({
    id,
    userId: user.id,
    level: lvl,
    seed,
    specials: JSON.stringify(plan.specials),
    startedAt: new Date(now),
    endsAt: new Date(now + SCORING.testMinutes * 60_000),
    maxScore: puzzles.reduce((s, p) => s + p.points, 0),
  });
  for (const [i, spec] of plan.specs.entries()) {
    await insertAttempt(user.id, "test", spec, { testId: id, questionIndex: i });
  }
  redirect(`/codebusters/test/${id}`);
}

async function ownedTest(userId: string, testId: string) {
  const [t] = await db
    .select()
    .from(schema.tests)
    .where(and(eq(schema.tests.id, testId), eq(schema.tests.userId, userId)));
  return t ?? null;
}

/** Check the timed question during a test. Stops its clock when it has ≤ 2 errors. */
export async function checkTimedInTest(testId: string, response: Response): Promise<{ solved: boolean; errors: number; seconds?: number; bonus?: number }> {
  const user = await requireUser();
  const test = await ownedTest(user.id, testId);
  if (!test || test.finishedAt) return { solved: false, errors: 0 };
  const [q1] = await db
    .select()
    .from(schema.attempts)
    .where(and(eq(schema.attempts.testId, testId), eq(schema.attempts.questionIndex, 0)));
  if (!q1) return { solved: false, errors: 0 };
  if (test.timedSeconds !== null) return { solved: true, errors: 0, seconds: test.timedSeconds, bonus: timedBonus(test.timedSeconds) };
  const puzzle = puzzleFor(q1);
  const clean = sanitizeResponse(puzzle, response);
  const g = grade(puzzle, clean);
  await db
    .update(schema.attempts)
    .set({ response: JSON.stringify(clean), checks: q1.checks + 1, updatedAt: new Date() })
    .where(eq(schema.attempts.id, q1.id));
  if (!g.solved) return { solved: false, errors: g.errors };
  const seconds = Math.round((Date.now() - test.startedAt.getTime()) / 1000);
  await db.update(schema.tests).set({ timedSeconds: seconds }).where(eq(schema.tests.id, testId));
  return { solved: true, errors: g.errors, seconds, bonus: timedBonus(seconds) };
}

export async function submitTest(testId: string): Promise<void> {
  const user = await requireUser();
  const test = await ownedTest(user.id, testId);
  if (!test) redirect("/codebusters/test");
  if (!test.finishedAt) {
    const rows = await db
      .select()
      .from(schema.attempts)
      .where(eq(schema.attempts.testId, testId))
      .orderBy(asc(schema.attempts.questionIndex));
    const specials = new Set(JSON.parse(test.specials) as number[]);
    const now = new Date();
    let total = 0;
    let specialSolved = 0;
    for (const a of rows) {
      const puzzle = puzzleFor(a);
      const g = grade(puzzle, JSON.parse(a.response) as Response);
      total += g.score;
      if (specials.has(a.questionIndex!) && g.penalty === 0 && g.solved) specialSolved++;
      await db
        .update(schema.attempts)
        .set({
          status: g.solved ? "solved" : "unsolved",
          score: g.score,
          errors: g.errors,
          finishedAt: now,
          elapsedMs: now.getTime() - test.startedAt.getTime(),
        })
        .where(eq(schema.attempts.id, a.id));
    }
    total += (test.timedSeconds !== null ? timedBonus(test.timedSeconds) : 0) + specialBonus(specialSolved);
    await db.update(schema.tests).set({ finishedAt: now, score: total }).where(eq(schema.tests.id, testId));
  }
  redirect(`/codebusters/test/${testId}`);
}

export type { CipherType };
