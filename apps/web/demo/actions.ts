/**
 * Demo stand-in for src/app/codebusters/actions.ts. Same function names and
 * signatures, so the real client components run unchanged; data goes to the
 * in-browser store instead of the database.
 */
import {
  SCORING,
  buildTest,
  generate,
  grade,
  isCipherType,
  randomSeed,
  specialBonus,
  timedBonus,
  type PuzzleOptions,
  type PuzzleSpec,
  type Response,
} from "@sciolyguide/codebusters";
import type { CheckResult, Reveal } from "@/lib/codebusters-types";
import { emptyResponse, revealOf } from "./helpers";
import { navigate, newId, store, type DemoAttempt } from "./store";

function makeAttempt(kind: DemoAttempt["kind"], spec: PuzzleSpec, extra: Partial<DemoAttempt> = {}): DemoAttempt {
  const p = generate(spec);
  const now = Date.now();
  return {
    id: newId(),
    kind,
    cipherType: spec.type,
    spec,
    status: "active",
    response: emptyResponse(p),
    notes: {},
    points: p.points,
    score: null,
    errors: null,
    checks: 0,
    hints: 0,
    elapsedMs: 0,
    startedAt: now,
    updatedAt: now,
    finishedAt: null,
    ...extra,
  };
}

function skipActive(kind: DemoAttempt["kind"], type?: string) {
  for (const a of store.attempts()) {
    if (a.kind === kind && a.status === "active" && (!type || a.cipherType === type)) {
      store.patchAttempt(a.id, { status: "skipped", finishedAt: Date.now() }, true);
    }
  }
}

export function createPracticeAttempt(type: string, options: PuzzleOptions): DemoAttempt {
  const a = makeAttempt("practice", { type: type as PuzzleSpec["type"], seed: randomSeed(), options });
  // Quiet: this can run while a view renders; navigate() triggers the re-render.
  store.putAttempt(a, true);
  return a;
}

export async function newPractice(type: string, options: unknown): Promise<void> {
  if (!isCipherType(type)) return;
  skipActive("practice", type);
  createPracticeAttempt(type, { ...(options as PuzzleOptions) });
  navigate(`practice-${type}`);
}

export async function saveProgress(attemptId: string, response: Response, elapsedMs: number, notes?: unknown): Promise<{ ok: boolean }> {
  const a = store.get().attempts[attemptId];
  if (!a || a.status !== "active") return { ok: false };
  if (a.testId) {
    const t = store.get().tests[a.testId];
    if (!t || t.finishedAt || Date.now() > t.endsAt + 30_000) return { ok: false };
  }
  const patch: Partial<DemoAttempt> = { response, updatedAt: Date.now() };
  if (a.kind === "practice") patch.elapsedMs = Math.round(elapsedMs);
  if (notes !== undefined) patch.notes = { ...(notes as object), _hinted: (a.notes as { _hinted?: number[] })._hinted };
  store.patchAttempt(attemptId, patch, true);
  return { ok: true };
}

export async function checkAnswer(attemptId: string, response: Response, elapsedMs: number): Promise<CheckResult> {
  const a = store.get().attempts[attemptId];
  if (!a || a.kind === "test") return { solved: false, errors: 0, score: 0, points: 0, error: "Not found" };
  const puzzle = generate(a.spec);
  const g = grade(puzzle, response);
  if (a.status !== "active") return { solved: a.status === "solved", errors: g.errors, score: a.score ?? 0, points: puzzle.points, reveal: revealOf(puzzle, g.wrong) };
  const now = Date.now();
  const elapsed = a.kind === "timed" ? now - a.startedAt : Math.round(elapsedMs);
  const base = { response, checks: a.checks + 1, updatedAt: now, elapsedMs: elapsed };
  if (g.solved) {
    store.patchAttempt(attemptId, { ...base, status: "solved", score: g.score, errors: g.errors, finishedAt: now }, true);
    return {
      solved: true,
      errors: g.errors,
      score: g.score,
      points: puzzle.points,
      bonus: a.kind === "timed" ? timedBonus(elapsed / 1000) : undefined,
      elapsedMs: elapsed,
      reveal: revealOf(puzzle, g.wrong),
    };
  }
  store.patchAttempt(attemptId, { ...base, errors: g.errors }, true);
  return { solved: false, errors: g.errors, score: g.score, points: puzzle.points, elapsedMs: elapsed };
}

export async function revealAnswer(attemptId: string, response: Response, elapsedMs: number): Promise<Reveal | null> {
  const a = store.get().attempts[attemptId];
  if (!a || a.kind === "test") return null;
  const puzzle = generate(a.spec);
  const g = grade(puzzle, response);
  if (a.status === "active") {
    const now = Date.now();
    store.patchAttempt(
      attemptId,
      { status: "revealed", response, errors: g.errors, score: 0, finishedAt: now, updatedAt: now, elapsedMs: a.kind === "timed" ? now - a.startedAt : Math.round(elapsedMs) },
      true,
    );
  }
  return revealOf(puzzle, g.wrong);
}

export async function hintLetter(attemptId: string, index: number): Promise<{ letter: string } | null> {
  const a = store.get().attempts[attemptId];
  if (!a || a.kind !== "practice" || a.status !== "active") return null;
  const puzzle = generate(a.spec);
  if (puzzle.answer.kind !== "plaintext" || index < 0 || index >= puzzle.answer.value.length) return null;
  const hinted = new Set((a.notes as { _hinted?: number[] })._hinted ?? []);
  if (!hinted.has(index)) {
    hinted.add(index);
    store.patchAttempt(attemptId, { hints: a.hints + 1, notes: { ...a.notes, _hinted: [...hinted] } }, true);
  }
  return { letter: puzzle.answer.value[index]! };
}

export async function startTimed(): Promise<void> {
  skipActive("timed");
  const alphabet = (["random", "random", "k1", "k2"] as const)[Math.floor(Math.random() * 4)];
  store.putAttempt(makeAttempt("timed", { type: "aristocrat", seed: randomSeed(), options: { timed: true, alphabet, length: "medium" } }), true);
  navigate("timed");
}

export async function createTest(level: "regional" | "state"): Promise<void> {
  const seed = randomSeed();
  const plan = buildTest(level, seed);
  const id = newId();
  const now = Date.now();
  plan.specs.forEach((spec, i) => store.putAttempt(makeAttempt("test", spec, { testId: id, questionIndex: i }), true));
  store.putTest({
    id,
    level,
    seed,
    specials: plan.specials,
    startedAt: now,
    endsAt: now + SCORING.testMinutes * 60_000,
    finishedAt: null,
    timedSeconds: null,
    score: null,
    maxScore: plan.specs.reduce((s, spec) => s + generate(spec).points, 0),
  });
  navigate(`test-${id}`);
}

export function testQuestions(testId: string): DemoAttempt[] {
  return store
    .attempts()
    .filter((a) => a.testId === testId)
    .sort((a, b) => (a.questionIndex ?? 0) - (b.questionIndex ?? 0));
}

export async function checkTimedInTest(testId: string, response: Response): Promise<{ solved: boolean; errors: number; seconds?: number; bonus?: number }> {
  const t = store.get().tests[testId];
  if (!t || t.finishedAt) return { solved: false, errors: 0 };
  if (t.timedSeconds !== null) return { solved: true, errors: 0, seconds: t.timedSeconds, bonus: timedBonus(t.timedSeconds) };
  const q1 = testQuestions(testId)[0];
  if (!q1) return { solved: false, errors: 0 };
  const g = grade(generate(q1.spec), response);
  store.patchAttempt(q1.id, { response, checks: q1.checks + 1 }, true);
  if (!g.solved) return { solved: false, errors: g.errors };
  const seconds = Math.round((Date.now() - t.startedAt) / 1000);
  store.patchTest(testId, { timedSeconds: seconds }, true);
  return { solved: true, errors: g.errors, seconds, bonus: timedBonus(seconds) };
}

export async function submitTest(testId: string): Promise<void> {
  const t = store.get().tests[testId];
  if (!t) return;
  if (!t.finishedAt) {
    const now = Date.now();
    const specials = new Set(t.specials);
    let total = 0;
    let specialSolved = 0;
    for (const a of testQuestions(testId)) {
      const g = grade(generate(a.spec), a.response);
      total += g.score;
      if (specials.has(a.questionIndex!) && g.solved && g.penalty === 0) specialSolved++;
      store.patchAttempt(a.id, { status: g.solved ? "solved" : "unsolved", score: g.score, errors: g.errors, finishedAt: now, elapsedMs: now - t.startedAt }, true);
    }
    total += (t.timedSeconds !== null ? timedBonus(t.timedSeconds) : 0) + specialBonus(specialSolved);
    store.patchTest(testId, { finishedAt: now, score: total });
  }
  navigate(`test-${testId}`);
}
