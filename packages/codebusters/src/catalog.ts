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
    blurb: "The classic Cryptoquote: a substitution cipher with word spaces where no letter stands for itself. Random, K1, K2 or K3 alphabets.",
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
    blurb: "An Aristocrat with the spaces and punctuation stripped out and the letters in groups of five.",
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
    blurb: "An Aristocrat in Spanish (27 letters, with Ñ). Teams often skip it, so it often decides close tests.",
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
    blurb: "Francis Bacon's 1605 steganography: each letter hides as five A/B symbols in disguise.",
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
    blurb: "Morse code cut into three-symbol groups, each replaced by a letter from a keyed alphabet.",
    levels: { regional: ["cryptanalysis"], state: ["cryptanalysis"] },
    options: [LENGTH],
    defaults: { length: "medium" },
  },
  {
    type: "cryptarithm",
    name: "Cryptarithm",
    family: "Other",
    blurb: "Arithmetic with letters in place of digits. Base 10, so there are exactly ten letters to place.",
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
    blurb: "Della Porta's 1563 cipher: 13 reciprocal alphabets, chosen by pairs of keyword letters.",
    levels: { regional: ["decode"], state: ["decode", "cryptanalysis"] },
    options: [DECODE_OR_CRYPT, LENGTH],
    defaults: { mode: "decode", length: "medium" },
  },
  {
    type: "columnar",
    name: "Complete Columnar",
    family: "Transposition",
    blurb: "Written in by rows, read out by columns in a keyed order. Recover the order from a crib.",
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
    blurb: "Polybius-square numbers plus a repeating keyword's numbers, giving values from 22 to 110.",
    levels: { regional: ["decode"], state: ["decode", "cryptanalysis"] },
    options: [DECODE_OR_CRYPT, LENGTH],
    defaults: { mode: "decode", length: "medium" },
  },
  {
    type: "checkerboard",
    name: "Checkerboard",
    family: "Polybius",
    blurb: "A keyed Polybius square with two five-letter keywords labeling its rows and columns.",
    levels: { regional: ["decode", "cryptanalysis"], state: ["decode", "cryptanalysis"] },
    options: [DECODE_OR_CRYPT, LENGTH],
    defaults: { mode: "decode", length: "medium" },
  },
  {
    type: "homophonic",
    name: "Homophonic",
    family: "Substitution",
    blurb: "New for 2027: a four-row number table keyed by a four-letter keyword, so every letter has four numbers.",
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
