import { generateBaconian } from "./ciphers/baconian.ts";
import { generateColumnar } from "./ciphers/columnar.ts";
import { generateCryptarithm } from "./ciphers/cryptarithm.ts";
import { generateMonoalphabetic } from "./ciphers/monoalphabetic.ts";
import { generateFractionatedMorse } from "./ciphers/morse.ts";
import { generateCheckerboard, generateHomophonic, generateNihilist } from "./ciphers/polybius.ts";
import { generatePorta } from "./ciphers/porta.ts";
import { Rng } from "./rng.ts";
import type { CipherType, Level, Puzzle, PuzzleOptions, PuzzleSpec } from "./types.ts";

const GENERATORS: Record<CipherType, (spec: PuzzleSpec) => Puzzle> = {
  aristocrat: generateMonoalphabetic,
  patristocrat: generateMonoalphabetic,
  xenocrypt: generateMonoalphabetic,
  baconian: generateBaconian,
  "fractionated-morse": generateFractionatedMorse,
  cryptarithm: generateCryptarithm,
  porta: generatePorta,
  columnar: generateColumnar,
  nihilist: generateNihilist,
  checkerboard: generateCheckerboard,
  homophonic: generateHomophonic,
};

/** Deterministic: the same spec always yields the same puzzle. */
export function generate(spec: PuzzleSpec): Puzzle {
  return GENERATORS[spec.type](spec);
}

/* --------------------------------- Mock tests -------------------------------- */

export interface TestPlan {
  level: Level;
  specs: PuzzleSpec[];
  /** Indices of special-bonus questions. */
  specials: number[];
}

type Slot = [CipherType, PuzzleOptions];

/**
 * Builds a tournament-style Division C test. Question mix follows the 2027
 * rules summary (what may appear at each level); counts are typical, not mandated.
 */
export function buildTest(level: Level, seed: number): TestPlan {
  const rng = new Rng(seed);
  const k = () => rng.pick(["k1", "k2", "k3"] as const);
  const kp = () => rng.pick(["k1", "k2"] as const);
  const len = () => rng.pick(["short", "medium", "medium", "long"] as const);

  const slots: Slot[] = [
    ["aristocrat", { timed: true, alphabet: "random", length: "medium" }],
    ["aristocrat", { alphabet: "random", hint: rng.pick(["none", "word"] as const), length: len() }],
    ["aristocrat", { alphabet: k(), hint: "none", length: len() }],
    ["aristocrat", { alphabet: k(), hint: "word", length: len() }],
    ["aristocrat", { alphabet: k(), mode: "keyword", length: "medium" }],
    ["patristocrat", { alphabet: rng.pick(["random", "k1", "k2"] as const), hint: "word", length: len() }],
    ["baconian", { symbols: rng.pick(["symbols", "letters"] as const), length: len() }],
    ["fractionated-morse", { length: len() }],
    ["cryptarithm", { length: rng.pick(["short", "medium"] as const) }],
    ["columnar", { hint: "word", length: len() }],
    ["checkerboard", { mode: level === "state" ? "cryptanalysis" : rng.pick(["decode", "cryptanalysis"] as const), length: len() }],
  ];

  if (level === "regional") {
    if (rng.next() < 0.6) slots.push(["xenocrypt", { alphabet: "random", hint: "word", length: len() }]);
    slots.push(
      ["porta", { mode: "decode", length: len() }],
      ["nihilist", { mode: "decode", length: len() }],
      ["homophonic", { mode: "cryptanalysis", length: len() }],
    );
  } else {
    slots.push(
      ["aristocrat", { alphabet: k(), mode: "keyword", length: "long" }],
      ["patristocrat", { alphabet: kp(), hint: "word", length: len() }],
      ["xenocrypt", { alphabet: rng.pick(["random", "k1", "k2"] as const), hint: "word", length: len() }],
      ["xenocrypt", { alphabet: "random", hint: "word", length: len() }],
      ["porta", { mode: "cryptanalysis", length: len() }],
      ["nihilist", { mode: "cryptanalysis", length: len() }],
      ["homophonic", { mode: "decode", length: len() }],
      ["homophonic", { mode: "cryptanalysis", length: len() }],
    );
    if (rng.next() < 0.5) slots.push(["xenocrypt", { alphabet: kp(), hint: "word", length: "short" }]);
  }

  // Keep the timed question first; shuffle the rest.
  const [timed, ...rest] = slots;
  const ordered = [timed!, ...rng.shuffle(rest)];
  const specs = ordered.map(([type, options], i) => ({ type, options, seed: rng.fork(i).int(0xffffffff) }));
  const candidates = specs.map((_, i) => i).filter((i) => i > 0);
  const specials = rng.shuffle(candidates).slice(0, 3).sort((a, b) => a - b);
  return { level, specs, specials };
}
