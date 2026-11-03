import { EN, lettersOnly } from "../alphabet.ts";
import { Rng } from "../rng.ts";
import { SCORING } from "../scoring.ts";
import { lengthRange, markCrib, pickCribWord, pickQuote } from "../text.ts";
import type { Puzzle, PuzzleSpec, Token } from "../types.ts";

/** 24-letter Baconian alphabet: I/J and U/V share codes. */
export const BACON24 = "ABCDEFGHIKLMNOPQRSTUWXYZ".split("");

export function baconCode(letter: string): string {
  const l = letter === "J" ? "I" : letter === "V" ? "U" : letter;
  const i = BACON24.indexOf(l);
  if (i < 0) throw new Error(`not a Baconian letter: ${letter}`);
  return i.toString(2).padStart(5, "0").replace(/0/g, "A").replace(/1/g, "B");
}

export function baconDecode(code: string): string | undefined {
  if (!/^[AB]{5}$/.test(code)) return undefined;
  return BACON24[parseInt(code.replace(/A/g, "0").replace(/B/g, "1"), 2)];
}

const SYMBOL_SETS: readonly [string[], string[]][] = [
  [["●"], ["○"]],
  [["▲", "▼"], ["■", "□"]],
  [["♠", "♣"], ["♥", "♦"]],
  [["↑", "→"], ["↓", "←"]],
  [["+"], ["×"]],
  [["☀", "☁"], ["☂", "☃"]],
];

type LetterRule = { name: string; isA: (c: string) => boolean };
const LETTER_RULES: readonly LetterRule[] = [
  { name: "A–M vs N–Z", isA: (c) => c <= "M" },
  { name: "vowels vs consonants", isA: (c) => "AEIOUY".includes(c) },
  { name: "odd vs even alphabet position", isA: (c) => EN.indexOf(c) % 2 === 0 },
];

const RANGES = { short: { min: 10, max: 20 }, medium: { min: 18, max: 30 }, long: { min: 28, max: 42 } };

export function generateBaconian(spec: PuzzleSpec): Puzzle {
  const rng = new Rng(spec.seed);
  const o = spec.options;
  const quote = pickQuote(rng, "en", lengthRange(o.length, RANGES));
  const letters = lettersOnly(quote.text).map((c) => (c === "J" ? "I" : c === "V" ? "U" : c));
  const style = o.symbols ?? "symbols";

  let aSyms: string[];
  let bSyms: string[];
  let schemeDesc: string;
  if (style === "letters") {
    const rule = rng.pick(LETTER_RULES);
    const swap = rng.next() < 0.5;
    aSyms = EN.filter((c) => rule.isA(c) !== swap);
    bSyms = EN.filter((c) => rule.isA(c) === swap);
    schemeDesc = `Letters split by ${rule.name}${swap ? " (swapped)" : ""}`;
  } else {
    const [x, y] = rng.pick(SYMBOL_SETS);
    [aSyms, bSyms] = rng.next() < 0.5 ? [x, y] : [y, x];
    schemeDesc = `A = ${aSyms.join(" ")}   B = ${bSyms.join(" ")}`;
  }

  const tokens: Token[] = letters.map((l, i) => {
    const group = [...baconCode(l)].map((bit) => rng.pick(bit === "A" ? aSyms : bSyms)).join("");
    return { k: "c", t: group, a: i };
  });

  const crib = pickCribWord(rng, quote.text, "en", 3);
  markCrib(tokens, crib.start, crib.start + crib.word.length);

  return {
    spec,
    type: "baconian",
    title: "Baconian",
    prompt: `Decode this Baconian cipher${quote.author ? ` of a quote by ${quote.author}` : ""}. The highlighted groups decode to ${crib.word}.`,
    display: {
      layout: "aligned",
      tokens,
      unit: "group",
      propagate: false,
      answerLength: letters.length,
      answerAlphabet: EN,
      given: [{ label: "Crib", value: `${crib.word} (highlighted)` }],
      tools: ["baconian-ab", "baconian-table"],
      lang: "en",
    },
    answer: { kind: "plaintext", value: letters, freeErrors: SCORING.freeErrors },
    points: style === "letters" ? 300 : 250,
    plaintext: quote.text,
    attribution: quote.author,
    solution: [{ label: "Scheme", value: schemeDesc }],
  };
}
