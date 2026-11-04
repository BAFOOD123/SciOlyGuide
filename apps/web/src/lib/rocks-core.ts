/**
 * Pure Rocks and Minerals logic shared by the server (lib/rocks.ts) and the
 * single-file demo build. No database access here.
 */
import {
  SPECIMENS,
  guessMatches,
  lookAlikeChoices,
  photoByKey,
  photoHints,
  photoPool,
  photosFor,
  skillsFor,
  specimenForPhoto,
  specimenFromGuess,
  correctAnswerText,
  generateQuestion,
  isCorrect,
  type Focus,
  type QResponse,
  type QuestionSpec,
  type Skill,
  type StationTest,
} from "@sciolyguide/rocks-minerals";
import {
  masteryOf,
  toPublicQuestion,
  type Feedback,
  type PhotoRef,
  type PhotoResult,
  type RmStats,
  type SessionView,
  type SpecimenStat,
} from "./rocks-types";

export const RM_EVENT = "rocks-and-minerals";

export interface SessionData {
  id: string;
  mode: "practice" | "stations";
  plan: string;
  responses: string;
  stationSeconds: number | null;
  startedAt: number;
  finishedAt: number | null;
}

/** Questions of a session in display order, with their station numbers. */
export function flattenPlan(session: Pick<SessionData, "mode" | "plan">): { specs: QuestionSpec[]; stationOf: number[]; stationCount: number } {
  if (session.mode === "practice") {
    const specs = JSON.parse(session.plan) as QuestionSpec[];
    return { specs, stationOf: specs.map(() => 0), stationCount: 0 };
  }
  const plan = JSON.parse(session.plan) as StationTest;
  const specs: QuestionSpec[] = [];
  const stationOf: number[] = [];
  plan.stations.forEach((st, i) => st.questions.forEach((q) => (specs.push(q), stationOf.push(i))));
  return { specs, stationOf, stationCount: plan.stations.length };
}

export function feedbackFor(spec: QuestionSpec, r: QResponse | null): Feedback {
  const q = generateQuestion(spec);
  return { correct: !!r && isCorrect(q, r), correctText: correctAnswerText(q), explanation: q.explanation, specimenId: q.specimenId };
}

export function buildSessionView(s: SessionData): SessionView {
  const { specs, stationOf, stationCount } = flattenPlan(s);
  const responses = JSON.parse(s.responses) as (QResponse | null)[];
  const finished = !!s.finishedAt;
  return {
    id: s.id,
    mode: s.mode,
    questions: specs.map((sp) => toPublicQuestion(generateQuestion(sp))),
    stationOf,
    stationCount,
    stationSeconds: s.stationSeconds,
    startedAt: s.startedAt,
    responses,
    // Practice shows feedback as you go; station tests only after finishing.
    feedback: specs.map((sp, i) => (finished || (s.mode === "practice" && responses[i]) ? feedbackFor(sp, responses[i] ?? null) : null)),
    finished,
  };
}

/** Grade a whole session: score plus per-question correctness. */
export function gradeSession(s: Pick<SessionData, "mode" | "plan" | "responses">) {
  const { specs } = flattenPlan(s);
  const responses = JSON.parse(s.responses) as (QResponse | null)[];
  const results = specs.map((spec, i) => {
    const q = generateQuestion(spec);
    return { spec, specimenId: q.specimenId ?? null, correct: !!responses[i] && isCorrect(q, responses[i]!) };
  });
  return { score: results.filter((r) => r.correct).length, results };
}

export interface AnswerRow {
  specimenId: string | null;
  skill: string;
  correct: boolean;
  guess?: string | null;
  at?: number;
}

/** Answers must be newest first. */
export function computeRmStats(
  answers: AnswerRow[],
  cardDueAts: number[],
  recent: RmStats["recent"],
  now = Date.now(),
): RmStats {
  const bySpecimen: Record<string, SpecimenStat> = {};
  const bySkill: RmStats["bySkill"] = {};
  let correct = 0;
  for (const a of answers) {
    if (a.correct) correct++;
    const sk = (bySkill[a.skill as keyof typeof bySkill] ??= { answered: 0, correct: 0 });
    sk.answered++;
    if (a.correct) sk.correct++;
    if (!a.specimenId) continue;
    const s = (bySpecimen[a.specimenId] ??= { id: a.specimenId, answered: 0, correct: 0 });
    // Mastery uses the 10 most recent answers per specimen.
    if (s.answered < 10) {
      s.answered++;
      if (a.correct) s.correct++;
    }
  }
  const weakest = Object.values(bySpecimen)
    .filter((s) => s.answered >= 2 && s.correct / s.answered < 0.8)
    .sort((a, b) => a.correct / a.answered - b.correct / b.answered)
    .slice(0, 8)
    .map((s) => s.id);
  const mixups = new Map<string, { actual: string; guessed: string; count: number }>();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const photoToday = { answered: 0, correct: 0 };
  for (const a of answers) {
    if (a.skill !== "photo-id") continue;
    if (a.at !== undefined && a.at >= dayStart.getTime()) {
      photoToday.answered++;
      if (a.correct) photoToday.correct++;
    }
    if (!a.correct && a.guess && a.specimenId && a.guess !== a.specimenId) {
      const k = `${a.specimenId}>${a.guess}`;
      const m = mixups.get(k) ?? { actual: a.specimenId, guessed: a.guess, count: 0 };
      m.count++;
      mixups.set(k, m);
    }
  }
  return {
    confusions: [...mixups.values()].sort((x, y) => y.count - x.count).slice(0, 6),
    photoToday,
    answered: answers.length,
    accuracy: answers.length ? correct / answers.length : null,
    mastered: SPECIMENS.filter((s) => masteryOf(bySpecimen[s.id]) === "mastered").length,
    bySpecimen,
    bySkill,
    weakest,
    dueCards: cardDueAts.filter((d) => d <= now).length,
    newCards: SPECIMENS.length - cardDueAts.length,
    recent,
  };
}

export interface CardRow {
  cardId: string;
  box: number;
  dueAt: number;
}

/** Cards to study now: everything due, then new cards (random order), up to `limit`. */
export function buildDeck(rows: CardRow[], ids: string[], limit = 20, now = Date.now()) {
  const inDeck = new Set(ids);
  const mine = rows.filter((r) => inDeck.has(r.cardId));
  const known = new Set(mine.map((r) => r.cardId));
  const due = mine.filter((r) => r.dueAt <= now).sort((a, b) => a.box - b.box);
  const fresh = ids.filter((id) => !known.has(id)).sort(() => Math.random() - 0.5);
  return [...due.map((r) => ({ id: r.cardId, box: r.box, isNew: false })), ...fresh.map((id) => ({ id, box: 0, isNew: true }))].slice(0, limit);
}

/** Leitner update: knew → next box (a new card starts at box 2); missed → box 1, back in 10 minutes. */
export function nextBox(prevBox: number | undefined, knew: boolean, boxDays: readonly number[], now = Date.now()) {
  const box = knew ? Math.min(5, (prevBox ?? 1) + 1) : 1;
  const dueAt = now + (knew ? boxDays[box - 1]! * 864e5 : 10 * 60_000);
  return { box, dueAt };
}

/* --------------------------------- Photo ID --------------------------------- */

/** Photos for a deck, weighted toward specimens the student hasn't mastered. */
export function weightedPhotoPool(focus: Focus, bySpecimen: Record<string, SpecimenStat>): PhotoRef[] {
  return photoPool(focus).map(({ key, specimenId }) => {
    const st = bySpecimen[specimenId];
    const photo = photoByKey(key)!;
    const m = masteryOf(st);
    // Spread a specimen's weight across its photos so photo-rich specimens don't dominate.
    const per = 1 / Math.max(1, photosFor(specimenId).length);
    const w = m === "new" ? 2 : m === "mastered" ? 0.5 : 1 + 2 * (1 - st!.correct / st!.answered);
    return { key, width: photo.width, height: photo.height, weight: w * per };
  });
}

export function photoChoices(key: string, seed: number): string[] | null {
  const s = specimenForPhoto(key);
  return s ? lookAlikeChoices(s, seed) : null;
}

export function photoHint(key: string, level: number): string | null {
  const s = specimenForPhoto(key);
  if (!s || level < 1 || level > 3) return null;
  return photoHints(s)[level - 1]!;
}

const FOLLOW_UP_EXCLUDE: Skill[] = ["identify-mineral", "identify-rock", "hardness-order", "grade-order", "energy"];

/** Grade a photo guess. `hints` ≥ 2 still reveals the answer but doesn't count toward mastery. */
export function gradePhoto(key: string, guess: string, hints: number, followUp: boolean, seed: number): { result: PhotoResult; guessedId: string | null } | null {
  const s = specimenForPhoto(key);
  const shown = photoByKey(key);
  if (!s || !shown) return null;
  const correct = guessMatches(s, guess);
  const other = correct ? undefined : specimenFromGuess(guess);
  let fu: PhotoResult["followUp"];
  if (followUp) {
    const skills = skillsFor(s).filter((k) => !FOLLOW_UP_EXCLUDE.includes(k));
    // Ask about the specimen, never "which of these…" with it among the choices (it's already revealed).
    for (let k = 0; k < skills.length * 2 && !fu; k++) {
      const spec: QuestionSpec = { skill: skills[(seed + k) % skills.length]!, seed: seed + k, specimenId: s.id };
      const q = generateQuestion(spec);
      if (correctAnswerText(q) !== s.name && !(q.choices ?? []).includes(s.name)) fu = { spec, question: toPublicQuestion(q) };
    }
  }
  return {
    guessedId: other?.id ?? null,
    result: {
      correct,
      counted: correct && hints < 2,
      name: s.name,
      specimenId: s.id,
      tip: s.tip,
      shown,
      photos: photosFor(s.id),
      guessed: other ? { id: other.id, name: other.name, tip: other.tip } : undefined,
      followUp: fu,
    },
  };
}
