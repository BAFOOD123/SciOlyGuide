/** Demo stand-in for src/app/rocks-and-minerals/actions.ts (same names and signatures). */
import { SKILLS, buildPractice, buildStationTest, type Focus, type QResponse, type Skill } from "@sciolyguide/rocks-minerals";
import { computeRmStats, feedbackFor, flattenPlan, gradePhoto, gradeSession, nextBox, photoChoices, photoHint } from "@/lib/rocks-core";
import { BOX_DAYS, type Feedback, type PhotoResult } from "@/lib/rocks-types";
import { navigate, newId, store } from "./store";

const seed = () => Math.floor(Math.random() * 0xffffffff) >>> 0;

export function demoRmStats() {
  const s = store.get();
  const recent = Object.values(s.rmSessions)
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, 6)
    .map((x) => ({ id: x.id, mode: x.mode, score: x.score, maxScore: x.maxScore, finishedAt: x.finishedAt, startedAt: x.startedAt }));
  return computeRmStats(s.rmAnswers, Object.values(s.cards).map((c) => c.dueAt), recent);
}

export async function startRmPractice(settings: { focus: Focus; count: number; typed?: boolean; skillGroup?: string }): Promise<void> {
  const skills = settings.skillGroup ? SKILLS.filter((x) => x.group === settings.skillGroup).map((x) => x.skill as Skill) : undefined;
  const specs = buildPractice(seed(), { focus: settings.focus, count: settings.count, typed: !!settings.typed, skills, prefer: demoRmStats().weakest });
  const id = newId();
  store.update((s) => {
    s.rmSessions[id] = {
      id,
      mode: "practice",
      plan: JSON.stringify(specs),
      responses: JSON.stringify(specs.map(() => null)),
      stationSeconds: null,
      startedAt: Date.now(),
      endsAt: null,
      finishedAt: null,
      score: null,
      maxScore: specs.length,
    };
  }, true);
  navigate(`rocks-quiz-${id}`);
}

export async function startRmStations(settings: { stations: number; seconds: number; typed?: boolean }): Promise<void> {
  const plan = buildStationTest(seed(), settings.stations, !!settings.typed);
  const total = plan.stations.reduce((n, x) => n + x.questions.length, 0);
  const id = newId();
  const now = Date.now();
  store.update((s) => {
    s.rmSessions[id] = {
      id,
      mode: "stations",
      plan: JSON.stringify(plan),
      responses: JSON.stringify(Array.from({ length: total }, () => null)),
      stationSeconds: settings.seconds || null,
      startedAt: now,
      endsAt: settings.seconds ? now + settings.stations * settings.seconds * 1000 : null,
      finishedAt: null,
      score: null,
      maxScore: total,
    };
  }, true);
  navigate(`rocks-quiz-${id}`);
}

export async function answerRm(sessionId: string, index: number, response: QResponse): Promise<{ ok: boolean; feedback?: Feedback }> {
  const sess = store.get().rmSessions[sessionId];
  if (!sess || sess.finishedAt) return { ok: false };
  const spec = flattenPlan(sess).specs[index];
  if (!spec) return { ok: false };
  const responses = JSON.parse(sess.responses) as (QResponse | null)[];
  if (sess.mode === "practice" && responses[index]) return { ok: true, feedback: feedbackFor(spec, responses[index]!) };
  responses[index] = response;
  const fb = sess.mode === "practice" ? feedbackFor(spec, response) : undefined;
  store.update((s) => {
    s.rmSessions[sessionId]!.responses = JSON.stringify(responses);
    if (fb) s.rmAnswers.unshift({ specimenId: fb.specimenId ?? null, skill: spec.skill, correct: fb.correct, at: Date.now() });
  }, true);
  return { ok: true, feedback: fb };
}

export async function finishRm(sessionId: string): Promise<void> {
  const sess = store.get().rmSessions[sessionId];
  if (!sess) return navigate("rocks");
  if (!sess.finishedAt) {
    const { score, results } = gradeSession(sess);
    store.update((s) => {
      if (sess.mode === "stations") for (const r of results) s.rmAnswers.unshift({ specimenId: r.specimenId, skill: r.spec.skill, correct: r.correct, at: Date.now() });
      s.rmSessions[sessionId] = { ...sess, finishedAt: Date.now(), score };
    });
  }
  navigate(`rocks-quiz-${sessionId}`);
}

export async function reviewCard(cardId: string, knew: boolean): Promise<{ box: number; dueAt: number }> {
  const next = nextBox(store.get().cards[cardId]?.box, knew, BOX_DAYS);
  store.update((s) => {
    s.cards[cardId] = next;
  }, true);
  return next;
}

/* ---------------------------------- Photo ID --------------------------------- */

const s32 = () => Math.floor(Math.random() * 0xffffffff) >>> 0;

export async function photoRound(key: string): Promise<{ choices: string[] | null }> {
  return { choices: photoChoices(key, s32()) };
}

export async function photoHintAction(key: string, level: number): Promise<{ hint: string | null }> {
  return { hint: photoHint(key, level) };
}

export async function photoAnswer(key: string, guess: string, hints: number, followUp: boolean): Promise<PhotoResult | null> {
  const graded = gradePhoto(key, guess, hints, followUp, s32());
  if (!graded) return null;
  store.update((s) => {
    s.rmAnswers.unshift({ specimenId: graded.result.specimenId, skill: "photo-id", correct: graded.result.counted, guess: graded.guessedId, at: Date.now() });
  }, true);
  return graded.result;
}

export async function photoFollowUp(spec: { skill: string; seed: number; specimenId?: string }, response: QResponse): Promise<Feedback | null> {
  if (!spec.specimenId) return null;
  const fb = feedbackFor(spec as Parameters<typeof feedbackFor>[0], response);
  store.update((s) => {
    s.rmAnswers.unshift({ specimenId: spec.specimenId!, skill: spec.skill, correct: fb.correct, at: Date.now() });
  }, true);
  return fb;
}
