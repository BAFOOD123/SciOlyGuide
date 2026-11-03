import { EN, keyedAlphabet, lettersOnly } from "../alphabet.ts";
import { Rng } from "../rng.ts";
import { SCORING } from "../scoring.ts";
import { lengthRange, pickQuote, wordsWithIndex } from "../text.ts";
import type { Puzzle, PuzzleSpec, Token } from "../types.ts";
import { pickKeyword } from "./monoalphabetic.ts";

export const MORSE: Readonly<Record<string, string>> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..",
  J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
};
const FROM_MORSE = new Map(Object.entries(MORSE).map(([k, v]) => [v, k]));

/** The 26 trigraphs in standard order (• – ×), excluding ×××. */
export const TRIGRAPHS: readonly string[] = (() => {
  const s = [".", "-", "x"];
  const out: string[] = [];
  for (const a of s) for (const b of s) for (const c of s) if (a + b + c !== "xxx") out.push(a + b + c);
  return out;
})();

/** Plaintext → Morse with x between letters and xx between words, padded to a multiple of 3. */
export function toFractionatedMorse(text: string): string {
  const words = wordsWithIndex(text, "en").map((w) => w.word);
  let s = words.map((w) => [...w].map((c) => MORSE[c]).join("x")).join("xx");
  while (s.length % 3 !== 0) s += "x";
  return s;
}

/** Decode a Morse stream (with x separators) back to letters and spaces. */
export function decodeMorseStream(stream: string): string {
  return stream
    .replace(/x+$/, "")
    .split("xx")
    .map((w) => w.split("x").map((m) => FROM_MORSE.get(m) ?? "?").join(""))
    .join(" ");
}

const RANGES = { short: { min: 20, max: 35 }, medium: { min: 30, max: 50 }, long: { min: 45, max: 70 } };

export function generateFractionatedMorse(spec: PuzzleSpec): Puzzle {
  const rng = new Rng(spec.seed);
  const o = spec.options;
  const quote = pickQuote(rng, "en", lengthRange(o.length, RANGES));
  const keyword = pickKeyword(rng, "en", false);
  const keyed = keyedAlphabet(keyword, EN);
  const toLetter = new Map(TRIGRAPHS.map((t, i) => [t, keyed[i]!]));
  const stream = toFractionatedMorse(quote.text);
  const letters = lettersOnly(quote.text);

  const tokens: Token[] = [];
  for (let i = 0; i < stream.length; i += 3) tokens.push({ k: "c", t: toLetter.get(stream.slice(i, i + 3))! });

  // Crib: a plaintext word of 4+ letters; mark the cipher letters that cover its Morse.
  const words = wordsWithIndex(quote.text, "en");
  const candidates = words.filter((w) => w.word.length >= 4);
  const crib = candidates.length ? rng.pick(candidates) : words.reduce((a, b) => (b.word.length > a.word.length ? b : a));
  // Locate the crib inside the Morse stream.
  let pos = 0;
  let cribStart = 0;
  let cribEnd = 0;
  for (let wi = 0; wi < words.length; wi++) {
    const morseWord = [...words[wi]!.word].map((c) => MORSE[c]).join("x");
    if (words[wi] === crib) {
      cribStart = pos;
      cribEnd = pos + morseWord.length;
    }
    pos += morseWord.length + 2;
  }
  for (let t = Math.floor(cribStart / 3); t <= Math.floor((cribEnd - 1) / 3); t++) {
    const tok = tokens[t];
    if (tok && tok.k === "c") tok.crib = true;
  }

  return {
    spec,
    type: "fractionated-morse",
    title: "Fractionated Morse",
    prompt: `Solve this Fractionated Morse cipher${quote.author ? ` of a quote by ${quote.author}` : ""}. The highlighted letters contain the Morse for ${crib.word}.`,
    display: {
      layout: "separate",
      tokens,
      unit: "letter",
      propagate: false,
      answerLength: letters.length,
      answerAlphabet: EN,
      cipherAlphabet: EN,
      given: [{ label: "Crib", value: `${crib.word} (its Morse falls in the highlighted letters)` }],
      tools: ["morse-trigraphs", "frequency", "morse-table"],
      lang: "en",
    },
    answer: { kind: "plaintext", value: letters, freeErrors: SCORING.freeErrors },
    points: 350,
    plaintext: quote.text,
    attribution: quote.author,
    solution: [
      { label: "Keyword", value: keyword },
      { label: "Trigraph table", value: TRIGRAPHS.map((t, i) => `${keyed[i]}=${t}`).join("  ") },
    ],
  };
}
