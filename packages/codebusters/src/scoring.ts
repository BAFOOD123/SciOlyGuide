import type { Answer, Grade, Puzzle, Response } from "./types.ts";

/**
 * 2027 scoring constants. Taken from the published 2027 Codebusters rules as
 * summarized by scio.ly/docs/codebusters. Verify against the official rules
 * manual each season and update here; every score in the app derives from it.
 */
export const SCORING = {
  /** Errors allowed on plaintext answers before penalties. */
  freeErrors: 2,
  /** Keyword / cryptarithm answers must be exact. */
  freeErrorsExact: 0,
  penaltyPerError: 100,
  /** Timed question: bonus = perSecond × (limit − seconds), if solved within limit. */
  timedBonusPerSecond: 2,
  timedLimitSeconds: 600,
  /** Special bonus points by number of special-bonus questions solved with no penalty. */
  specialBonus: [0, 150, 400, 750] as const,
  testMinutes: 50,
} as const;

export function normalizeAnswerLetter(ch: string, alphabet25 = false): string {
  const raw = ch.trim().toUpperCase();
  // Keep Ñ intact (NFD would split it into N + combining tilde).
  const out = raw === "Ñ" ? "Ñ" : raw.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return alphabet25 && out === "J" ? "I" : out;
}

function countKeywordErrors(expected: string[], given: string): number {
  const g = [...given.toUpperCase().replace(/[^A-ZÑ]/g, "")];
  let errors = Math.abs(g.length - expected.length);
  for (let i = 0; i < Math.min(g.length, expected.length); i++) {
    if (g[i] !== expected[i]) errors++;
  }
  return errors;
}

export function gradeAnswer(answer: Answer, points: number, response: Response, equiv?: (c: string) => string): Grade {
  const norm = equiv ?? ((c: string) => c);
  let errors = 0;
  const wrong: number[] = [];
  if (answer.kind === "plaintext") {
    answer.value.forEach((expected, i) => {
      const got = norm(normalizeAnswerLetter(response.plain[i] ?? ""));
      if (got !== norm(expected)) {
        errors++;
        wrong.push(i);
      }
    });
  } else {
    errors = countKeywordErrors(answer.value.map(norm), [...(response.final ?? "")].map((c) => norm(normalizeAnswerLetter(c))).join(""));
  }
  const penalty = Math.max(0, errors - answer.freeErrors) * SCORING.penaltyPerError;
  const score = Math.max(0, points - penalty);
  return { errors, wrong, penalty, score, solved: errors <= answer.freeErrors };
}

/** Letter equivalence for ciphers that merge letters (I/J, U/V). */
export function equivalenceFor(puzzle: Puzzle): ((c: string) => string) | undefined {
  switch (puzzle.type) {
    case "baconian":
      return (c) => (c === "J" ? "I" : c === "V" ? "U" : c);
    case "nihilist":
    case "checkerboard":
    case "homophonic":
      return (c) => (c === "J" ? "I" : c);
    default:
      return undefined;
  }
}

export function grade(puzzle: Puzzle, response: Response): Grade {
  return gradeAnswer(puzzle.answer, puzzle.points, response, equivalenceFor(puzzle));
}

export function timedBonus(seconds: number): number {
  if (seconds >= SCORING.timedLimitSeconds) return 0;
  return Math.round(SCORING.timedBonusPerSecond * (SCORING.timedLimitSeconds - seconds));
}

export function specialBonus(solvedSpecials: number): number {
  const table = SCORING.specialBonus;
  return table[Math.min(solvedSpecials, table.length - 1)]!;
}
