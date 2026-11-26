import { describe, expect, it } from "vitest";
import {
  aminoAcid,
  bendAngle,
  caDistance,
  checkpoints,
  CM_PER_ANGSTROM,
  FIRST,
  interactions,
  LAST,
  modelExtentCm,
  nearbyResidues,
  receptorContacts,
  RESIDUES,
  segments,
  tooberCm,
  TOOBER_LENGTH_CM,
} from "../src/lib/protein/analysis";
import {
  defaultDesign,
  designSchema,
  interactionFeature,
  parseDesign,
  receptorFeature,
  ruleChecks,
  shownSideChains,
  sideChainFeature,
  sideChainStatus,
  suggestions,
  withoutSideChain,
} from "../src/lib/protein/design";

describe("structure data", () => {
  it("has all 100 residues of chain A 153–252 in order", () => {
    expect(RESIDUES).toHaveLength(100);
    expect(RESIDUES[0]!.n).toBe(153);
    expect(RESIDUES.at(-1)!.n).toBe(252);
    RESIDUES.forEach((r, i) => expect(r.n).toBe(FIRST + i));
  });
  it("has consecutive alpha carbons about 3.8 Å apart (no chain breaks)", () => {
    for (let n = FIRST; n < LAST; n++) {
      const d = caDistance(n, n + 1).angstrom;
      expect(d).toBeGreaterThan(3.6);
      expect(d).toBeLessThan(4.0);
    }
  });
  it("knows the event's sequence landmarks", () => {
    expect(aminoAcid(RESIDUES[0]!.aa).one).toBe("W"); // Trp153
    expect(RESIDUES.find((r) => r.n === 183)!.aa).toBe("HIS");
    expect(RESIDUES.find((r) => r.n === 226)!.aa).toBe("GLN");
  });
});

describe("scale", () => {
  it("puts each mark at the center of its 2 cm", () => {
    expect(tooberCm(FIRST)).toBe(1);
    expect(tooberCm(FIRST + 1)).toBe(3);
    expect(tooberCm(LAST)).toBe(199);
    expect(TOOBER_LENGTH_CM).toBe(200);
  });
  it("converts Å to model cm at 2 cm per 3.8 Å", () => {
    expect(CM_PER_ANGSTROM).toBeCloseTo(2 / 3.8, 6);
  });
  it("fits in the 50 cm cube", () => {
    expect(modelExtentCm().maxSpan).toBeLessThan(50);
  });
});

describe("segments", () => {
  const segs = segments();
  it("cover every residue exactly once, in order", () => {
    expect(segs[0]!.start).toBe(FIRST);
    expect(segs.at(-1)!.end).toBe(LAST);
    for (let i = 1; i < segs.length; i++) expect(segs[i]!.start).toBe(segs[i - 1]!.end + 1);
    expect(segs.reduce((a, s) => a + s.length, 0)).toBe(100);
  });
  it("include the 190-helix and alternate structure types", () => {
    expect(segs.some((s) => s.ss === "H" && s.start === 187 && s.end === 196)).toBe(true);
    for (let i = 1; i < segs.length; i++) expect(segs[i]!.ss).not.toBe(segs[i - 1]!.ss);
  });
  it("tile the 200 cm of tubing", () => {
    expect(segs[0]!.fromCm).toBe(0);
    expect(segs.at(-1)!.toCm).toBe(200);
  });
});

describe("bend angles", () => {
  it("are about 90° inside the helix and wider in strands", () => {
    for (let n = 188; n <= 193; n++) { // the helix core; 194–195 fray open at its C-terminal end
      const a = bendAngle(n)!;
      expect(a).toBeGreaterThan(80);
      expect(a).toBeLessThan(100);
    }
    for (const n of [176, 178, 180]) expect(bendAngle(n)!).toBeGreaterThan(105);
  });
  it("are undefined at the chain ends", () => {
    expect(bendAngle(FIRST)).toBeNull();
    expect(bendAngle(LAST)).toBeNull();
  });
});

describe("fold checkpoints and neighbors", () => {
  it("pair residues at least 5 apart that sit close together", () => {
    const cps = checkpoints();
    expect(cps.length).toBeGreaterThan(15);
    for (const c of cps) {
      expect(c.b - c.a).toBeGreaterThanOrEqual(5);
      expect(c.angstrom).toBeLessThanOrEqual(6.5);
      expect(c.cm).toBeCloseTo(caDistance(c.a, c.b).cm, 6);
    }
    expect(new Set(cps.map((c) => c.key)).size).toBe(cps.length);
  });
  it("include the termini, which pair in the same sheet", () => {
    expect(checkpoints().some((c) => c.a === 153 && c.b === 252)).toBe(true);
  });
  it("list nearby residues closest first", () => {
    const near = nearbyResidues(183);
    expect(near.length).toBeGreaterThan(0);
    for (let i = 1; i < near.length; i++) expect(near[i]!.angstrom).toBeGreaterThanOrEqual(near[i - 1]!.angstrom);
    near.forEach((x) => expect(Math.abs(x.n - 183)).toBeGreaterThanOrEqual(4));
  });
});

describe("interactions and receptor", () => {
  it("find the receptor-binding residues", () => {
    const rbs = receptorContacts().filter((c) => c.sideChain).map((c) => c.n);
    for (const n of [153, 183, 194, 222, 225, 226]) expect(rbs).toContain(n);
  });
  it("only call salt bridges between acidic and basic residues", () => {
    for (const it of interactions().filter((x) => x.type === "salt-bridge")) {
      const props = [it.a, it.b].map((n) => aminoAcid(RESIDUES[n - FIRST]!.aa).property).sort();
      expect(props).toEqual(["acidic", "basic"]);
      expect(it.distance).toBeLessThanOrEqual(4.0);
    }
  });
  it("list each residue pair once per type, lower number first", () => {
    const keys = interactions().map((i) => `${i.type}:${i.a}-${i.b}`);
    expect(new Set(keys).size).toBe(keys.length);
    interactions().forEach((i) => expect(i.a).toBeLessThan(i.b));
  });
});

describe("design", () => {
  it("round-trips through the schema", () => {
    const d = defaultDesign();
    d.features.push(sideChainFeature(183), receptorFeature());
    expect(designSchema.parse(JSON.parse(JSON.stringify(d)))).toEqual(d);
  });
  it("falls back to a fresh design for bad input", () => {
    expect(parseDesign({ v: 2 })).toEqual(defaultDesign());
    expect(parseDesign("nonsense")).toEqual(defaultDesign());
  });
  it("colors side chains by the event's rule", () => {
    expect(sideChainFeature(225).how.toLowerCase()).toContain("red"); // Asp
    expect(sideChainFeature(183).how.toLowerCase()).toContain("blue"); // His
    expect(sideChainFeature(205).how.toLowerCase()).toContain("green"); // Cys
  });
  it("stops suggesting what is already on the model", () => {
    const d = defaultDesign();
    const before = suggestions(d);
    const first = before[0]!;
    d.features.push(first.build());
    expect(suggestions(d).some((s) => s.key === first.key)).toBe(false);
  });
  it("flags legend rows without a why and a non-gray backbone", () => {
    const d = defaultDesign();
    d.features.push({ ...sideChainFeature(160), why: "" });
    d.backbone.color = "#ff0000";
    const checks = Object.fromEntries(ruleChecks(d, 20).map((c) => [c.key, c.ok]));
    expect(checks.legend).toBe(false);
    expect(checks.gray).toBe(false);
    expect(checks.size).toBe(true);
  });
  it("loads designs saved before atoms were per-residue", () => {
    const old = JSON.parse(JSON.stringify(defaultDesign()));
    delete old.atoms;
    expect(parseDesign(old).atoms).toEqual([]);
  });
  it("removes a side chain together with the bonds that need it and its atoms", () => {
    const d = defaultDesign();
    const bridge = interactions().find((i) => i.type === "salt-bridge" && i.a === 222 && i.b === 225)!;
    d.features.push(sideChainFeature(225), interactionFeature(bridge), sideChainFeature(183));
    d.atoms = [183, 225];
    expect(sideChainStatus(d, 225).bonds).toHaveLength(1);
    const { design: next, bonds } = withoutSideChain(d, 225);
    expect(bonds).toBe(1);
    expect(shownSideChains(next).has(225)).toBe(false);
    expect(shownSideChains(next).has(222)).toBe(false); // its partner was only there for the bond
    expect(shownSideChains(next).has(183)).toBe(true);
    expect(next.atoms).toEqual([183]);
  });
});
