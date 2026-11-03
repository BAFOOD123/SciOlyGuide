import type { CipherType, Display, Response } from "@sciolyguide/codebusters";

/** What the browser receives: the puzzle minus its answer. */
export interface PublicPuzzle {
  type: CipherType;
  title: string;
  prompt: string;
  display: Display;
  points: number;
  answer: { kind: "plaintext" | "keyword" | "word"; freeErrors: number; label?: string; length: number };
}

export interface Reveal {
  plaintext: string;
  attribution?: string;
  solution: { label: string; value: string }[];
  expected: string[];
  wrong: number[];
}

export interface CheckResult {
  solved: boolean;
  errors: number;
  score: number;
  points: number;
  /** Timed question bonus, when applicable. */
  bonus?: number;
  elapsedMs?: number;
  reveal?: Reveal;
  error?: string;
}

export type ToolNotes = Record<string, unknown>;

export interface AttemptState {
  id: string;
  status: "active" | "solved" | "unsolved" | "revealed" | "skipped";
  response: Response;
  notes: ToolNotes;
  elapsedMs: number;
  checks: number;
  hints: number;
  hinted: number[];
  score: number | null;
  errors: number | null;
}
