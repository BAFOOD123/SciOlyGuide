import { alphabetFor, hasUniqueLetters, keyedAlphabet, type Language } from "../alphabet.ts";
import { KEYWORDS_EN, KEYWORDS_ES } from "../data/words.ts";
import { Rng } from "../rng.ts";
import { SCORING } from "../scoring.ts";
import { alignedTokens, lengthRange, pickCribWord, pickQuote } from "../text.ts";
import type { KeyAlphabet, Puzzle, PuzzleSpec } from "../types.ts";

export interface SubstitutionKey {
  kind: KeyAlphabet;
  keyword?: string;
  shift?: number;
  /** plain letter → cipher letter */
  encrypt: Map<string, string>;
}

/** Build a monoalphabetic key with no letter enciphering to itself. */
export function buildSubstitution(rng: Rng, kind: KeyAlphabet, lang: Language, keyword?: string): SubstitutionKey {
  const std = alphabetFor(lang);
  const n = std.length;
  if (kind === "random") {
    for (;;) {
      const perm = rng.shuffle(std);
      if (perm.every((c, i) => c !== std[i])) {
        return { kind, encrypt: new Map(std.map((p, i) => [p, perm[i]!])) };
      }
    }
  }
  const kw = keyword ?? pickKeyword(rng, lang, true);
  const keyed = keyedAlphabet(kw, std);
  const plainRow = kind === "k2" ? std : keyed;
  const cipherRow = kind === "k1" ? std : keyed;
  const shifts = rng.shuffle(Array.from({ length: n - 1 }, (_, i) => i + 1));
  for (const s of shifts) {
    const map = new Map<string, string>();
    let ok = true;
    for (let i = 0; i < n; i++) {
      const p = plainRow[i]!;
      const c = cipherRow[(i + s) % n]!;
      if (p === c) {
        ok = false;
        break;
      }
      map.set(p, c);
    }
    if (ok) return { kind, keyword: kw, shift: s, encrypt: map };
  }
  // Every shift produced a fixed point (very unlikely) — fall back to a new keyword.
  return buildSubstitution(rng, kind, lang);
}

export function pickKeyword(rng: Rng, lang: Language, uniqueLetters: boolean): string {
  const pool = (lang === "es" ? KEYWORDS_ES : KEYWORDS_EN).filter((w) => !uniqueLetters || hasUniqueLetters(w));
  return rng.pick(pool);
}

const NAMES: Record<KeyAlphabet, string> = { random: "", k1: "K1 ", k2: "K2 ", k3: "K3 " };

const RANGES = {
  aristocrat: { short: { min: 45, max: 75 }, medium: { min: 70, max: 110 }, long: { min: 100, max: 160 } },
  patristocrat: { short: { min: 60, max: 90 }, medium: { min: 80, max: 120 }, long: { min: 110, max: 170 } },
  xenocrypt: { short: { min: 20, max: 40 }, medium: { min: 30, max: 60 }, long: { min: 50, max: 110 } },
};

export function generateMonoalphabetic(spec: PuzzleSpec): Puzzle {
  const rng = new Rng(spec.seed);
  const o = spec.options;
  const type = spec.type as "aristocrat" | "patristocrat" | "xenocrypt";
  const lang: Language = type === "xenocrypt" ? "es" : "en";
  const alphabet = alphabetFor(lang);
  const keywordMode = o.mode === "keyword" && type === "aristocrat";
  let kind: KeyAlphabet = o.alphabet ?? "random";
  if (keywordMode && kind === "random") kind = "k2";
  if (type !== "aristocrat" && kind === "k3") kind = "k2";

  const quote = pickQuote(rng, lang, lengthRange(o.length, RANGES[type]));
  const key = buildSubstitution(rng, kind, lang, kind === "random" ? undefined : pickKeyword(rng, lang, true));
  const wordBreaks = type !== "patristocrat";
  const { tokens, letters } = alignedTokens(quote.text, lang, (p) => key.encrypt.get(p)!, { wordBreaks, alphabet });

  const given: Puzzle["display"]["given"] = [];
  const hint = o.timed ? "none" : (o.hint ?? (type === "aristocrat" ? "none" : "word"));
  if (hint === "word") {
    const crib = pickCribWord(rng, quote.text, lang, type === "patristocrat" ? 5 : 4);
    given.push({ label: "Hint", value: `The plaintext contains the word ${crib.word}.` });
  } else if (hint === "letters") {
    const cipherLetters = [...new Set(tokens.flatMap((t) => (t.k === "c" ? [t.t] : [])))];
    const shown = rng.shuffle(cipherLetters).slice(0, 3);
    const decrypt = new Map([...key.encrypt].map(([p, c]) => [c, p]));
    given.push({ label: "Hint", value: shown.map((c) => `${c} = ${decrypt.get(c)}`).join(", ") });
  }

  const typeName = type === "aristocrat" ? "Aristocrat" : type === "patristocrat" ? "Patristocrat" : "Xenocrypt";
  const title = o.timed ? "Timed Question — Aristocrat" : `${NAMES[kind]}${typeName}`.trim();
  const by = quote.author ? ` by ${quote.author}` : "";
  const prompt = keywordMode
    ? `Solve this ${NAMES[kind]}Aristocrat${by} and give the keyword used to build the alphabet.`
    : type === "xenocrypt"
      ? `Solve this ${NAMES[kind]}Xenocrypt. The plaintext is ${quote.author ? `a Spanish quote${by}` : "a Spanish proverb"}.`
      : `Solve this ${NAMES[kind]}${typeName}${by}.`;

  const points = keywordMode
    ? 200
    : type === "patristocrat"
      ? 350 + Math.round(letters.length / 2 / 25) * 25
      : type === "xenocrypt"
        ? 300
        : kind === "random"
          ? 150 + Math.round(letters.length / 25) * 25
          : 200 + Math.round(letters.length / 25) * 25;

  const solution: Puzzle["solution"] = [
    { label: "Alphabet", value: kind === "random" ? "Random" : kind.toUpperCase() },
  ];
  if (key.keyword) solution.push({ label: "Keyword", value: key.keyword });
  solution.push({
    label: "Plain → cipher",
    value: alphabet.map((p) => `${p}${key.encrypt.get(p)}`).join(" "),
  });

  return {
    spec,
    type,
    title,
    prompt,
    display: {
      layout: "aligned",
      tokens,
      unit: "letter",
      propagate: true,
      answerLength: letters.length,
      answerAlphabet: alphabet,
      cipherAlphabet: alphabet,
      given,
      tools: ["frequency", "plain-cipher-table"],
      lang,
    },
    answer: keywordMode
      ? { kind: "keyword", value: [...key.keyword!], freeErrors: SCORING.freeErrorsExact, label: "Keyword" }
      : { kind: "plaintext", value: letters, freeErrors: SCORING.freeErrors },
    points,
    plaintext: quote.text,
    attribution: quote.author,
    solution,
  };
}
