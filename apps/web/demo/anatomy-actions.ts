/** Demo stand-in for src/app/anatomy-physiology/actions.ts (same names and signatures). */
import { computeAnatomyStats, systemOfTopic, type AnatomyStats, type QuizMode } from "@/lib/anatomy-questions";
import { store } from "./store";

export interface AnatomyRunItem {
  topic: string;
  answered: boolean;
  correct: boolean;
}

export async function saveAnatomyRun(input: { mode: QuizMode; items: AnatomyRunItem[] }): Promise<void> {
  const mode: QuizMode = input.mode === "test" ? "test" : "practice";
  const items = (input.items ?? []).filter((it) => it && typeof it.topic === "string" && systemOfTopic(it.topic)).slice(0, 200);
  if (!items.length) return;
  const total = items.length;
  const score = items.filter((it) => it.correct).length;
  const now = Date.now();
  store.update((s) => {
    s.anatomyRuns = [{ mode, total, score, finishedAt: now }, ...s.anatomyRuns].slice(0, 500);
    const rows = items.filter((it) => it.answered).map((it) => ({ topic: it.topic, correct: !!it.correct, at: now }));
    s.anatomyAnswers = [...rows, ...s.anatomyAnswers].slice(0, 5000);
  });
}

export function demoAnatomyStats(): AnatomyStats {
  const s = store.get();
  return computeAnatomyStats(s.anatomyRuns, s.anatomyAnswers);
}
