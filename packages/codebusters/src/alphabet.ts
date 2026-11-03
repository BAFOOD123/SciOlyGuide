export const EN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
/** Spanish alphabet used for Xenocrypts: 27 letters including Ñ. */
export const ES = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
/** 25-letter Polybius / Homophonic alphabet (I and J share a cell). */
export const EN25 = "ABCDEFGHIKLMNOPQRSTUVWXYZ".split("");

export type Language = "en" | "es";

export function alphabetFor(lang: Language): string[] {
  return lang === "es" ? ES : EN;
}

/** Strip accents but keep Ñ when the language is Spanish. */
export function normalizeText(text: string, lang: Language = "en"): string {
  const upper = text.toUpperCase();
  let out = "";
  for (const ch of upper) {
    if (lang === "es" && ch === "Ñ") {
      out += "Ñ";
      continue;
    }
    out += ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  return out;
}

export function lettersOnly(text: string, lang: Language = "en"): string[] {
  const alpha = new Set(alphabetFor(lang));
  return [...normalizeText(text, lang)].filter((c) => alpha.has(c));
}

/** Map letters into the 25-letter alphabet (J → I). */
export function to25(letters: readonly string[]): string[] {
  return letters.map((c) => (c === "J" ? "I" : c));
}

/** Unique letters of `keyword` (in order) followed by the rest of `alphabet`. */
export function keyedAlphabet(keyword: string, alphabet: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const allowed = new Set(alphabet);
  for (const ch of normalizeText(keyword, alphabet.includes("Ñ") ? "es" : "en")) {
    const c = alphabet === EN25 && ch === "J" ? "I" : ch;
    if (allowed.has(c) && !seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  for (const c of alphabet) if (!seen.has(c)) out.push(c);
  return out;
}

export function hasUniqueLetters(word: string): boolean {
  return new Set(word).size === word.length;
}

export function groupsOf(items: readonly string[], size: number): string[][] {
  const out: string[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
