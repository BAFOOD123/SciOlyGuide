import { EN } from "../alphabet.ts";
import { Rng } from "../rng.ts";
import { SCORING } from "../scoring.ts";
import { alignedTokens, lengthRange, markCrib, pickCribWord, pickQuote } from "../text.ts";
import type { Puzzle, PuzzleSpec } from "../types.ts";
import { pickKeyword } from "./monoalphabetic.ts";

/** Porta is reciprocal: the same function encrypts and decrypts. */
export function portaLetter(letter: string, keyLetter: string): string {
  const i = EN.indexOf(letter);
  const k = Math.floor(EN.indexOf(keyLetter) / 2);
  if (i < 13) return EN[13 + ((i - k + 13) % 13)]!;
  return EN[(i - 13 + k) % 13]!;
}

/** Rows of the standard Porta tableau: key pair → 13-letter row under A–M. */
export function portaTable(): { keys: string; row: string }[] {
  const out: { keys: string; row: string }[] = [];
  for (let k = 0; k < 13; k++) {
    const keys = EN[2 * k]! + EN[2 * k + 1]!;
    out.push({ keys, row: EN.slice(0, 13).map((p) => portaLetter(p, keys[0]!)).join("") });
  }
  return out;
}

const RANGES = { short: { min: 30, max: 55 }, medium: { min: 50, max: 85 }, long: { min: 80, max: 120 } };

export function generatePorta(spec: PuzzleSpec): Puzzle {
  const rng = new Rng(spec.seed);
  const o = spec.options;
  const mode = o.mode === "cryptanalysis" ? "cryptanalysis" : "decode";
  const quote = pickQuote(rng, "en", lengthRange(o.length, RANGES));
  let keyword = pickKeyword(rng, "en", false);
  if (mode === "cryptanalysis") keyword = keyword.slice(0, rng.range(4, Math.min(6, keyword.length)));
  const wordBreaks = o.wordBreaks ?? true;
  const { tokens, letters } = alignedTokens(
    quote.text,
    "en",
    (p, i) => portaLetter(p, keyword[i % keyword.length]!),
    { wordBreaks, alphabet: EN },
  );

  const given: Puzzle["display"]["given"] = [];
  let prompt: string;
  if (mode === "decode") {
    given.push({ label: "Keyword", value: keyword });
    prompt = `Decode this Porta cipher${quote.author ? ` of a quote by ${quote.author}` : ""} using the keyword ${keyword}.`;
  } else {
    const crib = pickCribWord(rng, quote.text, "en", Math.max(4, keyword.length));
    markCrib(tokens, crib.start, crib.start + crib.word.length);
    given.push({ label: "Crib", value: `${crib.word} (highlighted)` });
    given.push({ label: "Keyword length", value: `${keyword.length} letters` });
    prompt = `Cryptanalyze this Porta cipher. The highlighted letters decode to ${crib.word}.`;
  }

  return {
    spec,
    type: "porta",
    title: mode === "decode" ? "Porta" : "Porta — Cryptanalysis",
    prompt,
    display: {
      layout: "aligned",
      tokens,
      unit: "letter",
      propagate: false,
      answerLength: letters.length,
      answerAlphabet: EN,
      given,
      tools: ["porta-table"],
      lang: "en",
    },
    answer: { kind: "plaintext", value: letters, freeErrors: SCORING.freeErrors },
    points: mode === "decode" ? 225 : 400,
    plaintext: quote.text,
    attribution: quote.author,
    solution: [{ label: "Keyword", value: keyword }],
  };
}
