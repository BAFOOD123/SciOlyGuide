import type { CipherType } from "./types.ts";

export interface Source {
  label: string;
  url: string;
}

export const OVERVIEW: Source = {
  label: "Science Olympiad Codebusters Overview (soinc.org)",
  url: "https://www.soinc.org/sites/default/files/uploaded_files/CodeBusters_Overview25_0.pdf",
};
export const RULES_2027: Source = {
  label: "2026–27 Codebusters rules summary (toebes.com, linked from soinc.org)",
  url: "https://toebes.com/codebusters/Rule-Summary-2027.html",
};

/** Science Olympiad's own one-line description of the event (soinc.org/codebusters-c). */
export const EVENT_DESCRIPTION = {
  text: "Teams will cryptanalyze and decode encrypted messages using cryptanalysis techniques for historical and modern advanced ciphers.",
  source: { label: "soinc.org · Codebusters C", url: "https://www.soinc.org/codebusters-c" } satisfies Source,
};

export interface Official {
  /** How Science Olympiad's materials define the cipher (paraphrased). */
  definition: string;
  /** Origin and history, where the official overview gives it. */
  history?: string;
  source: Source;
}

/** Definitions paraphrased from Science Olympiad's Codebusters Overview. */
export const OFFICIAL: Record<CipherType, Official> = {
  aristocrat: {
    definition:
      "The standard substitution cipher, the kind printed in newspapers as a Cryptoquote, with one restriction: no letter may stand for itself. The alphabet can be random, or keyed to make solving easier. In a K1 alphabet the keyword is in the plaintext alphabet, in K2 it is in the ciphertext alphabet, and in K3 the same keyword is used in both, shifted.",
    source: OVERVIEW,
  },
  patristocrat: {
    definition:
      "Follows the same rules as an Aristocrat, but all spaces and punctuation are removed. Only the letters remain, split into groups for convenience. Groups of five are the American Cryptogram Association standard.",
    source: OVERVIEW,
  },
  xenocrypt: {
    definition:
      "Identical to an Aristocrat, except the plaintext is in a language other than English (Spanish in Science Olympiad). It is one of the less-attempted questions, which makes it a frequent tiebreaker between teams.",
    source: OVERVIEW,
  },
  baconian: {
    definition:
      "A steganographic cipher: it hides the message in how the text is presented, not in what it says. Each letter becomes a group of five A/B choices. The two values can be disguised as styles of type (such as bold and plain), as sets of symbols, or as ordinary-looking words.",
    history: "Devised by Francis Bacon in 1605.",
    source: OVERVIEW,
  },
  "fractionated-morse": {
    definition:
      "The plaintext is converted to Morse code and cut into groups of three symbols. A keyed alphabet then assigns one cipher letter to each three-symbol pattern. The first alphabet letter stands for •••, the last (usually Z) for ××–, and there's no letter for ×××.",
    history: "Invented in 1960 by an American Cryptogram Association member writing as FIDDLE.",
    source: OVERVIEW,
  },
  cryptarithm: {
    definition:
      "A cross between a cipher and a math problem: an arithmetic equation with letters in place of digits. Science Olympiad uses base 10, so every problem has exactly 10 different letters, and the answer comes from sorting the letters by their digit values.",
    history: "Their origin is unclear, but cryptarithms appear as far back as 1864.",
    source: OVERVIEW,
  },
  porta: {
    definition:
      "A forerunner of the Vigenère cipher that uses only thirteen alphabets. Each pair of keyword letters (AB, CD, …, YZ) selects one of them.",
    history:
      "Invented by Giovanni Battista della Porta in 1563, it was the first cipher to use a keyword that varies along the message.",
    source: OVERVIEW,
  },
  columnar: {
    definition:
      "A transposition cipher: the letters keep their identity but change position. The plaintext is written into a rectangle row by row, a key numbers the columns, and the ciphertext is read out column by column in key order.",
    source: OVERVIEW,
  },
  nihilist: {
    definition:
      "First a Polybius square is built from a keyword, using an alphabet without J. Each letter gets a two-digit row-and-column number from the square. A second keyword's numbers are then added to the plaintext numbers one letter at a time, so every ciphertext value falls between 22 and 110.",
    source: OVERVIEW,
  },
  checkerboard: {
    definition:
      "Built on a keyed 5×5 Polybius square whose rows and columns are labeled by two five-letter keywords instead of the digits 1–5. Each plaintext letter becomes a pair of letters (row label, then column label). The 2027 rules also require every letter of both keywords to appear in the ciphertext.",
    source: RULES_2027,
  },
  homophonic: {
    definition:
      "New for the 2026–27 season. A 25-letter alphabet (I and J combined) is numbered in four rows, 01–25, 26–50, 51–75 and 76–00. Each row starts under one letter of a four-letter keyword, so every plaintext letter can be written four different ways. That flattens the letter frequencies that normally give a substitution cipher away.",
    source: RULES_2027,
  },
};

export interface Guide {
  type: CipherType;
  summary: string;
  steps: string[];
  tips: string[];
}

/** Original study notes, written for SciOlyGuide. */
export const GUIDES: Record<CipherType, Guide> = {
  aristocrat: {
    type: "aristocrat",
    summary:
      "Each plaintext letter is replaced by one fixed cipher letter, and no letter stands for itself. Word spaces and punctuation are kept, so word shapes give a lot away.",
    steps: [
      "Count letter frequencies. In English, E, T, A, O, I, N, S, H and R are the most common.",
      "Find one-letter words, which are almost always A or I.",
      "Find short repeated words: THE, AND, THAT, WITH, FOR, ARE, YOU, THIS.",
      "Use apostrophes. 'S, 'T, 'LL, 'RE and 'VE are strong clues.",
      "Look for repeated letter patterns. ABCA might be THAT, ABB might be ALL or TOO, and ABCCBA patterns are rare but distinctive.",
      "Every letter you place shows up in other words. Fill those in and read the partial words.",
    ],
    tips: [
      "K1 alphabet: write the plaintext letters in cipher-alphabet order and the keyword appears in the plaintext row.",
      "K2 alphabet: write the cipher letters in plaintext order (A–Z) and the keyword appears in the cipher row.",
      "K3 alphabet: the same keyed alphabet is used for both rows, shifted. Once you know a few pairs, chains such as A→N→T… rebuild the alphabet.",
      "For the timed question, go for speed. Two errors are free, so don't spend time double-checking every letter.",
    ],
  },
  patristocrat: {
    type: "patristocrat",
    summary:
      "An Aristocrat with the spaces removed and the letters written in groups of five. Frequency and common letter sequences replace word shapes as your main tools.",
    steps: [
      "Run a frequency count, then mark the most frequent cipher letters as likely E, T, A, O.",
      "Search for common trigraphs and digraphs: THE, ING, AND, ION, TH, HE, IN, ER.",
      "Place the given crib word. Look for a stretch of ciphertext whose repeated-letter pattern matches it.",
      "Find word boundaries as you go. Once THE is located, the words around it begin to show.",
    ],
    tips: [
      "A cipher letter that appears often but never next to itself is usually a vowel.",
      "Q is almost always followed by U, so try that pair early.",
    ],
  },
  xenocrypt: {
    type: "xenocrypt",
    summary:
      "An Aristocrat in Spanish. The alphabet has 27 letters including Ñ, and accent marks are dropped.",
    steps: [
      "Common Spanish letters are E, A, O, S, N, R, I, L, D.",
      "Common short words: DE, LA, EL, QUE, EN, LOS, SE, DEL, LAS, UN, POR, CON, NO, UNA.",
      "QUE is very common, and Q is always followed by U.",
      "Words often end in -O, -A, -OS, -AS, -AR, -ER, -CION.",
    ],
    tips: ["A single-letter word is often Y (and), A or O.", "Practice reading proverbs (refranes). They show up often."],
  },
  baconian: {
    type: "baconian",
    summary:
      "Each letter is a five-symbol group of A's and B's (24-letter alphabet: I/J and U/V share a code). The symbols are disguised, and you work out which ones mean A and which mean B.",
    steps: [
      "Split the symbols into two classes. Try visual splits (filled vs hollow, up vs down) or letter rules (A–M vs N–Z, vowels vs consonants).",
      "Use the crib. Write its letters' codes under the highlighted groups to see which symbols are A and which are B.",
      "Convert each group to A/B and read it off the Baconian table.",
    ],
    tips: [
      "AAAAA is A and ABBAA is N. A run of the same symbol usually means A's.",
      "If a decoded group looks like nonsense, try swapping A and B.",
    ],
  },
  "fractionated-morse": {
    type: "fractionated-morse",
    summary:
      "The plaintext is turned into Morse code with x between letters and xx between words. The stream is cut into groups of three (trigraphs), and each trigraph is replaced by a letter from a keyed table.",
    steps: [
      "Write out the crib in Morse with x separators.",
      "Line it up under the highlighted cipher letters. Try each of the three possible offsets.",
      "Each cipher letter now gives you a trigraph. Fill them in everywhere they appear.",
      "Decode the partial Morse on either side of the crib and guess words to fill more trigraphs.",
      "The keyed alphabet usually starts with the keyword, followed by the remaining letters in order, which helps predict unknown trigraphs.",
    ],
    tips: ["xxx never appears, so only 26 trigraphs are used.", "A trigraph that starts with x follows the end of a letter."],
  },
  cryptarithm: {
    type: "cryptarithm",
    summary: "An addition problem where each letter is a different digit. Solve it, then read off the letters for 0–9.",
    steps: [
      "Start at the leftmost column. A result longer than the addends means its first letter is 1.",
      "Work column by column from the right, tracking carries (0 or 1 for two addends).",
      "A letter that equals itself plus something in a column tells you that something is 0 (or 9 with a carry).",
      "Check each guess against every column before you commit.",
    ],
    tips: ["Leading letters can't be 0.", "Write the digits 0–9 down the side and cross off each one as you use it."],
  },
  porta: {
    type: "porta",
    summary:
      "Porta uses 13 alphabets, one for each key-letter pair (AB, CD, …, YZ). It is reciprocal, so decrypting works exactly like encrypting.",
    steps: [
      "Write the keyword repeatedly over the letters (skip spaces and punctuation).",
      "For each letter, find the tableau row for its key letter and swap the letter with the one paired with it in that row.",
      "For cryptanalysis, use the crib to recover the key pair at each position. The key repeats with the keyword's length.",
    ],
    tips: [
      "A–M always maps to N–Z and back, so a cipher letter in A–M decodes to a letter in N–Z.",
      "Each position only tells you the key pair (for example, C or D), not the exact letter.",
    ],
  },
  columnar: {
    type: "columnar",
    summary:
      "The plaintext is written in rows under a set number of columns (padded with X) and read off column by column in a secret order.",
    steps: [
      "The number of columns must divide the ciphertext length. List the possible counts.",
      "For each count, split the ciphertext into that many equal columns.",
      "Use the crib. Find column arrangements where its letters appear in a row, reading across.",
      "Once two columns are placed side by side, extend them using common letter pairs.",
    ],
    tips: ["Q next to U and TH or HE across neighbouring columns are good anchors.", "Padding X's end up in the last row."],
  },
  nihilist: {
    type: "nihilist",
    summary:
      "Each letter becomes its row-column number in a keyed 5×5 Polybius square. The coordinates of a repeating keyword are then added with ordinary addition.",
    steps: [
      "Build the Polybius square from the Polybius key (I and J share a cell).",
      "Write the keyword's coordinates repeatedly under the cipher numbers.",
      "Subtract (cipher − key) and read each result as row then column.",
      "For cryptanalysis, subtract the crib's coordinates to get key numbers, then find the period where they repeat.",
    ],
    tips: [
      "Every digit of a valid difference is between 1 and 5. A 0 or 6+ means a slip.",
      "Cipher numbers range from 22 to 110.",
    ],
  },
  checkerboard: {
    type: "checkerboard",
    summary:
      "A keyed 5×5 Polybius square whose rows are labeled by one five-letter keyword and whose columns by another. Each letter becomes a pair (row label, column label).",
    steps: [
      "Split the ciphertext into pairs.",
      "Build the square from the Polybius key, then write the row keyword down the side and the column keyword across the top.",
      "Look up each pair.",
      "For cryptanalysis, the crib gives letter-to-pair matches. Pairs that share a first symbol are in the same row.",
    ],
    tips: [
      "First symbols only come from the row keyword and second symbols only from the column keyword.",
      "In 2027, every keyword letter appears somewhere in the ciphertext.",
    ],
  },
  homophonic: {
    type: "homophonic",
    summary:
      "New for 2027. A 25-letter alphabet (I/J combined) has four numbered rows: 01–25, 26–50, 51–75, 76–00. Each row starts under one letter of a four-letter keyword, so every plaintext letter has four possible numbers.",
    steps: [
      "Tell the rows apart by size: 01–25, 26–50, 51–75 and 76–00 (00 = 100).",
      "Decode: in each row, the first number sits under that row's keyword letter. Count forward to find the letter.",
      "Cryptanalysis: each crib letter over a number reveals that row's keyword letter. Count back from the letter.",
      "With two or three rows known, guess words to recover the remaining keyword letters.",
    ],
    tips: [
      "The same number always means the same letter, so fill in every repeat.",
      "There's no Homophonic table on the resource sheet. Practice building one quickly.",
    ],
  },
};
