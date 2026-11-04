import {
  MINERALS,
  ROCKS,
  SPECIMENS,
  TEST_LABEL,
  hardnessText,
  sgText,
  specimenById,
  type Mineral,
  type Rock,
  type Specimen,
  type Test,
} from "./data.ts";
import { CONCEPTS } from "./concepts.ts";

/* ------------------------------------ RNG ------------------------------------ */

export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0 || 0x9e3779b9;
  }
  next(): number {
    let t = (this.s = (this.s + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(n: number) {
    return Math.floor(this.next() * n);
  }
  pick<T>(a: readonly T[]): T {
    return a[this.int(a.length)]!;
  }
  shuffle<T>(a: readonly T[]): T[] {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [b[i], b[j]] = [b[j]!, b[i]!];
    }
    return b;
  }
}

/* ----------------------------------- Types ----------------------------------- */

export type Skill =
  | "identify-mineral"
  | "identify-rock"
  | "hardness"
  | "streak"
  | "luster"
  | "breakage"
  | "system"
  | "formula"
  | "chem-class"
  | "special-test"
  | "ore"
  | "hardness-order"
  | "rock-type"
  | "rock-subtype"
  | "igneous-texture"
  | "igneous-composition"
  | "equivalent"
  | "parent"
  | "metamorphism-product"
  | "grade-order"
  | "energy"
  | "concept";

export interface SkillInfo {
  skill: Skill;
  label: string;
  group: "Identification" | "Mineral properties" | "Rocks" | "Geology concepts";
}

export const SKILLS: readonly SkillInfo[] = [
  { skill: "identify-mineral", label: "Identify a mineral from its properties", group: "Identification" },
  { skill: "identify-rock", label: "Identify a rock from its description", group: "Identification" },
  { skill: "hardness", label: "Mohs hardness", group: "Mineral properties" },
  { skill: "hardness-order", label: "Order by hardness", group: "Mineral properties" },
  { skill: "streak", label: "Streak", group: "Mineral properties" },
  { skill: "luster", label: "Luster", group: "Mineral properties" },
  { skill: "breakage", label: "Cleavage and fracture", group: "Mineral properties" },
  { skill: "system", label: "Crystal system", group: "Mineral properties" },
  { skill: "formula", label: "Chemical formula", group: "Mineral properties" },
  { skill: "chem-class", label: "Chemical class", group: "Mineral properties" },
  { skill: "special-test", label: "Special tests (acid, magnet, taste…)", group: "Mineral properties" },
  { skill: "ore", label: "Ores and uses", group: "Mineral properties" },
  { skill: "rock-type", label: "Igneous, sedimentary or metamorphic", group: "Rocks" },
  { skill: "rock-subtype", label: "Intrusive/extrusive, clastic/chemical, foliated", group: "Rocks" },
  { skill: "igneous-texture", label: "Igneous texture", group: "Rocks" },
  { skill: "igneous-composition", label: "Felsic to ultramafic", group: "Rocks" },
  { skill: "equivalent", label: "Intrusive ↔ extrusive equivalents", group: "Rocks" },
  { skill: "parent", label: "Parent rock (protolith)", group: "Rocks" },
  { skill: "metamorphism-product", label: "What a rock metamorphoses into", group: "Rocks" },
  { skill: "grade-order", label: "Metamorphic grade order", group: "Rocks" },
  { skill: "energy", label: "Depositional energy", group: "Rocks" },
  { skill: "concept", label: "Rock cycle, Bowen's series, Earth history", group: "Geology concepts" },
];

export interface QuestionSpec {
  skill: Skill;
  seed: number;
  specimenId?: string;
  /** Ask for the name as free text instead of multiple choice (identify skills). */
  typed?: boolean;
}

export interface Question {
  spec: QuestionSpec;
  skill: Skill;
  /** The specimen this question is mainly about (for mastery tracking). */
  specimenId?: string;
  prompt: string;
  /** Observations shown as a list under the prompt. */
  clues?: string[];
  kind: "mcq" | "order" | "text";
  choices?: string[];
  /** mcq: index of the correct choice. */
  answer?: number;
  /** order: the items in shown order; correct order given as indices. */
  items?: string[];
  order?: number[];
  /** text: accepted answers (normalized when graded). */
  accepted?: string[];
  explanation: string;
}

export interface QResponse {
  choice?: number;
  order?: number[];
  text?: string;
}

/* ---------------------------------- Helpers ---------------------------------- */

const overlap = (a: [number, number], b: [number, number]) => a[0] <= b[1] && b[0] <= a[1];
const isQuartzy = (s: Specimen) => s.kind === "mineral" && (s.varietyOf?.startsWith("Quartz") ?? false);
const display = (s: Specimen) => s.name;

function mcq(
  rng: Rng,
  base: Omit<Question, "kind" | "choices" | "answer">,
  correct: string,
  distractors: string[],
  n = 4,
): Question | null {
  const uniq = [...new Set(distractors.filter((d) => d !== correct))];
  if (uniq.length < Math.min(2, n - 1)) return null;
  const choices = rng.shuffle([correct, ...rng.shuffle(uniq).slice(0, n - 1)]);
  return { ...base, kind: "mcq", choices, answer: choices.indexOf(correct) };
}

export function streakKey(streak: string): string {
  const s = streak.toLowerCase();
  if (s.startsWith("none") || s.startsWith("white") || s.startsWith("grayish white")) return "white";
  if (s.includes("red-brown") || s.includes("reddish brown")) return "red-brown";
  if (s.includes("yellow-brown")) return "yellow-brown";
  if (s.includes("gray-black")) return "gray-black";
  if (s.startsWith("black")) return "black";
  if (s.includes("blue")) return "blue";
  if (s.includes("green")) return "green";
  if (s.includes("yellow")) return "yellow";
  if (s.includes("copper")) return "copper-red";
  return s;
}

const STREAK_CHOICES: Record<string, string> = {
  white: "White (or colorless)",
  "red-brown": "Red-brown",
  "yellow-brown": "Yellow-brown",
  "gray-black": "Gray-black",
  black: "Black",
  blue: "Light blue",
  green: "Light green",
  yellow: "Pale yellow",
  "copper-red": "Copper-red, shiny",
};

const LUSTERS = ["metallic", "vitreous", "pearly", "silky", "resinous", "earthy", "adamantine", "waxy", "greasy"] as const;
const LUSTER_LABEL: Record<(typeof LUSTERS)[number], string> = {
  metallic: "Metallic",
  vitreous: "Vitreous (glassy)",
  pearly: "Pearly",
  silky: "Silky",
  resinous: "Resinous",
  earthy: "Earthy (dull)",
  adamantine: "Adamantine (brilliant)",
  waxy: "Waxy",
  greasy: "Greasy",
};

export function breakageKey(m: Mineral): string | null {
  const b = m.breakage;
  if (/octahedral/.test(b)) return "Cleavage in 4 directions (octahedral)";
  if (/cubic/.test(b)) return "Cleavage in 3 directions at 90° (cubic)";
  if (/rhombohedral/.test(b)) return "Cleavage in 3 directions not at 90° (rhombohedral)";
  if (/56°/.test(b)) return "Cleavage in 2 directions at about 56° and 124°";
  if (/2 cleavages/.test(b)) return "Cleavage in 2 directions at about 90°";
  if (/fibrous/.test(b)) return "Fibrous";
  if (/cleavage in 1 direction/.test(b)) return "Perfect cleavage in 1 direction";
  if (/hackly/.test(b)) return "Hackly fracture (no cleavage)";
  if (/^earthy/.test(b)) return "Earthy, crumbly (no visible cleavage)";
  if (/conchoidal/.test(b) && /^(no|poor|rarely)/.test(b)) return "Conchoidal fracture (no good cleavage)";
  return null;
}

const SYSTEMS = ["Isometric", "Tetragonal", "Hexagonal", "Orthorhombic", "Monoclinic", "Triclinic"];
export function systemKey(m: Mineral): string | null {
  const first = m.system.split(/[ (]/)[0]!;
  return SYSTEMS.includes(first) ? first : null;
}


/* ------------------------------ Mineral generators --------------------------- */

interface Clue {
  text: string;
  /** Does specimen `o` contradict this clue? */
  contradicts: (o: Mineral) => boolean;
}

function mineralClues(t: Mineral): Clue[] {
  const clues: Clue[] = [];
  const shown = t.colors.slice(0, 2).map((c) => c.toLowerCase().replace(/\s*\(.*\)/, ""));
  // Phrase-level match: "green" fits "olive green", but "dark brown" doesn't fit "pale brown".
  const sameColor = (a: string, b: string) => a === b || a.endsWith(" " + b) || b.endsWith(" " + a);
  clues.push({
    text: `Color: ${t.colors.slice(0, 2).join(" or ")}`,
    contradicts: (o) => !o.colors.some((c) => shown.some((x) => sameColor(c.toLowerCase().replace(/\s*\(.*\)/, ""), x))),
  });
  const lw = t.lusterDesc.split(/[ ,]+/)[0]!;
  clues.push({
    text: `Luster: ${t.luster === "metallic" ? "metallic" : `${t.lusterDesc} (nonmetallic)`}`,
    contradicts: (o) => o.luster !== t.luster || (t.luster !== "metallic" && !o.lusterDesc.includes(lw)),
  });
  clues.push({
    text: `Hardness: ${hardnessText(t.hardness)}`,
    contradicts: (o) => !overlap(o.hardness, t.hardness),
  });
  clues.push({ text: `Streak: ${t.streak}`, contradicts: (o) => streakKey(o.streak) !== streakKey(t.streak) });
  const bk = breakageKey(t);
  if (bk) clues.push({ text: `Breakage: ${t.breakage}`, contradicts: (o) => breakageKey(o) !== bk });
  for (const test of t.tests.slice(0, 2)) {
    clues.push({ text: `It ${TEST_LABEL[test]}`, contradicts: (o) => !o.tests.includes(test) });
  }
  return clues;
}

/** Extra clues, added in order only while some other mineral still fits. */
function extraClues(t: Mineral): Clue[] {
  const out: Clue[] = [];
  out.push({ text: `Specific gravity: ${sgText(t.sg)}`, contradicts: (o) => !overlap(o.sg, t.sg) });
  const sk = systemKey(t);
  if (sk) out.push({ text: `Crystal system: ${t.system}`, contradicts: (o) => systemKey(o) !== sk });
  out.push({ text: `Mineral class: ${t.chemClass}${t.group ? ` (${t.group})` : ""}`, contradicts: (o) => o.chemClass !== t.chemClass || o.group !== t.group });
  return out;
}

function cluesUnique(t: Mineral): Clue[] {
  const clues = mineralClues(t);
  const fits = (o: Mineral) => o.id !== t.id && !clues.some((c) => c.contradicts(o));
  for (const extra of extraClues(t)) {
    if (!MINERALS.some(fits)) break;
    clues.push(extra);
  }
  return clues;
}

function identifyMineral(rng: Rng, t: Mineral, typed: boolean): Question | null {
  const clues = cluesUnique(t);
  const matches = (o: Mineral) => !clues.some((c) => c.contradicts(o));
  const others = MINERALS.filter((o) => o.id !== t.id);
  const ambiguous = others.filter(matches);
  const base = {
    spec: { skill: "identify-mineral" as const, seed: 0, specimenId: t.id, typed },
    skill: "identify-mineral" as const,
    specimenId: t.id,
    prompt: typed ? "Name this mineral from the official list." : "Which mineral matches these observations?",
    clues: clues.map((c) => c.text),
    explanation: `${t.name}: ${t.tip}`,
  };
  if (typed) {
    if (ambiguous.length) return null;
    return { ...base, kind: "text", accepted: [t.name, ...(t.aliases ?? [])] };
  }
  // Prefer look-alikes (same luster class) that a clue still rules out.
  const candidates = others.filter((o) => !matches(o));
  const similar = candidates.filter((o) => o.luster === t.luster && (!isQuartzy(t) || !isQuartzy(o)));
  const pool = similar.length >= 3 ? similar : candidates;
  // Only the listed choices need to be told apart, so other look-alikes don't block MCQ.
  const distractors = rng.shuffle(pool).slice(0, 3).map(display);
  return mcq(rng, base, display(t), distractors);
}

function hardnessQ(rng: Rng, t: Mineral): Question | null {
  const correct = hardnessText(t.hardness);
  const d = MINERALS.filter((o) => !overlap(o.hardness, t.hardness) && Math.abs(o.hardness[0] - t.hardness[0]) >= 1).map((o) =>
    hardnessText(o.hardness),
  );
  return mcq(
    rng,
    {
      spec: { skill: "hardness", seed: 0, specimenId: t.id },
      skill: "hardness",
      specimenId: t.id,
      prompt: `What is the Mohs hardness of ${t.name}?`,
      explanation: `${t.name} has a hardness of ${correct}. Reference points: fingernail 2.5, copper 3.5, glass and steel knife 5.5, streak plate 6.5.`,
    },
    correct,
    d,
  );
}

function streakQ(rng: Rng, t: Mineral): Question | null {
  const key = streakKey(t.streak);
  const correct = STREAK_CHOICES[key];
  if (!correct) return null;
  const d = Object.entries(STREAK_CHOICES)
    .filter(([k]) => k !== key)
    .map(([, v]) => v);
  return mcq(
    rng,
    {
      spec: { skill: "streak", seed: 0, specimenId: t.id },
      skill: "streak",
      specimenId: t.id,
      prompt: `What color streak does ${t.name} leave on an unglazed porcelain plate?`,
      explanation: `${t.name}'s streak is ${t.streak}. Streak shows a mineral's true powdered color, which is more reliable than surface color.`,
    },
    correct,
    d,
  );
}

function lusterQ(rng: Rng, t: Mineral): Question | null {
  const desc = t.luster === "metallic" ? "metallic" : t.lusterDesc;
  const main = LUSTERS.find((l) => desc.startsWith(l));
  if (!main) return null;
  const full = t.lusterDesc + (t.luster === "metallic" ? " metallic" : "");
  const d = LUSTERS.filter((l) => !full.includes(l) && !(l === "earthy" && full.includes("dull"))).map((l) => LUSTER_LABEL[l]);
  return mcq(
    rng,
    {
      spec: { skill: "luster", seed: 0, specimenId: t.id },
      skill: "luster",
      specimenId: t.id,
      prompt: `Which best describes the luster of ${t.name}?`,
      explanation: `${t.name}'s luster is ${t.lusterDesc}${t.luster === "nonmetallic" ? " (nonmetallic)" : ""}.`,
    },
    LUSTER_LABEL[main],
    d,
  );
}

const BREAKAGE_KEYS = [
  "Cleavage in 4 directions (octahedral)",
  "Cleavage in 3 directions at 90° (cubic)",
  "Cleavage in 3 directions not at 90° (rhombohedral)",
  "Cleavage in 2 directions at about 56° and 124°",
  "Cleavage in 2 directions at about 90°",
  "Perfect cleavage in 1 direction",
  "Conchoidal fracture (no good cleavage)",
  "Fibrous",
];

function breakageQ(rng: Rng, t: Mineral): Question | null {
  const k = breakageKey(t);
  if (!k || !BREAKAGE_KEYS.includes(k)) return null;
  return mcq(
    rng,
    {
      spec: { skill: "breakage", seed: 0, specimenId: t.id },
      skill: "breakage",
      specimenId: t.id,
      prompt: `How does ${t.name} break?`,
      explanation: `${t.name}: ${t.breakage}.`,
    },
    k,
    BREAKAGE_KEYS.filter((x) => x !== k),
  );
}

function systemQ(rng: Rng, t: Mineral): Question | null {
  const k = systemKey(t);
  if (!k) return null;
  return mcq(
    rng,
    {
      spec: { skill: "system", seed: 0, specimenId: t.id },
      skill: "system",
      specimenId: t.id,
      prompt: `In which crystal system does ${t.name} crystallize?`,
      explanation: `${t.name}: ${t.system}.${k === "Hexagonal" ? " The trigonal system is often grouped with hexagonal." : ""}`,
    },
    k,
    SYSTEMS.filter((s) => s !== k),
  );
}

function formulaQ(rng: Rng, t: Mineral): Question | null {
  if (t.chemClass === "Mineraloid") return null;
  const d = MINERALS.filter((o) => o.formula !== t.formula && o.chemClass !== "Mineraloid" && !o.formula.includes("(replacing")).map((o) => o.formula);
  return mcq(
    rng,
    {
      spec: { skill: "formula", seed: 0, specimenId: t.id },
      skill: "formula",
      specimenId: t.id,
      prompt: `What is the chemical formula of ${t.name}?`,
      explanation: `${t.name} is ${t.formula}, a ${t.chemClass.toLowerCase()}${t.group ? ` (${t.group})` : ""}.`,
    },
    t.formula,
    rng.shuffle(d.filter((f) => f.length < 40)),
  );
}

const CLASSES = ["Native element", "Sulfide", "Oxide", "Hydroxide", "Halide", "Carbonate", "Sulfate", "Phosphate", "Borate", "Silicate"];
function chemClassQ(rng: Rng, t: Mineral): Question | null {
  if (!CLASSES.includes(t.chemClass)) return null;
  return mcq(
    rng,
    {
      spec: { skill: "chem-class", seed: 0, specimenId: t.id },
      skill: "chem-class",
      specimenId: t.id,
      prompt: `${t.name} (${t.formula}) belongs to which mineral class?`,
      explanation: `${t.name} is a ${t.chemClass.toLowerCase()}${t.group ? `: ${t.group}` : ""}.`,
    },
    t.chemClass,
    CLASSES.filter((c) => c !== t.chemClass),
  );
}

const TESTS_ASKED: Test[] = ["effervesces", "effervesces-powdered", "magnetic", "salty-taste", "thin-sheets", "soapy-feel", "fiber-optic", "iridescent-tarnish", "play-of-color", "chatoyancy", "double-refraction", "marks-paper", "malleable"];
function specialTestQ(rng: Rng, t: Mineral): Question | null {
  const tests = t.tests.filter((x) => TESTS_ASKED.includes(x));
  if (!tests.length) return null;
  const test = rng.pick(tests);
  // Distractors must clearly fail the test (acid: exclude anything that fizzes at all).
  const fizz = (o: Mineral) => o.tests.includes("effervesces") || o.tests.includes("effervesces-powdered");
  const d = MINERALS.filter((o) => !o.tests.includes(test) && !(test.startsWith("effervesces") && fizz(o)) && !(test === "thin-sheets" && o.varietyOf === "Gypsum")).map(display);
  return mcq(
    rng,
    {
      spec: { skill: "special-test", seed: 0, specimenId: t.id },
      skill: "special-test",
      specimenId: t.id,
      prompt: `Which of these minerals ${TEST_LABEL[test]}?`,
      explanation: `${t.name} ${TEST_LABEL[test]}. ${t.tip}`,
    },
    display(t),
    d,
  );
}

const ORE_ELEMENTS = ["iron", "copper", "aluminum", "boron", "barium", "beryllium", "phosphorus", "magnesium", "carbon"];
function oreQ(rng: Rng, t: Mineral): Question | null {
  if (!t.ore) return null;
  if (rng.next() < 0.5) {
    return mcq(
      rng,
      {
        spec: { skill: "ore", seed: 0, specimenId: t.id },
        skill: "ore",
        specimenId: t.id,
        prompt: `${t.name} is mined as an ore of which element?`,
        explanation: `${t.name} is an ore of ${t.ore}. Uses: ${t.uses.join("; ")}.`,
      },
      t.ore,
      ORE_ELEMENTS.filter((e) => e !== t.ore),
    );
  }
  const d = MINERALS.filter((o) => o.ore !== t.ore).map(display);
  return mcq(
    rng,
    {
      spec: { skill: "ore", seed: 0, specimenId: t.id },
      skill: "ore",
      specimenId: t.id,
      prompt: `Which of these is an important ore of ${t.ore}?`,
      explanation: `${t.name} is an ore of ${t.ore}. Uses: ${t.uses.join("; ")}.`,
    },
    display(t),
    d,
  );
}

function hardnessOrderQ(rng: Rng, t: Mineral): Question | null {
  const picked: Mineral[] = [t];
  for (const o of rng.shuffle(MINERALS)) {
    if (picked.length === 4) break;
    if (picked.every((p) => Math.abs(p.hardness[0] - o.hardness[0]) >= 1 && !overlap(p.hardness, o.hardness))) picked.push(o);
  }
  if (picked.length < 4) return null;
  const items = rng.shuffle(picked);
  const sorted = items.slice().sort((a, b) => a.hardness[0] - b.hardness[0]);
  return {
    spec: { skill: "hardness-order", seed: 0, specimenId: t.id },
    skill: "hardness-order",
    specimenId: t.id,
    prompt: "Put these minerals in order from softest to hardest.",
    kind: "order",
    items: items.map(display),
    order: sorted.map((s) => items.indexOf(s)),
    explanation: sorted.map((s) => `${s.name} ${hardnessText(s.hardness)}`).join(" < "),
  };
}

/* -------------------------------- Rock generators ---------------------------- */

const TYPE_LABEL = { igneous: "Igneous", sedimentary: "Sedimentary", metamorphic: "Metamorphic" } as const;

function rockClues(t: Rock): string[] {
  const c = [`Texture: ${t.texture}`, `Made of: ${t.minerals.join(", ")}`];
  if (t.rockType === "igneous") c.push(`Composition: ${t.composition}`);
  if (t.tests?.length) c.push(`It ${TEST_LABEL[t.tests[0]!]}`);
  return c;
}

function identifyRock(rng: Rng, t: Rock, typed: boolean): Question | null {
  const clues = rockClues(t);
  const differs = (o: Rock) => o.texture !== t.texture || o.minerals.join() !== t.minerals.join();
  const others = ROCKS.filter((o) => o.id !== t.id && differs(o));
  const same = others.filter((o) => o.rockType === t.rockType);
  const base = {
    spec: { skill: "identify-rock" as const, seed: 0, specimenId: t.id, typed },
    skill: "identify-rock" as const,
    specimenId: t.id,
    prompt: typed ? "Name this rock from the official list." : "Which rock matches this description?",
    clues,
    explanation: `${t.name} (${t.rockType}, ${t.subtype}): ${t.tip}`,
  };
  if (typed) return { ...base, kind: "text", accepted: [t.name, ...(t.aliases ?? [])] };
  const pool = same.length >= 3 ? same : others;
  return mcq(rng, base, display(t), rng.shuffle(pool).slice(0, 3).map(display));
}

function rockTypeQ(rng: Rng, t: Rock): Question | null {
  return mcq(
    rng,
    {
      spec: { skill: "rock-type", seed: 0, specimenId: t.id },
      skill: "rock-type",
      specimenId: t.id,
      prompt: `${t.name} is classified as which type of rock?`,
      explanation: `${t.name} is ${t.rockType} (${t.subtype}). ${t.environment}.`,
    },
    TYPE_LABEL[t.rockType],
    Object.values(TYPE_LABEL).filter((x) => x !== TYPE_LABEL[t.rockType]),
    3,
  );
}

function rockSubtypeQ(rng: Rng, t: Rock): Question | null {
  const s = t.subtype;
  let correct: string | null = null;
  let choices: string[] = [];
  if (t.rockType === "igneous") {
    correct = s.startsWith("intrusive") ? "Intrusive (plutonic)" : "Extrusive (volcanic)";
    choices = ["Intrusive (plutonic)", "Extrusive (volcanic)"];
  } else if (t.rockType === "metamorphic") {
    if (/weakly|massive/.test(s)) return null;
    correct = s.startsWith("foliated") ? "Foliated" : "Nonfoliated";
    choices = ["Foliated", "Nonfoliated"];
  } else {
    if (s.startsWith("clastic")) correct = "Clastic";
    else if (s.startsWith("biochemical")) correct = "Biochemical (organic)";
    else if (s.startsWith("chemical/")) return null;
    else if (s.startsWith("chemical")) correct = "Chemical";
    choices = ["Clastic", "Chemical", "Biochemical (organic)"];
  }
  if (!correct) return null;
  return mcq(
    rng,
    {
      spec: { skill: "rock-subtype", seed: 0, specimenId: t.id },
      skill: "rock-subtype",
      specimenId: t.id,
      prompt: `How is ${t.name} classified within ${t.rockType} rocks?`,
      explanation: `${t.name} is ${t.subtype}. Texture: ${t.texture}.`,
    },
    correct,
    choices.filter((c) => c !== correct),
    choices.length,
  );
}

const IG_TEXTURES = ["phaneritic", "aphanitic", "glassy", "vesicular", "pyroclastic"];
function igneousTextureQ(rng: Rng, t: Rock): Question | null {
  if (t.rockType !== "igneous") return null;
  const main = IG_TEXTURES.find((x) => t.texture.startsWith(x));
  if (!main) return null;
  const label = (x: string) => x[0]!.toUpperCase() + x.slice(1);
  return mcq(
    rng,
    {
      spec: { skill: "igneous-texture", seed: 0, specimenId: t.id },
      skill: "igneous-texture",
      specimenId: t.id,
      prompt: `Which texture best describes ${t.name}?`,
      explanation: `${t.name}: ${t.texture}. Phaneritic = coarse, slow cooling; aphanitic = fine, fast cooling; glassy = no crystals; vesicular = gas holes; pyroclastic = ash and fragments.`,
    },
    label(main),
    IG_TEXTURES.filter((x) => !t.texture.includes(x)).map(label),
  );
}

const COMPOSITIONS = ["Felsic", "Intermediate", "Mafic", "Ultramafic"];
function igneousCompositionQ(rng: Rng, t: Rock): Question | null {
  if (t.rockType !== "igneous") return null;
  const c = COMPOSITIONS.find((x) => t.composition.toLowerCase().startsWith(x.toLowerCase()));
  if (!c) return null;
  return mcq(
    rng,
    {
      spec: { skill: "igneous-composition", seed: 0, specimenId: t.id },
      skill: "igneous-composition",
      specimenId: t.id,
      prompt: `What is the composition of ${t.name}?`,
      explanation: `${t.name} is ${t.composition}: ${t.minerals.join(", ")}. Felsic rocks are light and silica-rich; mafic rocks are dark and rich in Mg and Fe.`,
    },
    c,
    COMPOSITIONS.filter((x) => x !== c),
  );
}

const EQUIV: [string, string][] = [
  ["granite", "rhyolite"],
  ["diorite", "andesite"],
  ["gabbro", "basalt"],
];
function equivalentQ(rng: Rng, t: Rock): Question | null {
  const pair = EQUIV.find((p) => p.includes(t.id));
  if (!pair) return null;
  const intrusive = specimenById(pair[0]) as Rock;
  const extrusive = specimenById(pair[1]) as Rock;
  const askExtrusive = t.id === intrusive.id;
  const given = askExtrusive ? intrusive : extrusive;
  const answer = askExtrusive ? extrusive : intrusive;
  const pool = ROCKS.filter(
    (o) => o.rockType === "igneous" && o.subtype === answer.subtype && o.composition.split(" ")[0] !== answer.composition.split(" ")[0],
  );
  return mcq(
    rng,
    {
      spec: { skill: "equivalent", seed: 0, specimenId: t.id },
      skill: "equivalent",
      specimenId: t.id,
      prompt: `Which ${askExtrusive ? "extrusive" : "intrusive"} rock has the same composition as ${given.name}?`,
      explanation: `${intrusive.name} (intrusive, coarse) and ${extrusive.name} (extrusive, fine) are both ${intrusive.composition}.`,
    },
    answer.name,
    pool.map(display),
  );
}

const STOP = new Set(["or", "rock", "via", "and", "with", "the", "a"]);
const words = (s: string) => new Set(s.toLowerCase().replace(/[(),]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w)));
function parentQ(rng: Rng, t: Rock): Question | null {
  if (!t.parent) return null;
  const tw = words(t.parent);
  const d = ROCKS.filter((o) => o.parent && ![...words(o.parent)].some((w) => tw.has(w))).map((o) => o.parent!);
  return mcq(
    rng,
    {
      spec: { skill: "parent", seed: 0, specimenId: t.id },
      skill: "parent",
      specimenId: t.id,
      prompt: `What is the parent rock (protolith) of ${t.name}?`,
      explanation: `${t.name} forms from ${t.parent} (${t.environment}).`,
    },
    t.parent,
    d,
  );
}

const PRODUCTS: { from: string; id: string }[] = [
  { from: "limestone", id: "marble" },
  { from: "quartz sandstone", id: "quartzite" },
  { from: "shale at low grade", id: "slate" },
  { from: "peridotite when it reacts with water", id: "serpentinite" },
  { from: "basalt at medium to high grade", id: "amphibolite" },
  { from: "shale at high grade", id: "gneiss" },
];
function productQ(rng: Rng, t: Rock): Question | null {
  const p = PRODUCTS.find((x) => x.id === t.id);
  if (!p) return null;
  const d = ROCKS.filter((o) => o.rockType === "metamorphic" && o.id !== t.id && !(p.from.includes("shale") && o.parent?.includes("shale"))).map(display);
  return mcq(
    rng,
    {
      spec: { skill: "metamorphism-product", seed: 0, specimenId: t.id },
      skill: "metamorphism-product",
      specimenId: t.id,
      prompt: `Metamorphism of ${p.from} produces which rock?`,
      explanation: `${p.from[0]!.toUpperCase() + p.from.slice(1)} → ${t.name}. ${t.tip}`,
    },
    t.name,
    d,
  );
}

const GRADE_SEQ = ["slate", "phyllite", "mica-schist", "gneiss"];
function gradeOrderQ(rng: Rng, t: Rock): Question | null {
  if (!GRADE_SEQ.includes(t.id)) return null;
  const chosen = GRADE_SEQ.filter((id) => id === t.id || rng.next() < 0.75);
  const ids = chosen.length >= 3 ? chosen : GRADE_SEQ;
  const items = rng.shuffle(ids);
  return {
    spec: { skill: "grade-order", seed: 0, specimenId: t.id },
    skill: "grade-order",
    specimenId: t.id,
    prompt: "These rocks all form from shale. Order them from lowest to highest metamorphic grade.",
    kind: "order",
    items: items.map((id) => specimenById(id)!.name),
    order: ids.map((id) => items.indexOf(id)),
    explanation: "Slate → phyllite → schist → gneiss: grain size grows and foliation coarsens as temperature and pressure rise.",
  };
}

function energyQ(rng: Rng, t: Rock): Question | null {
  if (t.energy === undefined) return null;
  const clastic = ROCKS.filter((o) => o.energy !== undefined);
  const levels = [...new Set(clastic.map((o) => o.energy!))];
  const picks = levels.map((lv) => rng.pick(clastic.filter((o) => o.energy === lv && (lv !== t.energy || o.id === t.id))));
  if (picks.length < 3) return null;
  const lowest = rng.next() < 0.5;
  const ans = picks.slice().sort((a, b) => (lowest ? a.energy! - b.energy! : b.energy! - a.energy!))[0]!;
  return mcq(
    rng,
    {
      spec: { skill: "energy", seed: 0, specimenId: ans.id },
      skill: "energy",
      specimenId: ans.id,
      prompt: `Based on grain size, which of these formed in the ${lowest ? "lowest" : "highest"}-energy environment?`,
      explanation: `${picks.map((p) => `${p.name}: ${p.texture}`).join("; ")}. Fine grains settle only in quiet water, and coarse clasts need fast-moving water or gravity.`,
    },
    ans.name,
    picks.filter((p) => p !== ans).map(display),
    picks.length,
  );
}

function conceptQ(rng: Rng): Question | null {
  const c = rng.pick(CONCEPTS);
  return mcq(
    rng,
    { spec: { skill: "concept", seed: 0 }, skill: "concept", specimenId: c.specimenId, prompt: c.q, explanation: c.why },
    c.a,
    c.wrong,
    Math.min(4, c.wrong.length + 1),
  );
}

/* ---------------------------------- Dispatch --------------------------------- */

type Gen = (rng: Rng, s: Specimen, typed: boolean) => Question | null;
const asM = (f: (rng: Rng, t: Mineral, typed: boolean) => Question | null): Gen => (rng, s, typed) => (s.kind === "mineral" ? f(rng, s, typed) : null);
const asR = (f: (rng: Rng, t: Rock, typed: boolean) => Question | null): Gen => (rng, s, typed) => (s.kind === "rock" ? f(rng, s, typed) : null);

const GENERATORS: Record<Exclude<Skill, "concept">, Gen> = {
  "identify-mineral": asM(identifyMineral),
  "identify-rock": asR(identifyRock),
  hardness: asM(hardnessQ),
  streak: asM(streakQ),
  luster: asM(lusterQ),
  breakage: asM(breakageQ),
  system: asM(systemQ),
  formula: asM(formulaQ),
  "chem-class": asM(chemClassQ),
  "special-test": asM(specialTestQ),
  ore: asM(oreQ),
  "hardness-order": asM(hardnessOrderQ),
  "rock-type": asR(rockTypeQ),
  "rock-subtype": asR(rockSubtypeQ),
  "igneous-texture": asR(igneousTextureQ),
  "igneous-composition": asR(igneousCompositionQ),
  equivalent: asR(equivalentQ),
  parent: asR(parentQ),
  "metamorphism-product": asR(productQ),
  "grade-order": asR(gradeOrderQ),
  energy: asR(energyQ),
};

/** Skills that can be asked about a given specimen. */
export function skillsFor(s: Specimen): Skill[] {
  const out: Skill[] = [];
  for (const [skill, gen] of Object.entries(GENERATORS) as [Exclude<Skill, "concept">, Gen][]) {
    for (let seed = 1; seed <= 4; seed++) {
      if (gen(new Rng(seed), s, false)) {
        out.push(skill);
        break;
      }
    }
  }
  return out;
}

/**
 * Deterministic: the same spec always produces the same question. If the requested
 * specimen can't support the skill, falls back to identifying that specimen.
 */
export function generateQuestion(spec: QuestionSpec): Question {
  const rng = new Rng(spec.seed);
  let q: Question | null = null;
  if (spec.skill === "concept") {
    q = conceptQ(rng);
  } else {
    const gen = GENERATORS[spec.skill];
    if (spec.specimenId) {
      const s = specimenById(spec.specimenId);
      if (s) q = gen(rng, s, !!spec.typed) ?? gen(rng, s, false);
    } else {
      const pool = rng.shuffle(SPECIMENS);
      for (const s of pool) {
        q = gen(rng, s, !!spec.typed);
        if (q) break;
      }
    }
    if (!q && spec.specimenId) {
      const s = specimenById(spec.specimenId)!;
      q = s.kind === "mineral" ? identifyMineral(new Rng(spec.seed), s, false) : identifyRock(new Rng(spec.seed), s, false);
    }
  }
  if (!q) throw new Error(`could not generate ${spec.skill}`);
  return { ...q, spec };
}

/* ---------------------------------- Grading ---------------------------------- */

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]s\b/g, "s")
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z]+/g, " ")
    .trim();
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

export function isCorrect(q: Question, r: QResponse): boolean {
  if (q.kind === "mcq") return r.choice === q.answer;
  if (q.kind === "order") return !!r.order && r.order.length === q.order!.length && r.order.every((v, i) => v === q.order![i]);
  const got = normalizeName(r.text ?? "");
  if (!got) return false;
  return q.accepted!.some((a) => {
    const want = normalizeName(a);
    // Allow one typo in longer names.
    return got === want || (want.length >= 6 && editDistance(got, want) <= 1);
  });
}

export function correctAnswerText(q: Question): string {
  if (q.kind === "mcq") return q.choices![q.answer!]!;
  if (q.kind === "order") return q.order!.map((i) => q.items![i]).join(" → ");
  return q.accepted![0]!;
}

/* ---------------------------------- Builders --------------------------------- */

export type Focus = "all" | "minerals" | "rocks" | "igneous" | "sedimentary" | "metamorphic";

export function specimensFor(focus: Focus): Specimen[] {
  switch (focus) {
    case "minerals":
      return [...MINERALS];
    case "rocks":
      return [...ROCKS];
    case "igneous":
    case "sedimentary":
    case "metamorphic":
      return ROCKS.filter((r) => r.rockType === focus);
    default:
      return [...SPECIMENS];
  }
}

export interface PracticeOptions {
  focus: Focus;
  skills?: Skill[];
  count: number;
  typed?: boolean;
  /** Specimen ids to weight toward (e.g. the student's weakest). */
  prefer?: string[];
}

export function buildPractice(seed: number, o: PracticeOptions): QuestionSpec[] {
  const rng = new Rng(seed);
  const pool = specimensFor(o.focus);
  const skills = (o.skills?.length ? o.skills : SKILLS.map((s) => s.skill)).filter((s) => s !== "concept" || o.focus === "all");
  const out: QuestionSpec[] = [];
  let guard = 0;
  while (out.length < o.count && guard++ < o.count * 30) {
    const skill = rng.pick(skills);
    const qSeed = rng.int(0xffffffff);
    if (skill === "concept") {
      out.push({ skill, seed: qSeed });
      continue;
    }
    const preferred = o.prefer?.filter((id) => pool.some((p) => p.id === id)) ?? [];
    const s = preferred.length && rng.next() < 0.5 ? specimenById(rng.pick(preferred))! : rng.pick(pool);
    const gen = GENERATORS[skill];
    const typed = !!o.typed && (skill === "identify-mineral" || skill === "identify-rock");
    if (!gen(new Rng(qSeed), s, typed)) continue;
    if (out.some((x) => x.skill === skill && x.specimenId === s.id)) continue;
    out.push({ skill, seed: qSeed, specimenId: s.id, typed: typed || undefined });
  }
  return out;
}

export interface StationTest {
  stations: { specimenId: string; questions: QuestionSpec[] }[];
}

/**
 * A tournament-style station rotation: each station is one specimen with an
 * identification question plus one or two questions about it.
 */
export function buildStationTest(seed: number, stationCount: number, typedId = false): StationTest {
  const rng = new Rng(seed);
  const minerals = rng.shuffle(MINERALS).slice(0, Math.ceil(stationCount * 0.55));
  const rocks = rng.shuffle(ROCKS).slice(0, stationCount - minerals.length);
  const specimens = rng.shuffle([...minerals, ...rocks]);
  const stations = specimens.map((s) => {
    const idSkill: Skill = s.kind === "mineral" ? "identify-mineral" : "identify-rock";
    const qs: QuestionSpec[] = [{ skill: idSkill, seed: rng.int(0xffffffff), specimenId: s.id, typed: typedId || undefined }];
    const extra = rng.shuffle(skillsFor(s).filter((k) => k !== idSkill && k !== "hardness-order" && k !== "energy" && k !== "grade-order"));
    for (const k of extra.slice(0, rng.next() < 0.5 ? 1 : 2)) qs.push({ skill: k, seed: rng.int(0xffffffff), specimenId: s.id });
    return { specimenId: s.id, questions: qs };
  });
  return { stations };
}

export { sgText };
