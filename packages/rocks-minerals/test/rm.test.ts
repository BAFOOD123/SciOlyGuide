import { describe, expect, it } from "vitest";
import {
  CONCEPTS,
  MINERALS,
  REFERENCE,
  ROCKS,
  SKILLS,
  SPECIMENS,
  buildPractice,
  buildStationTest,
  correctAnswerText,
  generateQuestion,
  isCorrect,
  skillsFor,
  specimenById,
  type Question,
  type Skill,
} from "../src/index.ts";

const SEEDS = Array.from({ length: 25 }, (_, i) => (i + 7) * 2246822519);

describe("specimen data", () => {
  it("matches the official 92-specimen kit list", () => {
    expect(MINERALS).toHaveLength(52);
    expect(ROCKS).toHaveLength(40);
    expect(SPECIMENS.map((s) => s.n)).toEqual(Array.from({ length: 92 }, (_, i) => i + 1));
    expect(new Set(SPECIMENS.map((s) => s.id)).size).toBe(92);
    expect(ROCKS.filter((r) => r.rockType === "metamorphic").map((r) => r.n)).toEqual([53, 54, 55, 56, 57, 58, 59, 60, 61, 62]);
    expect(ROCKS.filter((r) => r.rockType === "igneous").map((r) => r.n)).toEqual([63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74]);
  });

  it("has sane mineral properties", () => {
    for (const m of MINERALS) {
      expect(m.hardness[0]).toBeGreaterThanOrEqual(1);
      expect(m.hardness[1]).toBeLessThanOrEqual(10);
      expect(m.hardness[0]).toBeLessThanOrEqual(m.hardness[1]);
      expect(m.sg[0]).toBeLessThanOrEqual(m.sg[1]);
      expect(m.colors.length).toBeGreaterThan(0);
    }
    // Mohs anchors on the list.
    expect(specimenById("talc")).toMatchObject({ hardness: [1, 1] });
    expect(specimenById("calcite")).toMatchObject({ hardness: [3, 3] });
    expect(specimenById("fluorite")).toMatchObject({ hardness: [4, 4] });
    expect(specimenById("topaz")).toMatchObject({ hardness: [8, 8] });
    expect(specimenById("corundum")).toMatchObject({ hardness: [9, 9] });
  });

  it("reference tables only name real specimens", () => {
    const ids = [
      ...REFERENCE.igneous.rows.flatMap((r) => r.rocks.filter(Boolean)),
      ...REFERENCE.sedimentary.flatMap((g) => g.rocks),
      ...REFERENCE.metamorphic.flatMap((g) => g.rocks),
    ];
    for (const id of ids) expect(specimenById(id as string), id as string).toBeDefined();
  });
});

function check(q: Question) {
  if (q.kind === "mcq") {
    expect(q.choices!.length).toBeGreaterThanOrEqual(2);
    expect(new Set(q.choices).size).toBe(q.choices!.length);
    expect(q.answer).toBeGreaterThanOrEqual(0);
    expect(isCorrect(q, { choice: q.answer })).toBe(true);
    for (let i = 0; i < q.choices!.length; i++) if (i !== q.answer) expect(isCorrect(q, { choice: i })).toBe(false);
  } else if (q.kind === "order") {
    expect(isCorrect(q, { order: q.order })).toBe(true);
    expect(isCorrect(q, { order: q.order!.slice().reverse() })).toBe(false);
  } else {
    expect(isCorrect(q, { text: q.accepted![0] })).toBe(true);
    expect(isCorrect(q, { text: "not a rock" })).toBe(false);
  }
  expect(correctAnswerText(q).length).toBeGreaterThan(0);
  expect(q.explanation.length).toBeGreaterThan(5);
}

describe("question generators", () => {
  it("every specimen supports at least identification plus one more skill", () => {
    for (const s of SPECIMENS) {
      const skills = skillsFor(s);
      expect(skills, s.id).toContain(s.kind === "mineral" ? "identify-mineral" : "identify-rock");
      expect(skills.length, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("are deterministic and well-formed for every specimen × skill", () => {
    for (const s of SPECIMENS) {
      for (const skill of skillsFor(s)) {
        for (const seed of SEEDS.slice(0, 6)) {
          const spec = { skill, seed, specimenId: s.id };
          const q = generateQuestion(spec);
          expect(JSON.stringify(generateQuestion(spec))).toBe(JSON.stringify(q));
          check(q);
        }
      }
    }
  });

  it("identification clues rule out every distractor", () => {
    for (const s of MINERALS) {
      for (const seed of SEEDS) {
        const q = generateQuestion({ skill: "identify-mineral", seed, specimenId: s.id });
        if (q.skill !== "identify-mineral" || q.kind !== "mcq") continue;
        expect(q.choices![q.answer!]).toBe(s.name);
      }
    }
  });

  it("hardness distractors never overlap the true hardness", () => {
    for (const s of MINERALS) {
      const q = generateQuestion({ skill: "hardness", seed: 3, specimenId: s.id });
      if (q.skill !== "hardness") continue;
      const range = (t: string) => t.split("–").map(Number);
      const [lo, hi] = range(q.choices![q.answer!]!);
      q.choices!.forEach((c, i) => {
        if (i === q.answer) return;
        const [a, b = a] = range(c);
        expect(b! < lo! || a! > (hi ?? lo!)).toBe(true);
      });
    }
  });

  it("typed identification accepts aliases and one typo", () => {
    const q = generateQuestion({ skill: "identify-rock", seed: 1, specimenId: "talc-schist", typed: true });
    expect(q.kind).toBe("text");
    expect(isCorrect(q, { text: "soapstone" })).toBe(true);
    expect(isCorrect(q, { text: "Talc Schist" })).toBe(true);
    const t = generateQuestion({ skill: "identify-rock", seed: 1, specimenId: "conglomerate", typed: true });
    expect(isCorrect(t, { text: "conglomerite" })).toBe(true);
    expect(isCorrect(t, { text: "breccia" })).toBe(false);
  });

  it("concept questions are well-formed", () => {
    for (const c of CONCEPTS) {
      expect(c.wrong).not.toContain(c.a);
      if (c.specimenId) expect(specimenById(c.specimenId), c.specimenId).toBeDefined();
    }
    for (const seed of SEEDS) check(generateQuestion({ skill: "concept", seed }));
  });

  it("every skill in the catalog can be generated", () => {
    for (const { skill } of SKILLS) {
      for (const seed of SEEDS.slice(0, 5)) check(generateQuestion({ skill: skill as Skill, seed }));
    }
  });
});

describe("builders", () => {
  it("practice sets respect focus and count, without duplicates", () => {
    for (const focus of ["all", "minerals", "rocks", "igneous", "sedimentary", "metamorphic"] as const) {
      for (const seed of SEEDS.slice(0, 5)) {
        const specs = buildPractice(seed, { focus, count: 10 });
        expect(specs).toHaveLength(10);
        const keys = specs.filter((s) => s.specimenId).map((s) => `${s.skill}:${s.specimenId}`);
        expect(new Set(keys).size).toBe(keys.length);
        for (const s of specs) {
          if (!s.specimenId) continue;
          const sp = specimenById(s.specimenId)!;
          if (focus === "minerals") expect(sp.kind).toBe("mineral");
          if (focus === "igneous") expect(sp.kind === "rock" && sp.rockType).toBe("igneous");
        }
        specs.forEach((s) => check(generateQuestion(s)));
      }
    }
  });

  it("station tests have one specimen per station and an ID question first", () => {
    for (const seed of SEEDS.slice(0, 8)) {
      const t = buildStationTest(seed, 20);
      expect(t.stations).toHaveLength(20);
      expect(new Set(t.stations.map((s) => s.specimenId)).size).toBe(20);
      for (const st of t.stations) {
        expect(st.questions[0]!.skill).toMatch(/^identify-/);
        expect(st.questions.length).toBeGreaterThanOrEqual(2);
        st.questions.forEach((q) => {
          expect(q.specimenId).toBe(st.specimenId);
          check(generateQuestion(q));
        });
      }
    }
  });
});
