import { EN, groupsOf, lettersOnly } from "../alphabet.ts";
import { Rng } from "../rng.ts";
import { SCORING } from "../scoring.ts";
import { lengthRange, pickCribWord, pickQuote } from "../text.ts";
import type { Puzzle, PuzzleSpec, Token } from "../types.ts";

/**
 * Complete columnar transposition: write plaintext in rows of `cols` (padding
 * with X to fill the last row), then read the columns in `order`.
 * `order[j]` is the original column index read j-th.
 */
export function columnarEncrypt(letters: readonly string[], order: readonly number[]): string[] {
  const cols = order.length;
  const padded = letters.slice();
  while (padded.length % cols !== 0) padded.push("X");
  const rows = padded.length / cols;
  const out: string[] = [];
  for (const c of order) for (let r = 0; r < rows; r++) out.push(padded[r * cols + c]!);
  return out;
}

export function columnarDecrypt(cipher: readonly string[], order: readonly number[]): string[] {
  const cols = order.length;
  const rows = cipher.length / cols;
  const grid: string[] = new Array(cipher.length);
  order.forEach((c, j) => {
    for (let r = 0; r < rows; r++) grid[r * cols + c] = cipher[j * rows + r]!;
  });
  return grid;
}

const RANGES = { short: { min: 20, max: 35 }, medium: { min: 30, max: 50 }, long: { min: 45, max: 70 } };

export function generateColumnar(spec: PuzzleSpec): Puzzle {
  const rng = new Rng(spec.seed);
  const o = spec.options;
  const quote = pickQuote(rng, "en", lengthRange(o.length, RANGES));
  const letters = lettersOnly(quote.text);
  const maxCols = o.length === "short" ? 5 : o.length === "long" ? 9 : 7;
  const cols = rng.range(3, maxCols);
  const order = rng.shuffle(Array.from({ length: cols }, (_, i) => i));
  const cipher = columnarEncrypt(letters, order);
  const crib = pickCribWord(rng, quote.text, "en", 4);

  const tokens: Token[] = [];
  groupsOf(cipher, 5).forEach((g, gi) => {
    if (gi > 0) tokens.push({ k: "s" });
    for (const c of g) tokens.push({ k: "c", t: c });
  });

  const given: Puzzle["display"]["given"] = [{ label: "Crib", value: crib.word }];
  if (o.hint !== "none") given.push({ label: "Columns", value: o.hint === "letters" ? `${cols}` : `between 3 and ${maxCols}` });

  return {
    spec,
    type: "columnar",
    title: "Complete Columnar",
    prompt: `Cryptanalyze this Complete Columnar transposition${quote.author ? ` of a quote by ${quote.author}` : ""}. The plaintext contains ${crib.word}. Padding X's at the end are not part of the answer.`,
    display: {
      layout: "separate",
      tokens,
      unit: "letter",
      propagate: false,
      answerLength: letters.length,
      answerAlphabet: EN,
      given,
      tools: ["columnar-grid"],
      lang: "en",
    },
    answer: { kind: "plaintext", value: letters, freeErrors: SCORING.freeErrors },
    points: 300 + (cols - 3) * 25,
    plaintext: quote.text,
    attribution: quote.author,
    solution: [
      { label: "Columns", value: String(cols) },
      { label: "Read order", value: order.map((c) => c + 1).join(" ") },
    ],
  };
}
