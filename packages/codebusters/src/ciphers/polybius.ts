import { EN, EN25, hasUniqueLetters, keyedAlphabet, lettersOnly, to25 } from "../alphabet.ts";
import { KEYWORDS_EN } from "../data/words.ts";
import { Rng } from "../rng.ts";
import { SCORING } from "../scoring.ts";
import { alignedTokens, lengthRange, markCrib, pickCribWord, pickQuote, wordsWithIndex } from "../text.ts";
import type { Puzzle, PuzzleSpec } from "../types.ts";
import { pickKeyword } from "./monoalphabetic.ts";

/** 5×5 Polybius square (I/J merged) built from a keyword, row-major. */
export function polybiusSquare(keyword: string): string[] {
  return keyedAlphabet(keyword, EN25);
}

/** Letter → [row, col], both 0-based. */
export function polybiusCoords(square: readonly string[], letter: string): [number, number] {
  const i = square.indexOf(letter === "J" ? "I" : letter);
  if (i < 0) throw new Error(`letter not in square: ${letter}`);
  return [Math.floor(i / 5), i % 5];
}

function num(square: readonly string[], letter: string): number {
  const [r, c] = polybiusCoords(square, letter);
  return (r + 1) * 10 + (c + 1);
}

/* ---------------------------------- Nihilist --------------------------------- */

const NIHILIST_RANGES = { short: { min: 20, max: 40 }, medium: { min: 35, max: 60 }, long: { min: 55, max: 90 } };

export function generateNihilist(spec: PuzzleSpec): Puzzle {
  const rng = new Rng(spec.seed);
  const o = spec.options;
  const mode = o.mode === "cryptanalysis" ? "cryptanalysis" : "decode";
  const quote = pickQuote(rng, "en", lengthRange(o.length, NIHILIST_RANGES));
  const squareKey = pickKeyword(rng, "en", false);
  const square = polybiusSquare(squareKey);
  const keyword = pickKeyword(rng, "en", false).slice(0, mode === "cryptanalysis" ? rng.range(3, 5) : 8);
  const keyNums = to25([...keyword]).map((k) => num(square, k));
  const wordBreaks = o.wordBreaks ?? false;
  const { tokens, letters } = alignedTokens(
    quote.text,
    "en",
    (p, i) => String(num(square, p) + keyNums[i % keyNums.length]!),
    { wordBreaks, groupSize: 1000, alphabet: EN },
  );

  const given: Puzzle["display"]["given"] = [];
  let prompt: string;
  if (mode === "decode") {
    given.push({ label: "Polybius key", value: squareKey }, { label: "Keyword", value: keyword });
    prompt = `Decode this Nihilist Substitution cipher${quote.author ? ` of a quote by ${quote.author}` : ""}. Polybius key: ${squareKey}. Keyword: ${keyword}.`;
  } else {
    const crib = pickCribWord(rng, quote.text, "en", Math.max(4, keyword.length * 2));
    markCrib(tokens, crib.start, crib.start + crib.word.length);
    given.push({ label: "Crib", value: `${crib.word} (highlighted)` });
    if (o.hint !== "none") given.push({ label: "Polybius key", value: squareKey });
    prompt = `Cryptanalyze this Nihilist Substitution cipher. The highlighted numbers decode to ${crib.word}.`;
  }

  return {
    spec,
    type: "nihilist",
    title: mode === "decode" ? "Nihilist Substitution" : "Nihilist — Cryptanalysis",
    prompt,
    display: {
      layout: "aligned",
      tokens,
      unit: "number",
      propagate: false,
      answerLength: letters.length,
      answerAlphabet: EN,
      given,
      tools: ["polybius-builder"],
      lang: "en",
    },
    answer: { kind: "plaintext", value: to25(letters), freeErrors: SCORING.freeErrors },
    points: mode === "decode" ? 250 : 450,
    plaintext: quote.text,
    attribution: quote.author,
    solution: [
      { label: "Polybius key", value: squareKey },
      { label: "Keyword", value: keyword },
    ],
  };
}

/* -------------------------------- Checkerboard ------------------------------- */

const FIVE_LETTER_KEYS = KEYWORDS_EN.filter((w) => w.length === 5 && hasUniqueLetters(to25([...w]).join("")));
const CHECKERBOARD_RANGES = { short: { min: 25, max: 45 }, medium: { min: 40, max: 70 }, long: { min: 60, max: 100 } };

export function generateCheckerboard(spec: PuzzleSpec): Puzzle {
  const rng = new Rng(spec.seed);
  const o = spec.options;
  const mode = o.mode === "cryptanalysis" ? "cryptanalysis" : "decode";

  // The 2027 rules require every row and column keyword letter to appear in the
  // ciphertext, i.e. the plaintext must touch every row and every column.
  for (let attempt = 0; ; attempt++) {
    const quote = pickQuote(rng, "en", lengthRange(attempt > 30 ? "long" : o.length, CHECKERBOARD_RANGES));
    const squareKey = pickKeyword(rng, "en", false);
    const square = polybiusSquare(squareKey);
    const rowKey = rng.pick(FIVE_LETTER_KEYS);
    let colKey = rng.pick(FIVE_LETTER_KEYS);
    while (colKey === rowKey) colKey = rng.pick(FIVE_LETTER_KEYS);
    const letters = to25(lettersOnly(quote.text));
    const rows = new Set<number>();
    const cols = new Set<number>();
    for (const l of letters) {
      const [r, c] = polybiusCoords(square, l);
      rows.add(r);
      cols.add(c);
    }
    if ((rows.size < 5 || cols.size < 5) && attempt < 200) continue;

    const wordBreaks = o.wordBreaks ?? true;
    const { tokens } = alignedTokens(
      quote.text,
      "en",
      (p) => {
        const [r, c] = polybiusCoords(square, p);
        return rowKey[r]! + colKey[c]!;
      },
      { wordBreaks, groupSize: 1000, alphabet: EN },
    );

    const given: Puzzle["display"]["given"] = [];
    let prompt: string;
    if (mode === "decode") {
      given.push(
        { label: "Polybius key", value: squareKey },
        { label: "Row keyword", value: rowKey },
        { label: "Column keyword", value: colKey },
      );
      prompt = `Decode this Checkerboard cipher${quote.author ? ` of a quote by ${quote.author}` : ""}. Polybius key ${squareKey}; rows are labeled ${rowKey} and columns ${colKey}.`;
    } else {
      const crib = pickCribWord(rng, quote.text, "en", 5);
      markCrib(tokens, crib.start, crib.start + crib.word.length);
      given.push({ label: "Crib", value: `${crib.word} (highlighted)` });
      prompt = `Cryptanalyze this Checkerboard cipher. The highlighted pairs decode to ${crib.word}.`;
    }

    return {
      spec,
      type: "checkerboard",
      title: mode === "decode" ? "Checkerboard" : "Checkerboard — Cryptanalysis",
      prompt,
      display: {
        layout: "aligned",
        tokens,
        unit: "pair",
        propagate: true,
        answerLength: letters.length,
        answerAlphabet: EN,
        given,
        tools: ["polybius-builder", "frequency"],
        lang: "en",
      },
      answer: { kind: "plaintext", value: letters, freeErrors: SCORING.freeErrors },
      points: mode === "decode" ? 250 : 450,
      plaintext: quote.text,
      attribution: quote.author,
      solution: [
        { label: "Polybius key", value: squareKey },
        { label: "Row keyword", value: rowKey },
        { label: "Column keyword", value: colKey },
      ],
    };
  }
}

/* --------------------------------- Homophonic -------------------------------- */

const HOMOPHONIC_KEYS = [
  "STAR", "LIFE", "ATOM", "WAVE", "HEAT", "CORE", "DUST", "FIRE", "WIND", "RAIN", "SNOW", "ROCK",
  "LAKE", "MARS", "ZINC", "NEON", "GLOW", "BOLT", "CUBE", "PLOT", "MAZE", "CODE", "LOCK", "MIST",
  "GOLD", "SALT", "FERN", "WOLF", "HAWK", "BEAR", "LION", "FROG", "MOTH", "CRAB", "DOVE", "KITE",
].filter((w) => hasUniqueLetters(w) && !w.includes("J"));

export function homophonicNumber(keyword: string, row: number, letter: string): string {
  const l = letter === "J" ? "I" : letter;
  const idx = (EN25.indexOf(l) - EN25.indexOf(keyword[row]!) + 25) % 25;
  const n = row * 25 + idx + 1;
  return n === 100 ? "00" : String(n).padStart(2, "0");
}

export function homophonicDecode(keyword: string, numText: string): string {
  const n = numText === "00" ? 100 : parseInt(numText, 10);
  const row = Math.floor((n - 1) / 25);
  const idx = (n - 1) % 25;
  return EN25[(EN25.indexOf(keyword[row]!) + idx) % 25]!;
}

const HOMOPHONIC_RANGES = { short: { min: 30, max: 55 }, medium: { min: 50, max: 85 }, long: { min: 80, max: 120 } };

export function generateHomophonic(spec: PuzzleSpec): Puzzle {
  const rng = new Rng(spec.seed);
  const o = spec.options;
  const mode = o.mode === "decode" ? "decode" : "cryptanalysis";
  const quote = pickQuote(rng, "en", lengthRange(o.length, HOMOPHONIC_RANGES));
  const keyword = rng.pick(HOMOPHONIC_KEYS);
  const rowsUsed: number[] = [];
  const wordBreaks = o.wordBreaks ?? true;
  const { tokens, letters } = alignedTokens(
    quote.text,
    "en",
    (p) => {
      const row = rng.int(4);
      rowsUsed.push(row);
      return homophonicNumber(keyword, row, p);
    },
    { wordBreaks, groupSize: 1000, alphabet: EN },
  );

  const given: Puzzle["display"]["given"] = [];
  let prompt: string;
  if (mode === "decode") {
    given.push({ label: "Keyword", value: keyword });
    prompt = `Decode this Homophonic cipher${quote.author ? ` of a quote by ${quote.author}` : ""}. The keyword is ${keyword}.`;
  } else {
    // Choose a crib that reveals at least two keyword letters (two distinct rows).
    const words = wordsWithIndex(quote.text, "en").filter((w) => w.word.length >= 4);
    const ranked = rng.shuffle(words.length ? words : wordsWithIndex(quote.text, "en"));
    const crib =
      ranked.find((w) => new Set(rowsUsed.slice(w.start, w.start + w.word.length)).size >= 2) ?? ranked[0]!;
    markCrib(tokens, crib.start, crib.start + crib.word.length);
    given.push({ label: "Crib", value: `${crib.word} (highlighted)` });
    prompt = `Cryptanalyze this Homophonic cipher (4-letter keyword). The highlighted numbers decode to ${crib.word}.`;
  }

  return {
    spec,
    type: "homophonic",
    title: mode === "decode" ? "Homophonic" : "Homophonic — Cryptanalysis",
    prompt,
    display: {
      layout: "aligned",
      tokens,
      unit: "number",
      propagate: true,
      answerLength: letters.length,
      answerAlphabet: EN,
      given,
      tools: ["homophonic-table"],
      lang: "en",
    },
    answer: { kind: "plaintext", value: to25(letters), freeErrors: SCORING.freeErrors },
    points: mode === "decode" ? 250 : 400,
    plaintext: quote.text,
    attribution: quote.author,
    solution: [{ label: "Keyword", value: keyword }],
  };
}
