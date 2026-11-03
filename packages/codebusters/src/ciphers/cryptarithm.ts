import { EN } from "../alphabet.ts";
import { TEN_LETTER_KEYS } from "../data/words.ts";
import { Rng } from "../rng.ts";
import { SCORING } from "../scoring.ts";
import type { Puzzle, PuzzleSpec } from "../types.ts";

/**
 * Count solutions (up to `limit`) of an addition cryptarithm
 * addends[0] + addends[1] + … = result, with distinct digits and no leading zeros.
 */
export function countSolutions(
  addends: readonly string[],
  result: string,
  limit = 2,
  fixed: ReadonlyMap<string, number> = new Map(),
): number {
  const width = result.length;
  const cols: { adds: string[]; res: string }[] = [];
  for (let i = 0; i < width; i++) {
    const adds = addends.map((w) => w[w.length - 1 - i]).filter((c): c is string => !!c);
    cols.push({ adds, res: result[width - 1 - i]! });
  }
  const leading = new Set([...addends, result].filter((w) => w.length > 1).map((w) => w[0]!));
  const value = new Map<string, number>();
  const used = new Array<boolean>(10).fill(false);
  let found = 0;
  for (const [l, d] of fixed) {
    value.set(l, d);
    used[d] = true;
  }

  const assign = (letter: string, d: number) => {
    value.set(letter, d);
    used[d] = true;
  };
  const unassign = (letter: string) => {
    used[value.get(letter)!] = false;
    value.delete(letter);
  };

  const solveCol = (ci: number, carry: number): void => {
    if (found >= limit) return;
    if (ci === width) {
      if (carry === 0) found++;
      return;
    }
    const { adds, res } = cols[ci]!;
    const pending = [...new Set(adds.filter((l) => !value.has(l)))];
    const tryAdd = (pi: number): void => {
      if (found >= limit) return;
      if (pi < pending.length) {
        const l = pending[pi]!;
        for (let d = leading.has(l) ? 1 : 0; d <= 9; d++) {
          if (used[d]) continue;
          assign(l, d);
          tryAdd(pi + 1);
          unassign(l);
        }
        return;
      }
      const sum = adds.reduce((s, l) => s + value.get(l)!, carry);
      const digit = sum % 10;
      const next = Math.floor(sum / 10);
      if (value.has(res)) {
        if (value.get(res) === digit) solveCol(ci + 1, next);
      } else if (!used[digit] && !(digit === 0 && leading.has(res))) {
        assign(res, digit);
        solveCol(ci + 1, next);
        unassign(res);
      }
    };
    tryAdd(0);
  };
  solveCol(0, 0);
  return found;
}

export function generateCryptarithm(spec: PuzzleSpec): Puzzle {
  const rng = new Rng(spec.seed);
  const o = spec.options;
  // Sizes chosen so most random sums are uniquely solvable with ≤ 3 given digits.
  const [count, digitsA] = o.length === "short" ? [2, 5] : o.length === "long" ? [3, 5] : [2, 6];

  for (let attempt = 0; attempt < 500; attempt++) {
    const key = rng.pick(TEN_LETTER_KEYS);
    const toWord = (n: number) => [...String(n)].map((d) => key[Number(d)]!).join("");
    const lo = 10 ** (digitsA - 1);
    const addends = Array.from({ length: count }, () => rng.range(lo, 10 * lo - 1));
    const sum = addends.reduce((s, n) => s + n, 0);
    const words = addends.map(toWord);
    const ws = toWord(sum);
    // At most one digit may be absent; it is then found by elimination.
    const present = new Set(words.join("") + ws);
    if (present.size < 9) continue;

    // Reveal digits (as real tests often do) until the solution is unique.
    const fixed = new Map<string, number>();
    const order = rng.shuffle([...key].map((l, d) => [l, d] as const).filter(([l]) => present.has(l)));
    for (const [l, d] of order) {
      if (countSolutions(words, ws, 2, fixed) === 1) break;
      if (fixed.size >= 3) break;
      fixed.set(l, d);
    }
    if (countSolutions(words, ws, 2, fixed) !== 1) continue;

    const width = ws.length;
    const pad = (w: string) => w.padStart(width, " ");
    const lines = [
      ...words.map((w, i) => `${i === words.length - 1 ? "+" : " "} ${pad(w)}`),
      `  ${"-".repeat(width)}`,
      `  ${pad(ws)}`,
    ];
    const givenDigits = [...fixed].sort((a, b) => a[1] - b[1]).map(([l, d]) => `${l} = ${d}`);
    const given: Puzzle["display"]["given"] = [{ label: "Answer", value: "the letters for 0 1 2 3 4 5 6 7 8 9" }];
    if (givenDigits.length) given.unshift({ label: "Given", value: givenDigits.join(", ") });
    return {
      spec,
      type: "cryptarithm",
      title: "Cryptarithm",
      prompt:
        "Solve this base-10 cryptarithm. Each letter stands for a different digit and no number starts with 0. " +
        "The letters for the digits 0 through 9, in order, spell a word. What is it?",
      display: {
        layout: "separate",
        tokens: [],
        unit: "letter",
        propagate: false,
        answerLength: 10,
        answerAlphabet: EN,
        lines,
        given,
        tools: ["cryptarithm-digits"],
        lang: "en",
      },
      answer: { kind: "word", value: [...key], freeErrors: SCORING.freeErrorsExact, label: "Word for 0123456789" },
      points: (o.length === "short" ? 300 : 350) + (count - 2) * 50 - fixed.size * 25,
      plaintext: key,
      solution: [
        { label: "Equation", value: `${addends.join(" + ")} = ${sum}` },
        { label: "Digits", value: [...key].map((l, d) => `${l}=${d}`).join(" ") },
      ],
    };
  }
  throw new Error("could not generate a unique cryptarithm");
}

export const CRYPTARITHM_LETTERS = EN;
