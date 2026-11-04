"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  SKILLS,
  SPECIMENS,
  buildPractice,
  buildStationTest,
  type Focus,
  type QResponse,
  type Skill,
} from "@sciolyguide/rocks-minerals";
import { newId, requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { RM_EVENT, feedbackFor, flattenPlan, getOwnedSession, getRmStats, gradeSession } from "@/lib/rocks";
import { nextBox } from "@/lib/rocks-core";
import { BOX_DAYS, type Feedback } from "@/lib/rocks-types";

const FOCI: Focus[] = ["all", "minerals", "rocks", "igneous", "sedimentary", "metamorphic"];
const randomSeed = () => Math.floor(Math.random() * 0xffffffff) >>> 0;

function cleanResponse(r: unknown): QResponse {
  const o = (r ?? {}) as Record<string, unknown>;
  return {
    choice: typeof o.choice === "number" ? o.choice : undefined,
    order: Array.isArray(o.order) ? o.order.filter((x): x is number => typeof x === "number").slice(0, 10) : undefined,
    text: typeof o.text === "string" ? o.text.slice(0, 60) : undefined,
  };
}

export interface PracticeSettings {
  focus: Focus;
  count: number;
  typed?: boolean;
  skillGroup?: string;
}

export async function startRmPractice(settings: PracticeSettings): Promise<void> {
  const user = await requireUser();
  const focus = FOCI.includes(settings.focus) ? settings.focus : "all";
  const count = Math.max(5, Math.min(30, Math.round(settings.count) || 10));
  const skills = settings.skillGroup ? SKILLS.filter((s) => s.group === settings.skillGroup).map((s) => s.skill as Skill) : undefined;
  const stats = await getRmStats(user.id);
  const specs = buildPractice(randomSeed(), { focus, count, typed: !!settings.typed, skills, prefer: stats.weakest });
  const id = newId();
  await db.insert(schema.quizSessions).values({
    id,
    userId: user.id,
    event: RM_EVENT,
    mode: "practice",
    plan: JSON.stringify(specs),
    responses: JSON.stringify(specs.map(() => null)),
    config: JSON.stringify({ focus, count, typed: !!settings.typed, skillGroup: settings.skillGroup ?? null }),
    startedAt: new Date(),
    maxScore: specs.length,
  });
  redirect(`/rocks-and-minerals/quiz/${id}`);
}

export interface StationSettings {
  stations: number;
  /** 0 = untimed (move on when ready). */
  seconds: number;
  typed?: boolean;
}

export async function startRmStations(settings: StationSettings): Promise<void> {
  const user = await requireUser();
  const stations = [10, 15, 20, 25].includes(settings.stations) ? settings.stations : 15;
  const seconds = [0, 60, 90, 120, 180].includes(settings.seconds) ? settings.seconds : 120;
  const plan = buildStationTest(randomSeed(), stations, !!settings.typed);
  const total = plan.stations.reduce((n, s) => n + s.questions.length, 0);
  const now = Date.now();
  const id = newId();
  await db.insert(schema.quizSessions).values({
    id,
    userId: user.id,
    event: RM_EVENT,
    mode: "stations",
    plan: JSON.stringify(plan),
    responses: JSON.stringify(Array.from({ length: total }, () => null)),
    config: JSON.stringify({ stations, seconds, typed: !!settings.typed }),
    stationSeconds: seconds || null,
    startedAt: new Date(now),
    endsAt: seconds ? new Date(now + stations * seconds * 1000) : null,
    maxScore: total,
  });
  redirect(`/rocks-and-minerals/quiz/${id}`);
}

/**
 * Save an answer. Practice returns feedback right away (once per question);
 * station tests just save it until the end.
 */
export async function answerRm(sessionId: string, index: number, response: unknown): Promise<{ ok: boolean; feedback?: Feedback }> {
  const user = await requireUser();
  const s = await getOwnedSession(user.id, sessionId);
  if (!s || s.finishedAt) return { ok: false };
  const { specs } = flattenPlan(s);
  const spec = specs[index];
  if (!spec) return { ok: false };
  const responses = JSON.parse(s.responses) as (QResponse | null)[];
  if (s.mode === "practice" && responses[index]) return { ok: true, feedback: feedbackFor(spec, responses[index]!) };
  if (s.endsAt && Date.now() > s.endsAt.getTime() + 15_000) return { ok: false };
  const r = cleanResponse(response);
  responses[index] = r;
  await db.update(schema.quizSessions).set({ responses: JSON.stringify(responses) }).where(eq(schema.quizSessions.id, sessionId));
  if (s.mode !== "practice") return { ok: true };
  const fb = feedbackFor(spec, r);
  await db.insert(schema.rmAnswers).values({
    id: newId(),
    userId: user.id,
    sessionId,
    specimenId: fb.specimenId ?? null,
    skill: spec.skill,
    correct: fb.correct,
    answeredAt: new Date(),
  });
  return { ok: true, feedback: fb };
}

export async function finishRm(sessionId: string): Promise<void> {
  const user = await requireUser();
  const s = await getOwnedSession(user.id, sessionId);
  if (!s) redirect("/rocks-and-minerals");
  if (!s.finishedAt) {
    const { score, results } = gradeSession(s);
    // Practice answers were recorded as they happened; record station answers now.
    if (s.mode === "stations" && results.length) {
      await db.insert(schema.rmAnswers).values(
        results.map((r) => ({ id: newId(), userId: user.id, sessionId, specimenId: r.specimenId, skill: r.spec.skill, correct: r.correct, answeredAt: new Date() })),
      );
    }
    await db.update(schema.quizSessions).set({ finishedAt: new Date(), score }).where(eq(schema.quizSessions.id, sessionId));
  }
  redirect(`/rocks-and-minerals/quiz/${sessionId}`);
}

/* --------------------------------- Flashcards -------------------------------- */

export async function reviewCard(cardId: string, knew: boolean): Promise<{ box: number; dueAt: number }> {
  const user = await requireUser();
  if (!SPECIMENS.some((s) => s.id === cardId)) return { box: 1, dueAt: Date.now() };
  const where = and(eq(schema.flashcards.userId, user.id), eq(schema.flashcards.cardId, cardId));
  const [card] = await db.select().from(schema.flashcards).where(where);
  const next = nextBox(card?.box, knew, BOX_DAYS);
  const box = next.box;
  const dueAt = new Date(next.dueAt);
  const now = new Date();
  if (card) await db.update(schema.flashcards).set({ box, dueAt, reviews: card.reviews + 1, updatedAt: now }).where(where);
  else await db.insert(schema.flashcards).values({ userId: user.id, cardId, box, dueAt, reviews: 1, updatedAt: now });
  return { box, dueAt: dueAt.getTime() };
}
