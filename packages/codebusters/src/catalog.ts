import type { CipherType, Level, Mode, PuzzleOptions } from "./types.ts";

export interface OptionChoice<V extends string = string> {
  value: V;
  label: string;
}

export interface OptionDef {
  key: keyof PuzzleOptions;
  label: string;
  choices: OptionChoice[];
}

export interface CipherInfo {
  type: CipherType;
  name: string;
  family: "Substitution" | "Polybius" | "Transposition" | "Polyalphabetic" | "Other";
  blurb: string;
  /** 2027 Division C usage by level (from the 2027 rules summary). */
  levels: Record<Level, Mode[]>;
  options: OptionDef[];
  defaults: PuzzleOptions;
}

const LENGTH: OptionDef = {
  key: "length",
  label: "Length",
  choices: [
    { value: "short", label: "Short" },
    { value: "medium", label: "Medium" },
    { value: "long", label: "Long" },
  ],
};

const DECODE_OR_CRYPT: OptionDef = {
  key: "mode",
  label: "Question",
  choices: [
    { value: "decode", label: "Decode (key given)" },
    { value: "cryptanalysis", label: "Cryptanalysis (crib)" },
  ],
};

/**
 * Division C, 2026–27 season. Source: toebes.com 2027 rules summary table
 * (tracks the official rules). Hill and Affine were removed for 2027; Homophonic is new.
 */
export const CIPHERS: readonly CipherInfo[] = [
  {
    type: "aristocrat",
    name: "Aristocrat",
    family: "Substitution",
    blurb: "Monoalphabetic substitution with word spaces. Random, K1, K2 and K3 alphabets, plus keyword questions.",
    levels: { regional: ["decode", "cryptanalysis", "keyword"], state: ["decode", "cryptanalysis", "keyword"] },
    options: [
      {
        key: "alphabet",
        label: "Alphabet",
        choices: [
          { value: "random", label: "Random" },
          { value: "k1", label: "K1" },
          { value: "k2", label: "K2" },
          { value: "k3", label: "K3" },
        ],
      },
      {
        key: "mode",
        label: "Question",
        choices: [
          { value: "decode", label: "Solve the quote" },
          { value: "keyword", label: "Find the keyword" },
        ],
      },
      {
        key: "hint",
        label: "Hint",
        choices: [
          { value: "none", label: "None" },
          { value: "word", label: "One word" },
          { value: "letters", label: "Three letters" },
        ],
      },
      LENGTH,
    ],
    defaults: { alphabet: "random", mode: "decode", hint: "none", length: "medium" },
  },
  {
    type: "patristocrat",
    name: "Patristocrat",
    family: "Substitution",
    blurb: "Monoalphabetic substitution with spaces removed and letters in groups of five.",
    levels: { regional: ["decode", "cryptanalysis"], state: ["decode", "cryptanalysis"] },
    options: [
      {
        key: "alphabet",
        label: "Alphabet",
        choices: [
          { value: "random", label: "Random" },
          { value: "k1", label: "K1" },
          { value: "k2", label: "K2" },
        ],
      },
      {
        key: "hint",
        label: "Hint",
        choices: [
          { value: "word", label: "One word" },
          { value: "letters", label: "Three letters" },
          { value: "none", label: "None" },
        ],
      },
      LENGTH,
    ],
    defaults: { alphabet: "random", hint: "word", length: "medium" },
  },
  {
    type: "xenocrypt",
    name: "Xenocrypt",
    family: "Substitution",
    blurb: "An Aristocrat in Spanish, using the 27-letter alphabet with Ñ. Accents are dropped.",
    levels: { regional: ["decode", "cryptanalysis"], state: ["decode", "cryptanalysis"] },
    options: [
      {
        key: "alphabet",
        label: "Alphabet",
        choices: [
          { value: "random", label: "Random" },
          { value: "k1", label: "K1" },
          { value: "k2", label: "K2" },
        ],
      },
      {
        key: "hint",
        label: "Hint",
        choices: [
          { value: "word", label: "One word" },
          { value: "letters", label: "Three letters" },
          { value: "none", label: "None" },
        ],
      },
      LENGTH,
    ],
    defaults: { alphabet: "random", hint: "word", length: "medium" },
  },
  {
    type: "baconian",
    name: "Baconian",
    family: "Other",
    blurb: "Each letter becomes five A/B symbols. Work out which symbols mean A and which mean B.",
    levels: { regional: ["cryptanalysis"], state: ["cryptanalysis"] },
    options: [
      {
        key: "symbols",
        label: "Disguise",
        choices: [
          { value: "symbols", label: "Symbols" },
          { value: "letters", label: "Letters" },
        ],
      },
      LENGTH,
    ],
    defaults: { symbols: "symbols", length: "medium" },
  },
  {
    type: "fractionated-morse",
    name: "Fractionated Morse",
    family: "Other",
    blurb: "Morse code (x between letters, xx between words) cut into trigraphs, each replaced by a letter.",
    levels: { regional: ["cryptanalysis"], state: ["cryptanalysis"] },
    options: [LENGTH],
    defaults: { length: "medium" },
  },
  {
    type: "cryptarithm",
    name: "Cryptarithm",
    family: "Other",
    blurb: "Letter arithmetic in base 10. Find each letter's digit and give the word for 0–9.",
    levels: { regional: ["cryptanalysis"], state: ["cryptanalysis"] },
    options: [
      {
        key: "length",
        label: "Size",
        choices: [
          { value: "short", label: "Two 5-digit" },
          { value: "medium", label: "Two 6-digit" },
          { value: "long", label: "Three 5-digit" },
        ],
      },
    ],
    defaults: { length: "medium" },
  },
  {
    type: "porta",
    name: "Porta",
    family: "Polyalphabetic",
    blurb: "A reciprocal polyalphabetic cipher. Each keyword letter pair selects one of 13 alphabets.",
    levels: { regional: ["decode"], state: ["decode", "cryptanalysis"] },
    options: [DECODE_OR_CRYPT, LENGTH],
    defaults: { mode: "decode", length: "medium" },
  },
  {
    type: "columnar",
    name: "Complete Columnar",
    family: "Transposition",
    blurb: "The plaintext is written in rows and read off by columns in a secret order. Recover it from a crib.",
    levels: { regional: ["cryptanalysis"], state: ["cryptanalysis"] },
    options: [
      {
        key: "hint",
        label: "Column hint",
        choices: [
          { value: "word", label: "Range" },
          { value: "letters", label: "Exact count" },
          { value: "none", label: "None" },
        ],
      },
      LENGTH,
    ],
    defaults: { hint: "word", length: "medium" },
  },
  {
    type: "nihilist",
    name: "Nihilist Substitution",
    family: "Polybius",
    blurb: "Polybius-square coordinates plus a repeating keyword's coordinates.",
    levels: { regional: ["decode"], state: ["decode", "cryptanalysis"] },
    options: [DECODE_OR_CRYPT, LENGTH],
    defaults: { mode: "decode", length: "medium" },
  },
  {
    type: "checkerboard",
    name: "Checkerboard",
    family: "Polybius",
    blurb: "A keyed Polybius square whose rows and columns are labeled by two five-letter keywords.",
    levels: { regional: ["decode", "cryptanalysis"], state: ["decode", "cryptanalysis"] },
    options: [DECODE_OR_CRYPT, LENGTH],
    defaults: { mode: "decode", length: "medium" },
  },
  {
    type: "homophonic",
    name: "Homophonic",
    family: "Substitution",
    blurb: "New for 2027. Four numbered rows, each keyed by a keyword letter, so every letter has four numbers.",
    levels: { regional: ["cryptanalysis"], state: ["cryptanalysis", "decode"] },
    options: [
      {
        key: "mode",
        label: "Question",
        choices: [
          { value: "cryptanalysis", label: "Cryptanalysis (crib)" },
          { value: "decode", label: "Decode (keyword given)" },
        ],
      },
      LENGTH,
    ],
    defaults: { mode: "cryptanalysis", length: "medium" },
  },
];

export function cipherInfo(type: CipherType): CipherInfo {
  const info = CIPHERS.find((c) => c.type === type);
  if (!info) throw new Error(`unknown cipher type ${type}`);
  return info;
}

export function isCipherType(s: string): s is CipherType {
  return CIPHERS.some((c) => c.type === s);
}
