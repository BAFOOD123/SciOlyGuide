import { lettersOnly, normalizeText, type Language } from "./alphabet.ts";
import { QUOTES_EN, type Quote } from "./data/quotes-en.ts";
import { QUOTES_ES } from "./data/quotes-es.ts";
import type { Length, Token } from "./types.ts";
import type { Rng } from "./rng.ts";

export interface LengthRange {
  min: number;
  max: number;
}

export function lengthRange(length: Length | undefined, ranges: Record<Length, LengthRange>): LengthRange {
  return ranges[length ?? "medium"];
}

/** Pick a quote whose letter count is within range; widen the range if nothing fits. */
export function pickQuote(rng: Rng, lang: Language, range: LengthRange, accept?: (q: Quote) => boolean): Quote {
  const pool = lang === "es" ? QUOTES_ES : QUOTES_EN;
  let { min, max } = range;
  for (let widen = 0; widen < 20; widen++) {
    const fits = pool.filter((q) => {
      const n = lettersOnly(q.text, lang).length;
      return n >= min && n <= max && (!accept || accept(q));
    });
    if (fits.length) return rng.pick(fits);
    min = Math.max(1, min - 10);
    max += 15;
  }
  return rng.pick(pool);
}

export function attributionOf(q: Quote): string | undefined {
  return q.author;
}

/**
 * Turn plaintext into aligned tokens. `encode(letter, index)` returns the cipher
 * unit for the index-th plaintext letter. Spaces/punctuation are kept when
 * `wordBreaks` is true; otherwise letters are grouped in `groupSize` blocks.
 */
export function alignedTokens(
  plaintext: string,
  lang: Language,
  encode: (letter: string, index: number) => string,
  opts: { wordBreaks: boolean; groupSize?: number; alphabet: readonly string[] },
): { tokens: Token[]; letters: string[] } {
  const alpha = new Set(opts.alphabet);
  const tokens: Token[] = [];
  const letters: string[] = [];
  const text = normalizeText(plaintext, lang);
  if (opts.wordBreaks) {
    let lastWasSpace = true;
    for (const ch of text) {
      if (alpha.has(ch)) {
        tokens.push({ k: "c", t: encode(ch, letters.length), a: letters.length });
        letters.push(ch);
        lastWasSpace = false;
      } else if (/\s/.test(ch)) {
        if (!lastWasSpace) tokens.push({ k: "s" });
        lastWasSpace = true;
      } else {
        tokens.push({ k: "p", t: ch });
        lastWasSpace = false;
      }
    }
  } else {
    const size = opts.groupSize ?? 5;
    for (const ch of text) {
      if (!alpha.has(ch)) continue;
      if (letters.length > 0 && letters.length % size === 0) tokens.push({ k: "s" });
      tokens.push({ k: "c", t: encode(ch, letters.length), a: letters.length });
      letters.push(ch);
    }
  }
  return { tokens, letters };
}

/** Words of the plaintext (letters only) with their starting letter index. */
export function wordsWithIndex(plaintext: string, lang: Language): { word: string; start: number }[] {
  const out: { word: string; start: number }[] = [];
  let idx = 0;
  for (const raw of normalizeText(plaintext, lang).split(/\s+/)) {
    const w = lettersOnly(raw, lang).join("");
    if (w) {
      out.push({ word: w, start: idx });
      idx += w.length;
    }
  }
  return out;
}

/** Choose a crib word (prefer 4–8 letters). */
export function pickCribWord(rng: Rng, plaintext: string, lang: Language, minLen = 4): { word: string; start: number } {
  const words = wordsWithIndex(plaintext, lang);
  const good = words.filter((w) => w.word.length >= minLen && w.word.length <= 9);
  if (good.length) return rng.pick(good);
  return words.reduce((a, b) => (b.word.length > a.word.length ? b : a));
}

/** Mark tokens whose answer index lies in [start, end) as crib. */
export function markCrib(tokens: Token[], start: number, end: number): void {
  for (const t of tokens) {
    if (t.k === "c" && t.a !== undefined && t.a >= start && t.a < end) t.crib = true;
  }
}
