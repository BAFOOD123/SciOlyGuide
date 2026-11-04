import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db, schema } from "./db";
import { RM_EVENT, buildDeck, buildSessionView, computeRmStats } from "./rocks-core";
import type { RmStats, SessionView } from "./rocks-types";

export { RM_EVENT, feedbackFor, flattenPlan, gradeSession, weightedPhotoPool } from "./rocks-core";

const toData = (s: schema.QuizSession) => ({
  ...s,
  startedAt: s.startedAt.getTime(),
  finishedAt: s.finishedAt?.getTime() ?? null,
});

export function sessionView(s: schema.QuizSession): SessionView {
  return buildSessionView(toData(s));
}

export async function getRmStats(userId: string): Promise<RmStats> {
  const [answers, cards, sessions] = await Promise.all([
    db
      .select({
        specimenId: schema.rmAnswers.specimenId,
        skill: schema.rmAnswers.skill,
        correct: schema.rmAnswers.correct,
        guess: schema.rmAnswers.guess,
        answeredAt: schema.rmAnswers.answeredAt,
      })
      .from(schema.rmAnswers)
      .where(eq(schema.rmAnswers.userId, userId))
      .orderBy(desc(schema.rmAnswers.answeredAt))
      .limit(5000),
    db.select({ dueAt: schema.flashcards.dueAt }).from(schema.flashcards).where(eq(schema.flashcards.userId, userId)),
    db
      .select()
      .from(schema.quizSessions)
      .where(and(eq(schema.quizSessions.userId, userId), eq(schema.quizSessions.event, RM_EVENT)))
      .orderBy(desc(schema.quizSessions.startedAt))
      .limit(6),
  ]);
  return computeRmStats(
    answers.map((a) => ({ ...a, at: a.answeredAt.getTime() })),
    cards.map((c) => c.dueAt.getTime()),
    sessions.map((s) => ({
      id: s.id,
      mode: s.mode,
      score: s.score,
      maxScore: s.maxScore,
      finishedAt: s.finishedAt?.getTime() ?? null,
      startedAt: s.startedAt.getTime(),
    })),
  );
}

export async function getOwnedSession(userId: string, id: string) {
  const [s] = await db
    .select()
    .from(schema.quizSessions)
    .where(and(eq(schema.quizSessions.id, id), eq(schema.quizSessions.userId, userId)));
  return s ?? null;
}

export async function flashcardDeck(userId: string, ids: string[], limit = 20) {
  const rows = await db.select().from(schema.flashcards).where(eq(schema.flashcards.userId, userId));
  return buildDeck(
    rows.map((r) => ({ cardId: r.cardId, box: r.box, dueAt: r.dueAt.getTime() })),
    ids,
    limit,
  );
}
