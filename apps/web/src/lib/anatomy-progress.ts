import "server-only";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "./db";
import { computeAnatomyStats, type AnatomyStats } from "./anatomy-questions";

/** Aggregate a student's saved Anatomy & Physiology runs into dashboard stats. */
export async function getAnatomyStats(userId: string): Promise<AnatomyStats> {
  const [runs, answers] = await Promise.all([
    db
      .select({
        mode: schema.anatomyRuns.mode,
        total: schema.anatomyRuns.total,
        score: schema.anatomyRuns.score,
        finishedAt: schema.anatomyRuns.finishedAt,
      })
      .from(schema.anatomyRuns)
      .where(eq(schema.anatomyRuns.userId, userId))
      .orderBy(desc(schema.anatomyRuns.finishedAt))
      .limit(500),
    db
      .select({
        topic: schema.anatomyAnswers.topic,
        correct: schema.anatomyAnswers.correct,
        answeredAt: schema.anatomyAnswers.answeredAt,
      })
      .from(schema.anatomyAnswers)
      .where(eq(schema.anatomyAnswers.userId, userId))
      .orderBy(desc(schema.anatomyAnswers.answeredAt))
      .limit(5000),
  ]);
  return computeAnatomyStats(
    runs.map((r) => ({ mode: r.mode, total: r.total, score: r.score, finishedAt: r.finishedAt.getTime() })),
    answers.map((a) => ({ topic: a.topic, correct: a.correct, at: a.answeredAt.getTime() })),
  );
}

export type { AnatomyStats };
