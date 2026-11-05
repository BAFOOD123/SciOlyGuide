---
title: Codebusters
type: Cryptanalysis
summary: Decrypt historical and modern ciphers by hand: Aristocrats, Baconian, Morse, Porta, columnar, Polybius variants and cryptarithms. Speed and accuracy win.
---

## At a glance

| | |
|---|---|
| **Team** | Up to **3** |
| **Time** | About 50 minutes |
| **Format** | Written (or computer-based) exam of cipher problems |
| **You may bring** | **Only writing utensils.** No references or tools. |
| **Provided** | A resource sheet (Morse table, English/Spanish letter frequencies, Porta table, Baconian mappings) |
| **Score** | **Exam Score + Timing Bonus + Special Bonus** (high score wins) |
| **Timed first question** | An Aristocrat; the sooner you solve it, the bigger the bonus |

> [!NOTE]
> This guide covers the concepts and techniques. For hands-on practice with auto-generated puzzles of every 2027 type, use the **Codebusters practice tool** in this app (learn, practice, timed and full tests). Confirm the cipher list in the official rules on soinc.org.

## How the event runs

The exam is a stack of cipher problems. **Separate the pages** and split them among your three members by strength (one does substitution ciphers, one does transposition/Polybius, one does Morse/Baconian/cryptarithms). The **first question is timed** — one person should attack it immediately and signal when solved.

**Scoring:**

- **Exam Score:** points per question. **Two or fewer errors = full credit.** Each error beyond that costs 100 points, but never below 0 for that question. (Keyword answers and cryptarithms need **zero** errors for full credit.)
- **Timing Bonus = 2 × (600 − seconds)** to solve the timed Aristocrat correctly (≤ 2 errors). Solve in 5 minutes (300 s) → 600 points. After 10 minutes the bonus is zero.
- **Special Bonus:** up to three marked non-Aristocrat questions solved with **no penalty points**: 1 → 150, 2 → 400, 3 → 750. At least one is a Homophonic cipher.

**Takeaway:** accuracy matters more than volume (errors are expensive), the **timing bonus is huge** (solve that first Aristocrat fast), and the **special bonuses** reward getting hard ciphers exactly right.

## The toolkit: frequency analysis

![English letter frequency chart](img:cb-frequency)

Most of these ciphers fall to **frequency analysis** of English (or Spanish):

- Most common English letters: **E T A O I N S H R D L U**. "ETAOIN SHRDLU."
- Most common **first** letters: T, A, O, I, S, W. Most common **last** letters: E, S, T, D, N.
- Common **doubles:** LL, EE, SS, OO, TT, FF, RR. Common **bigrams:** TH, HE, IN, ER, AN. Common **trigrams:** THE, AND, ING.
- One-letter words: **A, I**. Common two-letter words: OF, TO, IN, IS, IT, AS, AT. Three-letter: THE, AND.
- The apostrophe usually precedes **T, S, D, LL, RE, VE, M**.

Spanish (Xenocrypts): most common letters **E A O S R N I D L C**; common words EL, LA, DE, QUE, EN, UN; frequent accented words (though cipher text typically drops accents).

## The ciphers

### Aristocrats and Patristocrats (monoalphabetic substitution)

![An Aristocrat cryptogram being solved](img:cb-aristocrat)

Each plaintext letter maps to one ciphertext letter (a simple substitution). **No letter ever decrypts to itself.** Alphabets are built the ACA way:

- **K1:** the **plaintext** alphabet is keyword-mixed; ciphertext is straight.
- **K2:** the **ciphertext** alphabet is keyword-mixed (most common).
- **K3:** both use the **same** keyword-mixed alphabet (offset).
- **Random:** no keyword.

A **keyword alphabet** is built by writing the keyword (dropping repeats), then the rest of the alphabet: KEYWORD → KEYWORDABCFGHIJLMNPQSTUVXZ.

- **Aristocrats** keep **word spaces**. **Patristocrats** remove spaces and group letters in **fives** (K1 or K2), which is harder.
- **Xenocrypts** are Aristocrats in **Spanish** (English keyword alphabet).

**How to solve:**

1. Count letter frequencies in the ciphertext.
2. Guess the most frequent cipher letter is E or T.
3. Find short words: a single letter is A or I; THE is the most common 3-letter word; look for patterns.
4. Use the no-self-encryption rule to rule out mappings.
5. Fill in a frequency/substitution table and spread confirmed letters through the text.
6. For K1/K2/K3 answers, once you have most of the alphabet, **read the keyword** out of the mixed sequence (it may be the requested answer).

> [!TIP]
> Pattern words help: a word like `XYYZ` with a double in the middle (e.g., `LOOK`, `BOOK`). Use the resource sheet's frequencies.

### Baconian cipher

Each letter is encoded as **5 symbols** of two kinds (A/B), often disguised as **bold/italic, two fonts, two symbols, or case**. Decode by:

1. Reading the text as groups of 5, classifying each character as "a" or "b" (e.g., plain = a, bold = b).
2. Converting each 5-group with the **Baconian table** (provided): AAAAA=A, AAAAB=B, … (24-letter version merges I/J and U/V, or the 26-letter version).
3. Word Baconians include a **crib of ≥ 4 letters** to anchor you.

### Fractionated Morse

![Morse code chart](img:cb-morse)

Plaintext is turned into **Morse** (with `x` separating letters and `xx` between words), then the Morse stream is chopped into **groups of 3 symbols** (from {dot, dash, x}), and each group is mapped to a ciphertext letter via a keyword table. You get a **crib of ≥ 4 plaintext characters**.

**Solve:** place the crib, convert it to Morse, line it up under the ciphertext to recover which 3-symbol groups map to which cipher letters, then extend the table and decode the rest, reading the Morse back to plaintext.

### Cryptarithm

![A cryptarithm puzzle](img:cb-cryptarithm)

A base-10 arithmetic problem where **letters stand for digits** (e.g., SEND + MORE = MONEY). Each letter is one digit, each digit one letter; leading letters aren't 0.

**Solve:**

- Use **column arithmetic and carries**. The leading letter of a sum that's longer than its addends is **1**.
- Look for forced digits (a column where a letter + itself, or a known carry, pins a value).
- Test possibilities logically, not by brute force.
- The answer is the **decoded word/phrase** from the mapping, and it needs **zero errors** for credit.

### Porta cipher

A **reciprocal polyalphabetic** cipher using a keyword and the **Porta table** (provided). Each key letter selects a row that swaps the top and bottom halves of the alphabet. Because it's reciprocal, **encrypting and decrypting use the same operation**.

- **Given the key:** repeat the keyword over the ciphertext and use the Porta table row for each key letter to convert each cipher letter back.
- **Cryptanalysis (crib given, ≥ 3 at State/National):** place the crib, work out which key letters produce it, recover the keyword, and decode.

### Complete Columnar Transposition

![A columnar transposition grid](img:cb-columnar)

Plaintext is written into a grid **row by row** under a keyword, then read out **column by column** in the order set by the keyword's alphabetical ranking. It **rearranges letters, doesn't substitute** (so frequency analysis alone won't read it, but letter counts match English).

- Up to **9 columns** (Regional), **11** (State/National). You get a **crib** (≥ columns − 1 at Regional).
- **Solve:** figure out the number of columns and their order using the crib and by reconstructing the grid. Anagram columns so the crib and common words appear, then read across.

### Nihilist cipher

Combines a **Polybius square** (keyword) with a **numeric key**. Each plaintext letter becomes a two-digit Polybius number, then a repeating key (also via Polybius) is **added**. Given the keys, reverse it: subtract the key numbers, then look up each pair in the Polybius square. (Cryptanalysis with a crib at higher levels.)

### Polybius-based: 5×5 Checkerboard and Homophonic

![A 5x5 Polybius square](img:cb-polybius)

- **5×5 Checkerboard:** a Polybius square keyed by row and column keywords; each letter becomes a row+column pair. **All letters of the row/column keywords appear in the ciphertext.** Given the key (or a crib at higher levels), decode by looking up pairs.
- **Homophonic:** each plaintext letter can map to **several** ciphertext symbols (flattening frequencies, so it resists frequency analysis). You're given a **crib indicating ≥ 2 letters of the keyword**; the keyword has **four unique letters**. It's always a **special bonus** question, so solve it with zero penalty points for the big bonus.

## Strategy

1. **Split the test** immediately by strength. Hand the timed Aristocrat to your fastest solver.
2. **Timed question first:** speed here is worth up to 600+ points. Signal the moment it's solved (≤ 2 errors allowed).
3. **Chase the special bonuses** (including the Homophonic): they need **no errors**, but 3 of them are worth 750.
4. **Accuracy over speed** on the rest: a careless error past the second costs 100 points each. Double-check decoded plaintext.
5. **Do the easy points first** (Aristocrats, given-key Portas/Nihilists), then the harder cryptanalysis.
6. Use the **provided resource sheet** (frequencies, Morse, Porta, Baconian).

## Practice plan

1. **Master Aristocrats and Patristocrats** until you solve a typical one in a few minutes. Frequency analysis and pattern words are the core skill.
2. **Learn each cipher's algorithm** cold (encode and decode), especially given-key Porta, Nihilist, Checkerboard.
3. **Drill the crib-based cryptanalysis** (Morse, columnar, homophonic) — these win the special bonuses.
4. **Practice cryptarithms** for logical digit-solving.
5. **Time yourself** regularly, and practice Xenocrypts with Spanish frequencies.
6. Use this app's **Codebusters** practice (learn, practice, timed, full tests) for endless fresh puzzles.

## Common pitfalls

- Making a 3rd error (the first two are free, the next cost 100 each).
- Forgetting **no letter encrypts to itself** in Aristocrats/Patristocrats/Xenocrypts.
- Misreading bold vs italic in Baconian.
- Losing the timing bonus by not signaling, or by signaling with an error.
- Spending too long on one hard cipher instead of banking easy points.
- Cryptarithm or keyword answers needing **zero** errors (not two).

## Test yourself

<details><summary>1. In an Aristocrat, the most common cipher letter is "Q". What plaintext letter is it most likely to be?</summary>

E (the most common English letter).

</details>

<details><summary>2. Solve the timed Aristocrat in 4 minutes. What's the timing bonus?</summary>

240 s → 2 × (600 − 240) = 720 points.

</details>

<details><summary>3. A 400-point question has 5 errors. What does it score?</summary>

400 − 3(100) = 100 (the first 2 errors are free).

</details>

<details><summary>4. Why does the Homophonic cipher resist simple frequency analysis?</summary>

Each plaintext letter maps to several ciphertext symbols, flattening the frequency distribution.

</details>

<details><summary>5. What does a complete columnar transposition do to the letters?</summary>

It rearranges their order (transposition) without changing which letters appear, so letter frequencies still match English.

</details>

## Resources

- [Official event page and rules (soinc.org)](https://www.soinc.org/codebusters-c)
- [American Cryptogram Association](https://www.cryptogram.org/) (cipher definitions)
- [Scioly.org wiki: Codebusters](https://scioly.org/wiki/index.php/Codebusters)
- This app's **Codebusters** practice tool (every 2027 cipher type, timed tests)
