/**
 * Specimen photos (Wikimedia Commons) and Wikipedia summaries, plus the logic for
 * photo identification drills. Photo files use hashed names so the file name
 * never gives the answer away.
 */
import { SPECIMENS, hardnessText, specimenById, type Specimen } from "./data.ts";
import { PHOTOS, WIKI } from "./photos.ts";
import { Rng, normalizeName, specimensFor, type Focus } from "./questions.ts";

export interface Photo {
  /** Hashed file stem, e.g. "a3f9c02e1b" → <base>/a3f9c02e1b.jpg */
  key: string;
  width: number;
  height: number;
  author: string;
  license: string;
  licenseUrl?: string;
  /** Wikimedia Commons file page. */
  source: string;
  caption?: string;
}

export interface WikiInfo {
  title: string;
  url: string;
  extract: string;
}

export const WIKI_LICENSE = { label: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" };

export function photosFor(id: string): Photo[] {
  return PHOTOS[id] ?? [];
}

export function wikiFor(id: string): WikiInfo | undefined {
  return WIKI[id];
}

const KEY_TO_SPECIMEN = new Map<string, string>();
for (const [id, list] of Object.entries(PHOTOS)) for (const p of list) KEY_TO_SPECIMEN.set(p.key, id);

export function specimenForPhoto(key: string): Specimen | undefined {
  const id = KEY_TO_SPECIMEN.get(key);
  return id ? specimenById(id) : undefined;
}

export function photoByKey(key: string): Photo | undefined {
  const id = KEY_TO_SPECIMEN.get(key);
  return id ? PHOTOS[id]!.find((p) => p.key === key) : undefined;
}

/** Photo keys available for a deck, with the specimen ids they belong to. */
export function photoPool(focus: Focus): { key: string; specimenId: string }[] {
  return specimensFor(focus).flatMap((s) => photosFor(s.id).map((p) => ({ key: p.key, specimenId: s.id })));
}

/** Specimen names accepted for a typed answer. */
export function namesFor(s: Specimen): string[] {
  return [s.name, ...(s.aliases ?? [])];
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0]!;
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j]!;
      dp[j] = Math.min(dp[j]! + 1, dp[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length]!;
}

/** Does the typed guess name this specimen? Allows one typo in names of 6+ letters. */
export function guessMatches(s: Specimen, guess: string): boolean {
  const g = normalizeName(guess);
  if (!g) return false;
  return namesFor(s).some((n) => {
    const w = normalizeName(n);
    return g === w || (w.length >= 6 && editDistance(g, w) <= 1);
  });
}

/** Which specimen on the list a guess names, if any (for mix-up tracking). */
export function specimenFromGuess(guess: string): Specimen | undefined {
  return SPECIMENS.find((s) => guessMatches(s, guess));
}

/** Three hints, from vague to nearly giving it away. */
export function photoHints(s: Specimen): [string, string, string] {
  const base = s.name.replace(/\s*\(.*\)/, "");
  const category =
    s.kind === "mineral"
      ? `A mineral: ${s.chemClass.toLowerCase()}${s.varietyOf ? `, a variety of ${s.varietyOf}` : ""}`
      : `A ${s.rockType} rock (${s.subtype})`;
  const mentions = (t: string) => t.toLowerCase().includes(base.toLowerCase());
  let property =
    s.kind === "mineral"
      ? `Hardness ${hardnessText(s.hardness)}, ${s.streak} streak, ${s.lusterDesc} luster`
      : `Texture: ${s.texture}`;
  // Never let a hint name the specimen (e.g. copper's "copper-red" streak).
  if (mentions(property)) {
    property =
      s.kind === "mineral"
        ? `Hardness ${hardnessText(s.hardness)}, ${s.lusterDesc} luster, specific gravity ${s.sg[0]}–${s.sg[1]}`
        : `Made of: ${s.minerals.join(", ")}`;
  }
  return [category, property, `Starts with “${base[0]}” · ${base.replace(/[^A-Za-z]/g, "").length} letters`];
}

const isQuartzVariety = (s: Specimen) => s.kind === "mineral" && !!s.varietyOf?.startsWith("Quartz");

/**
 * Four look-alike choices for multiple-choice photo ID: same broad type, and for
 * minerals a shared color where possible, so the photo has to be read carefully.
 */
export function lookAlikeChoices(s: Specimen, seed: number): string[] {
  const rng = new Rng(seed);
  const sameType = SPECIMENS.filter(
    (o) => o.id !== s.id && o.kind === s.kind && (o.kind === "mineral" || (s.kind === "rock" && o.rockType === s.rockType)),
  );
  // Visually indistinguishable pairs (e.g. two white quartz varieties) would make the photo unfair.
  const fair = sameType.filter((o) => !(isQuartzVariety(s) && isQuartzVariety(o)));
  let similar = fair;
  if (s.kind === "mineral") {
    const colors = new Set(s.colors.map((c) => c.split(" ").at(-1)!));
    const byColor = fair.filter((o) => o.kind === "mineral" && o.colors.some((c) => colors.has(c.split(" ").at(-1)!)));
    similar = byColor.length >= 3 ? byColor : fair.filter((o) => o.kind === "mineral" && o.luster === s.luster);
  }
  const pool = similar.length >= 3 ? similar : fair;
  return rng.shuffle([s.name, ...rng.shuffle(pool).slice(0, 3).map((o) => o.name)]);
}
