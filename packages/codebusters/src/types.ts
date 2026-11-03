import type { Language } from "./alphabet.ts";

export type CipherType =
  | "aristocrat"
  | "patristocrat"
  | "xenocrypt"
  | "baconian"
  | "fractionated-morse"
  | "cryptarithm"
  | "porta"
  | "columnar"
  | "nihilist"
  | "checkerboard"
  | "homophonic";

export type Level = "regional" | "state";
export type Mode = "decode" | "cryptanalysis" | "keyword";
export type KeyAlphabet = "random" | "k1" | "k2" | "k3";
export type HintLevel = "none" | "word" | "letters";
export type Length = "short" | "medium" | "long";

/** All options are optional; each generator reads the ones it understands. */
export interface PuzzleOptions {
  mode?: Mode;
  alphabet?: KeyAlphabet;
  hint?: HintLevel;
  length?: Length;
  /** Baconian: how A/B are disguised. */
  symbols?: "letters" | "symbols";
  /** Keep word breaks in ciphertext where the cipher allows it. */
  wordBreaks?: boolean;
  /** Mark as the timed question (aristocrat only). */
  timed?: boolean;
}

export interface PuzzleSpec {
  type: CipherType;
  seed: number;
  options: PuzzleOptions;
}

/**
 * A rendered ciphertext stream.
 *  c = cipher unit (letter, number, symbol group, letter pair) with optional
 *      answer index (aligned layouts put an answer box under it)
 *  s = word space
 *  p = punctuation / literal shown as-is
 */
export type Token =
  | { k: "c"; t: string; a?: number; crib?: boolean }
  | { k: "s" }
  | { k: "p"; t: string };

export type ToolId =
  | "frequency"
  | "plain-cipher-table"
  | "baconian-ab"
  | "morse-trigraphs"
  | "porta-table"
  | "polybius-builder"
  | "columnar-grid"
  | "homophonic-table"
  | "cryptarithm-digits"
  | "morse-table"
  | "baconian-table";

export interface Display {
  /** aligned: answer box under each cipher unit; separate: answer grid below the ciphertext. */
  layout: "aligned" | "separate";
  tokens: Token[];
  unit: "letter" | "number" | "group" | "pair";
  /** Typing a plaintext letter under a unit fills every identical unit (assist mode). */
  propagate: boolean;
  answerLength: number;
  /** Letters accepted in answer boxes. */
  answerAlphabet: string[];
  /** Units counted in the frequency table, in display order. */
  cipherAlphabet?: string[];
  /** Extra lines rendered verbatim (cryptarithm equation). */
  lines?: string[];
  given: { label: string; value: string }[];
  tools: ToolId[];
  lang: Language;
}

export interface Answer {
  /** plaintext: graded on the answer boxes. keyword/word: graded on the final field. */
  kind: "plaintext" | "keyword" | "word";
  value: string[];
  /** Errors allowed before the 100-point-per-error penalty applies. */
  freeErrors: number;
  /** Label for the final-answer field. */
  label?: string;
}

export interface Puzzle {
  spec: PuzzleSpec;
  type: CipherType;
  title: string;
  prompt: string;
  display: Display;
  answer: Answer;
  points: number;
  /** Original text, for revealing after the attempt. */
  plaintext: string;
  attribution?: string;
  /** Solution details revealed after the attempt (keys, alphabets, …). */
  solution: { label: string; value: string }[];
}

export interface Response {
  /** One entry per answer box ('' = blank). */
  plain: string[];
  /** Final answer field for keyword/word questions. */
  final?: string;
}

export interface Grade {
  errors: number;
  /** Answer-box indices that are wrong or blank (plaintext questions). */
  wrong: number[];
  penalty: number;
  score: number;
  solved: boolean;
}
