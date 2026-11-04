import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  SPECIMENS,
  guessMatches,
  lookAlikeChoices,
  photoHints,
  photoPool,
  photosFor,
  specimenById,
  specimenForPhoto,
  specimenFromGuess,
  wikiFor,
} from "../src/index.ts";

const PUBLIC = new URL("../../../apps/web/public/specimens/", import.meta.url);

describe("specimen photos", () => {
  it("every specimen has at least one photo, with an existing file and a free license", () => {
    const keys = new Set<string>();
    for (const s of SPECIMENS) {
      const photos = photosFor(s.id);
      expect(photos.length, s.id).toBeGreaterThan(0);
      for (const p of photos) {
        expect(keys.has(p.key)).toBe(false);
        keys.add(p.key);
        expect(p.key).toMatch(/^[0-9a-f]{12}$/);
        expect(existsSync(new URL(`${p.key}.jpg`, PUBLIC)), p.key).toBe(true);
        expect(p.license).toMatch(/^(CC BY|CC BY-SA|CC0|Public domain)/i);
        expect(p.source).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
        expect(p.author.length).toBeGreaterThan(1);
        expect(specimenForPhoto(p.key)?.id).toBe(s.id);
      }
    }
  });

  it("photo keys never contain the specimen name", () => {
    for (const s of SPECIMENS) for (const p of photosFor(s.id)) expect(p.key).not.toContain(s.id.slice(0, 4));
  });

  it("every specimen has a Wikipedia summary", () => {
    for (const s of SPECIMENS) {
      const w = wikiFor(s.id);
      expect(w, s.id).toBeDefined();
      expect(w!.extract.length).toBeGreaterThan(40);
      expect(w!.url).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\//);
      expect(w!.extract).not.toMatch(/\/[a-zəɪʊæ]+\//); // no leftover IPA
    }
  });

  it("decks contain only matching specimens", () => {
    expect(photoPool("all").length).toBe(SPECIMENS.reduce((n, s) => n + photosFor(s.id).length, 0));
    for (const { specimenId } of photoPool("igneous")) {
      const s = specimenById(specimenId)!;
      expect(s.kind === "rock" && s.rockType).toBe("igneous");
    }
  });
});

describe("photo identification logic", () => {
  it("accepts names, aliases and one typo; rejects other specimens", () => {
    const lab = specimenById("labradorite")!;
    expect(guessMatches(lab, "Labradorite")).toBe(true);
    expect(guessMatches(lab, "labradorit")).toBe(true);
    expect(guessMatches(lab, "albite")).toBe(false);
    expect(guessMatches(specimenById("talc-schist")!, "soapstone")).toBe(true);
    expect(guessMatches(specimenById("tiger-eye")!, "tiger's eye")).toBe(true);
    expect(specimenFromGuess("albite")?.id).toBe("albite");
    expect(specimenFromGuess("unobtanium")).toBeUndefined();
  });

  it("gives three increasingly specific hints that don't name the specimen outright", () => {
    for (const s of SPECIMENS) {
      const h = photoHints(s);
      expect(h).toHaveLength(3);
      const bare = s.name.replace(/\s*\(.*\)/, "");
      expect(h[0].toLowerCase()).not.toContain(bare.toLowerCase());
      expect(h[1].toLowerCase()).not.toContain(bare.toLowerCase());
      expect(h[2]).toContain(`“${bare[0]}”`);
    }
  });

  it("look-alike choices include the answer once, share its type, and avoid identical quartz varieties", () => {
    for (const s of SPECIMENS) {
      for (const seed of [1, 2, 3]) {
        const c = lookAlikeChoices(s, seed);
        expect(c).toHaveLength(4);
        expect(new Set(c).size).toBe(4);
        expect(c.filter((x) => x === s.name)).toHaveLength(1);
        for (const name of c) {
          const o = SPECIMENS.find((x) => x.name === name)!;
          expect(o.kind).toBe(s.kind);
          if (s.kind === "rock" && o.kind === "rock") expect(o.rockType).toBe(s.rockType);
          if (o.id !== s.id && s.kind === "mineral" && s.varietyOf?.startsWith("Quartz")) {
            expect(o.kind === "mineral" && o.varietyOf?.startsWith("Quartz")).toBeFalsy();
          }
        }
      }
    }
  });
});
