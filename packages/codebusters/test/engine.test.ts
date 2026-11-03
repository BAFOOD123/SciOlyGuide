import { describe, expect, it } from "vitest";
import {
  BACON24,
  CIPHERS,
  EN,
  EN25,
  TRIGRAPHS,
  baconDecode,
  buildTest,
  columnarDecrypt,
  columnarEncrypt,
  countSolutions,
  decodeMorseStream,
  generate,
  grade,
  homophonicDecode,
  keyedAlphabet,
  polybiusSquare,
  portaLetter,
  portaTable,
  timedBonus,
  specialBonus,
  type CipherType,
  type Puzzle,
  type PuzzleOptions,
  type Token,
} from "../src/index.ts";

const SEEDS = Array.from({ length: 40 }, (_, i) => (i + 1) * 2654435761);

function cipherTokens(p: Puzzle): Extract<Token, { k: "c" }>[] {
  return p.display.tokens.filter((t): t is Extract<Token, { k: "c" }> => t.k === "c");
}
function sol(p: Puzzle, label: string): string {
  const v = p.solution.find((s) => s.label === label)?.value;
  if (v === undefined) throw new Error(`missing solution ${label}`);
  return v;
}
function perfect(p: Puzzle) {
  return p.answer.kind === "plaintext"
    ? { plain: p.answer.value.slice() }
    : { plain: [], final: p.answer.value.join("") };
}

/** Every type × every catalog option combination. */
function allVariants(): [CipherType, PuzzleOptions][] {
  const out: [CipherType, PuzzleOptions][] = [];
  for (const c of CIPHERS) {
    let combos: PuzzleOptions[] = [{ ...c.defaults }];
    for (const def of c.options) {
      combos = combos.flatMap((base) => def.choices.map((ch) => ({ ...base, [def.key]: ch.value })));
    }
    for (const o of combos) out.push([c.type, o]);
  }
  out.push(["aristocrat", { timed: true }]);
  return out;
}

describe("all generators", () => {
  const variants = allVariants();

  it("are deterministic", () => {
    for (const [type, options] of variants) {
      const a = generate({ type, options, seed: 42 });
      const b = generate({ type, options, seed: 42 });
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });

  it("produce well-formed puzzles that grade perfectly with the true answer", () => {
    for (const [type, options] of variants) {
      for (const seed of SEEDS.slice(0, 8)) {
        const p = generate({ type, options, seed });
        expect(p.points).toBeGreaterThan(0);
        if (p.answer.kind === "plaintext") {
          expect(p.answer.value.length).toBe(p.display.answerLength);
          if (p.display.layout === "aligned") {
            const idx = cipherTokens(p).map((t) => t.a);
            expect(idx).toEqual(Array.from({ length: p.display.answerLength }, (_, i) => i));
          }
        }
        const g = grade(p, perfect(p));
        expect(g, `${type} ${JSON.stringify(options)} seed ${seed}`).toMatchObject({ errors: 0, score: p.points, solved: true });
      }
    }
  });

  it("propagation is only enabled when identical units always mean the same letter", () => {
    for (const [type, options] of variants) {
      for (const seed of SEEDS.slice(0, 5)) {
        const p = generate({ type, options, seed });
        if (!p.display.propagate || p.answer.kind !== "plaintext") continue;
        const seen = new Map<string, string>();
        for (const t of cipherTokens(p)) {
          const letter = p.answer.value[t.a!]!;
          expect(seen.get(t.t) ?? letter).toBe(letter);
          seen.set(t.t, letter);
        }
      }
    }
  });
});

describe("monoalphabetic", () => {
  for (const type of ["aristocrat", "patristocrat", "xenocrypt"] as const) {
    for (const alphabet of ["random", "k1", "k2", "k3"] as const) {
      it(`${type} ${alphabet}: bijective, no self-encipherment, keyed correctly`, () => {
        for (const seed of SEEDS) {
          const p = generate({ type, seed, options: { alphabet } });
          const pairs = sol(p, "Plain → cipher").split(" ").map((s) => [...s] as [string, string]);
          const enc = new Map(pairs);
          const alpha = type === "xenocrypt" ? [...p.display.answerAlphabet] : EN;
          expect(new Set(enc.values()).size).toBe(alpha.length);
          for (const [pl, c] of pairs) expect(c).not.toBe(pl);
          cipherTokens(p).forEach((t) => expect(enc.get(p.answer.value[t.a!]!)).toBe(t.t));
          const kind = sol(p, "Alphabet");
          if (kind !== "Random") {
            const keyed = keyedAlphabet(sol(p, "Keyword"), alpha);
            const plainOrder = alpha.map((pl) => enc.get(pl)!);
            if (kind === "K2") {
              // Cipher row (in plain A–Z order) is the keyed alphabet, rotated.
              const rot = plainOrder.indexOf(keyed[0]!);
              expect([...plainOrder.slice(rot), ...plainOrder.slice(0, rot)]).toEqual(keyed);
            }
            if (kind === "K1") {
              // Plain row written in cipher A–Z order is the keyed alphabet, rotated.
              const dec = new Map(pairs.map(([pl, c]) => [c, pl]));
              const cipherOrder = alpha.map((c) => dec.get(c)!);
              const rot = cipherOrder.indexOf(keyed[0]!);
              expect([...cipherOrder.slice(rot), ...cipherOrder.slice(0, rot)]).toEqual(keyed);
            }
          }
        }
      });
    }
  }

  it("patristocrat has no word breaks and groups of five", () => {
    const p = generate({ type: "patristocrat", seed: 7, options: {} });
    const groups = p.display.tokens
      .map((t) => (t.k === "s" ? "|" : t.k === "c" ? "x" : "?"))
      .join("")
      .split("|");
    expect(groups.slice(0, -1).every((g) => g.length === 5)).toBe(true);
  });

  it("xenocrypt uses the Spanish alphabet with Ñ", () => {
    const p = generate({ type: "xenocrypt", seed: 3, options: {} });
    expect(p.display.answerAlphabet).toContain("Ñ");
    expect(p.display.answerAlphabet.length).toBe(27);
  });

  it("keyword question answer is the keyword and must be exact", () => {
    const p = generate({ type: "aristocrat", seed: 11, options: { mode: "keyword", alphabet: "k2" } });
    expect(p.answer.kind).toBe("keyword");
    expect(p.answer.value.join("")).toBe(sol(p, "Keyword"));
    const typo = p.answer.value.slice();
    typo[0] = typo[0] === "A" ? "B" : "A";
    expect(grade(p, { plain: [], final: typo.join("") })).toMatchObject({ errors: 1, solved: false, score: p.points - 100 });
  });
});

describe("baconian", () => {
  it("24-letter table round trips", () => {
    expect(BACON24.length).toBe(24);
    expect(baconDecode("AAAAA")).toBe("A");
    expect(baconDecode("ABBAA")).toBe("N");
  });

  it("groups decode with the hidden scheme", () => {
    for (const symbols of ["symbols", "letters"] as const) {
      for (const seed of SEEDS) {
        const p = generate({ type: "baconian", seed, options: { symbols } });
        const groups = cipherTokens(p).map((t) => t.t);
        const syms = [...new Set(groups.join(""))];
        // Recover the A-set from the true answer and check it is consistent.
        const aSet = new Set<string>();
        const bSet = new Set<string>();
        groups.forEach((g, i) => {
          const code = BACON24.indexOf(p.answer.value[i]!).toString(2).padStart(5, "0");
          [...g].forEach((ch, j) => (code[j] === "0" ? aSet : bSet).add(ch));
        });
        for (const s of syms) expect(aSet.has(s) && bSet.has(s)).toBe(false);
        const decoded = groups.map((g) => baconDecode([...g].map((ch) => (aSet.has(ch) ? "A" : "B")).join("")));
        expect(decoded).toEqual(p.answer.value);
      }
    }
  });
});

describe("fractionated morse", () => {
  it("uses 26 trigraphs and decodes back to the plaintext", () => {
    expect(TRIGRAPHS.length).toBe(26);
    expect(TRIGRAPHS).not.toContain("xxx");
    for (const seed of SEEDS) {
      const p = generate({ type: "fractionated-morse", seed, options: {} });
      const table = new Map(
        sol(p, "Trigraph table")
          .split(/\s+/)
          .map((e) => e.split("=") as [string, string]),
      );
      const stream = cipherTokens(p).map((t) => table.get(t.t)!).join("");
      expect(stream).not.toMatch(/xxx/);
      expect(decodeMorseStream(stream).replace(/ /g, "")).toBe(p.answer.value.join(""));
      expect(cipherTokens(p).some((t) => t.crib)).toBe(true);
    }
  });
});

describe("porta", () => {
  it("matches the standard tableau and is reciprocal", () => {
    const table = portaTable();
    expect(table[0]).toEqual({ keys: "AB", row: "NOPQRSTUVWXYZ" });
    expect(table[1]).toEqual({ keys: "CD", row: "ZNOPQRSTUVWXY" });
    for (const k of EN) for (const l of EN) expect(portaLetter(portaLetter(l, k), k)).toBe(l);
  });

  it("decodes with the keyword", () => {
    for (const mode of ["decode", "cryptanalysis"] as const) {
      for (const seed of SEEDS) {
        const p = generate({ type: "porta", seed, options: { mode } });
        const kw = sol(p, "Keyword");
        cipherTokens(p).forEach((t) => expect(portaLetter(t.t, kw[t.a! % kw.length]!)).toBe(p.answer.value[t.a!]));
      }
    }
  });
});

describe("complete columnar", () => {
  it("decrypt inverts encrypt and cipher is a complete rectangle", () => {
    for (const seed of SEEDS) {
      const p = generate({ type: "columnar", seed, options: {} });
      const cols = Number(sol(p, "Columns"));
      const order = sol(p, "Read order").split(" ").map((n) => Number(n) - 1);
      const cipher = cipherTokens(p).map((t) => t.t);
      expect(cipher.length % cols).toBe(0);
      expect(columnarDecrypt(cipher, order).slice(0, p.answer.value.length)).toEqual(p.answer.value);
      expect(columnarEncrypt(p.answer.value, order)).toEqual(cipher);
    }
  });
});

describe("polybius family", () => {
  it("nihilist: cipher − key gives valid coordinates of the plaintext", () => {
    for (const mode of ["decode", "cryptanalysis"] as const) {
      for (const seed of SEEDS) {
        const p = generate({ type: "nihilist", seed, options: { mode } });
        const sq = polybiusSquare(sol(p, "Polybius key"));
        const kw = sol(p, "Keyword").replace(/J/g, "I");
        const coord = (l: string) => {
          const i = sq.indexOf(l);
          return (Math.floor(i / 5) + 1) * 10 + (i % 5) + 1;
        };
        cipherTokens(p).forEach((t) => {
          const diff = Number(t.t) - coord(kw[t.a! % kw.length]!);
          const r = Math.floor(diff / 10);
          const c = diff % 10;
          expect(r >= 1 && r <= 5 && c >= 1 && c <= 5).toBe(true);
          expect(sq[(r - 1) * 5 + (c - 1)]).toBe(p.answer.value[t.a!]);
        });
      }
    }
  });

  it("checkerboard: pairs decode and every keyword letter appears", () => {
    for (const mode of ["decode", "cryptanalysis"] as const) {
      for (const seed of SEEDS) {
        const p = generate({ type: "checkerboard", seed, options: { mode } });
        const sq = polybiusSquare(sol(p, "Polybius key"));
        const rk = sol(p, "Row keyword");
        const ck = sol(p, "Column keyword");
        const pairs = cipherTokens(p);
        pairs.forEach((t) => {
          expect(sq[rk.indexOf(t.t[0]!) * 5 + ck.indexOf(t.t[1]!)]).toBe(p.answer.value[t.a!]);
        });
        expect(new Set(pairs.map((t) => t.t[0]))).toEqual(new Set(rk));
        expect(new Set(pairs.map((t) => t.t[1]))).toEqual(new Set(ck));
      }
    }
  });

  it("homophonic: numbers decode with the keyword; crib reveals ≥2 rows", () => {
    expect(EN25.length).toBe(25);
    for (const mode of ["decode", "cryptanalysis"] as const) {
      for (const seed of SEEDS) {
        const p = generate({ type: "homophonic", seed, options: { mode } });
        const kw = sol(p, "Keyword");
        cipherTokens(p).forEach((t) => {
          expect(t.t).toMatch(/^\d\d$/);
          expect(homophonicDecode(kw, t.t)).toBe(p.answer.value[t.a!]);
        });
        if (mode === "cryptanalysis") {
          const rows = new Set(
            cipherTokens(p)
              .filter((t) => t.crib)
              .map((t) => Math.floor(((t.t === "00" ? 100 : Number(t.t)) - 1) / 25)),
          );
          expect(rows.size).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });
});

describe("cryptarithm", () => {
  it("solver counts known puzzles", () => {
    expect(countSolutions(["SEND", "MORE"], "MONEY")).toBe(1);
  });

  it("generated puzzles have a unique solution matching the key", () => {
    for (const length of ["short", "medium", "long"] as const) {
      for (const seed of SEEDS.slice(0, 12)) {
        const p = generate({ type: "cryptarithm", seed, options: { length } });
        const rows = p.display.lines!.map((l) => l.replace(/[+\s-]/g, ""));
        const addends = rows.slice(0, -2);
        const s = rows.at(-1)!;
        const givenText = p.display.given.find((g) => g.label === "Given")?.value;
        const fixed = new Map(
          (givenText ? givenText.split(", ") : []).map((e) => {
            const [l, d] = e.split(" = ");
            return [l!, Number(d)] as const;
          }),
        );
        expect(countSolutions(addends, s, 2, fixed)).toBe(1);
        expect(fixed.size).toBeLessThanOrEqual(3);
        const key = p.answer.value.join("");
        const val = (w: string) => Number([...w].map((c) => key.indexOf(c)).join(""));
        expect(addends.reduce((t, w) => t + val(w), 0)).toBe(val(s));
      }
    }
  });
});

describe("scoring", () => {
  it("allows two free errors then deducts 100 per error", () => {
    const p = generate({ type: "aristocrat", seed: 5, options: {} });
    const resp = { plain: p.answer.value.slice() };
    const wrongAt = (n: number) => {
      const r = { plain: resp.plain.slice() };
      for (let i = 0; i < n; i++) r.plain[i] = "";
      return grade(p, r);
    };
    expect(wrongAt(2)).toMatchObject({ errors: 2, score: p.points, solved: true });
    expect(wrongAt(3)).toMatchObject({ errors: 3, score: p.points - 100, solved: false });
    expect(wrongAt(50).score).toBe(0);
  });

  it("treats I/J as equivalent in 25-letter ciphers", () => {
    const p = generate({ type: "homophonic", seed: 9, options: {} });
    const plain = p.answer.value.map((c) => (c === "I" ? "J" : c));
    expect(grade(p, { plain }).errors).toBe(0);
  });

  it("timed and special bonuses", () => {
    expect(timedBonus(0)).toBe(1200);
    expect(timedBonus(300)).toBe(600);
    expect(timedBonus(600)).toBe(0);
    expect([0, 1, 2, 3, 4].map(specialBonus)).toEqual([0, 150, 400, 750, 750]);
  });
});

describe("mock tests", () => {
  it("build for both levels with a timed first question and 3 specials", () => {
    for (const level of ["regional", "state"] as const) {
      for (const seed of SEEDS.slice(0, 10)) {
        const plan = buildTest(level, seed);
        expect(plan.specs[0]!.options.timed).toBe(true);
        expect(plan.specials).toHaveLength(3);
        expect(plan.specials).not.toContain(0);
        for (const spec of plan.specs) expect(() => generate(spec)).not.toThrow();
        // Regional never asks for Porta/Nihilist cryptanalysis.
        if (level === "regional") {
          for (const s of plan.specs) {
            if (s.type === "porta" || s.type === "nihilist") expect(s.options.mode).toBe("decode");
          }
        }
      }
    }
  });
});
