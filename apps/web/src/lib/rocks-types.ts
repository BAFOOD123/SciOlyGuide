import type { Question, QResponse, Skill } from "@sciolyguide/rocks-minerals";

/** What the browser gets: the question without its answer or explanation. */
export type PublicQuestion = Pick<Question, "skill" | "specimenId" | "prompt" | "clues" | "kind" | "choices" | "items">;

export function toPublicQuestion(q: Question): PublicQuestion {
  return { skill: q.skill, specimenId: q.specimenId, prompt: q.prompt, clues: q.clues, kind: q.kind, choices: q.choices, items: q.items };
}

export interface Feedback {
  correct: boolean;
  correctText: string;
  explanation: string;
  specimenId?: string;
}

export interface ReviewItem {
  question: PublicQuestion;
  response: QResponse | null;
  feedback: Feedback;
  station?: number;
}

export interface SessionView {
  id: string;
  mode: "practice" | "stations";
  questions: PublicQuestion[];
  /** Station number (0-based) of each question, for station tests. */
  stationOf: number[];
  stationCount: number;
  stationSeconds: number | null;
  startedAt: number;
  responses: (QResponse | null)[];
  /** Practice: feedback for questions already answered. */
  feedback: (Feedback | null)[];
  finished: boolean;
}

export interface SpecimenStat {
  id: string;
  answered: number;
  correct: number;
}

export interface RmStats {
  answered: number;
  accuracy: number | null;
  mastered: number;
  bySpecimen: Record<string, SpecimenStat>;
  bySkill: Partial<Record<Skill, { answered: number; correct: number }>>;
  weakest: string[];
  dueCards: number;
  newCards: number;
  recent: { id: string; mode: string; score: number | null; maxScore: number; finishedAt: number | null; startedAt: number }[];
}

/** Leitner intervals in days for boxes 1–5. */
export const BOX_DAYS = [0, 1, 3, 7, 21] as const;

export function masteryOf(s: SpecimenStat | undefined): "new" | "learning" | "mastered" {
  if (!s || s.answered === 0) return "new";
  return s.answered >= 3 && s.correct / s.answered >= 0.8 ? "mastered" : "learning";
}
