"use server";

import { newId, requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { systemOfTopic, type QuizMode } from "@/lib/anatomy-questions";

export interface AnatomyRunItem {
  topic: string;
  /** Whether the student actually answered this question (vs. left it blank). */
  answered: boolean;
  correct: boolean;
}

/**
 * Save a finished Anatomy quiz to the student's account: one run row plus one
 * answer row per answered question. The score counts correct answers out of the
 * whole set (blanks count against a timed test); per-topic accuracy only uses
 * questions that were actually answered.
 */
export async function saveAnatomyRun(input: { mode: QuizMode; items: AnatomyRunItem[] }): Promise<void> {
  const user = await requireUser();
  const mode: QuizMode = input.mode === "test" ? "test" : "practice";
  const items = (input.items ?? []).filter((it) => it && typeof it.topic === "string" && systemOfTopic(it.topic)).slice(0, 200);
  if (!items.length) return;

  const total = items.length;
  const score = items.filter((it) => it.correct).length;
  const topics = [...new Set(items.map((it) => it.topic))];
  const now = new Date();
  const runId = newId();

  await db.insert(schema.anatomyRuns).values({
    id: runId,
    userId: user.id,
    mode,
    topics: JSON.stringify(topics),
    total,
    score,
    finishedAt: now,
  });

  const answered = items.filter((it) => it.answered);
  if (answered.length) {
    await db.insert(schema.anatomyAnswers).values(
      answered.map((it) => ({
        id: newId(),
        userId: user.id,
        runId,
        topic: it.topic,
        correct: !!it.correct,
        answeredAt: now,
      })),
    );
  }
}
