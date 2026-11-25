/**
 * A student's digital model design: the backbone choices, the features they add
 * (side chains, interactions, the receptor, anything custom) with the legend's
 * What / How / Why for each, and build progress. Saved as JSON to the account.
 */
import { z } from "zod";
import {
  aminoAcid,
  FIRST,
  INTERACTION_INFO,
  interactions,
  LAST,
  PROPERTY_INFO,
  receptorContacts,
  residue,
  resLabel3,
  SUGAR_NAMES,
  type Interaction,
  type InteractionType,
} from "./analysis";

export const FEATURE_KINDS = ["sidechain", "interaction", "receptor", "backbone", "custom"] as const;
export type FeatureKind = (typeof FEATURE_KINDS)[number];

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const text = (max: number) => z.string().max(max);

export const featureSchema = z.object({
  id: z.string().min(1).max(40),
  kind: z.enum(FEATURE_KINDS),
  residues: z.array(z.number().int().min(FIRST).max(LAST)).max(40),
  interaction: z.enum(["salt-bridge", "h-bond", "hydrophobic", "disulfide"]).optional(),
  color: hex,
  what: text(300),
  how: text(300),
  why: text(600),
  inLegend: z.boolean(),
});
export type Feature = z.infer<typeof featureSchema>;

export const designSchema = z.object({
  v: z.literal(1),
  title: text(80),
  backbone: z.object({
    material: text(60),
    diameterCm: z.number().min(0.1).max(5),
    color: hex,
    /** Accent the helix and strands in another color (the rest stays gray). */
    accentSS: z.boolean(),
  }),
  features: z.array(featureSchema).max(80),
  /** Build steps checked off (segment index or checklist key → done). */
  progress: z.record(z.string().max(40), z.boolean()),
  notes: text(4000),
});
export type ModelDesign = z.infer<typeof designSchema>;

export function newFeatureId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function defaultDesign(): ModelDesign {
  return {
    v: 1,
    title: "3UBE receptor-binding site model",
    backbone: { material: "Mini-Toober", diameterCm: 1, color: "#9ca3af", accentSS: false },
    features: [
      {
        id: "backbone",
        kind: "backbone",
        residues: [],
        color: "#9ca3af",
        what: `Alpha-carbon backbone, residues ${FIRST}–${LAST} of chain A (PDB 3UBE)`,
        how: "Gray Mini-Toober, 1 cm diameter, 2 cm per amino acid (200 cm)",
        why: "Shows the fold of the hemagglutinin HA1 head that forms the sialic acid receptor-binding site",
        inLegend: true,
      },
    ],
    progress: {},
    notes: "",
  };
}

/** Parse saved JSON; anything invalid falls back to a fresh design. */
export function parseDesign(raw: unknown): ModelDesign {
  const parsed = designSchema.safeParse(raw);
  return parsed.success ? parsed.data : defaultDesign();
}

// ---------- feature builders ----------

export function sideChainFeature(n: number): Feature {
  const r = residue(n);
  const aa = aminoAcid(r?.aa ?? "");
  const prop = PROPERTY_INFO[aa.property];
  const contact = receptorContacts().find((c) => c.n === n);
  let why = "";
  if (contact) {
    const sugars = contact.sugars.map((s) => SUGAR_NAMES[s] ?? s).join(" and ");
    why = contact.hbond
      ? `Hydrogen bonds to the receptor's ${sugars} in the binding site`
      : `Lines the binding pocket and contacts the receptor's ${sugars}`;
  }
  return {
    id: newFeatureId(),
    kind: "sidechain",
    residues: [n],
    color: prop.hex,
    what: `${aa.name} ${n} side chain (${resLabel3(n)})`,
    how: `${prop.colorName[0]!.toUpperCase()}${prop.colorName.slice(1)} (${aa.property}) marker on the alpha carbon`,
    why,
    inLegend: true,
  };
}

const WHY_BY_TYPE: Record<InteractionType, string> = {
  "salt-bridge": "An ionic bond between opposite charges that holds these parts of the chain together and stabilizes the fold",
  "h-bond": "A side-chain hydrogen bond that stabilizes the tertiary structure",
  hydrophobic: "Nonpolar side chains packed together, away from water (the hydrophobic effect drives folding)",
  disulfide: "A covalent S–S cross-link that locks the fold in place",
};

export function interactionFeature(it: Interaction): Feature {
  const info = INTERACTION_INFO[it.type];
  return {
    id: newFeatureId(),
    kind: "interaction",
    residues: [it.a, it.b],
    interaction: it.type,
    color: info.hex,
    what: `${info.label}: ${resLabel3(it.a)} – ${resLabel3(it.b)}`,
    how: `Both side chains shown in their property colors, joined by a ${info.label.toLowerCase()} connector`,
    why: WHY_BY_TYPE[it.type],
    inLegend: true,
  };
}

export function receptorFeature(): Feature {
  return {
    id: newFeatureId(),
    kind: "receptor",
    residues: receptorContacts().filter((c) => c.sideChain).map((c) => c.n),
    color: "#d946ef",
    what: "Sialic acid receptor analog (LSTc, a human-type α2,6-linked glycan)",
    how: "Magenta molecule placed in the binding pocket",
    why: "Shows where hemagglutinin grips the host cell's sialic acid, the first step of infection",
    inLegend: true,
  };
}

export function customFeature(residues: number[] = []): Feature {
  return { id: newFeatureId(), kind: "custom", residues, color: "#f97316", what: "", how: "", why: "", inLegend: true };
}

// ---------- suggestions ----------

export interface Suggestion {
  key: string;
  title: string;
  detail: string;
  level: "Regional" | "State" | "National";
  build: () => Feature;
}

/** Ideas the student can add with one click, ordered by how useful they are for scoring. */
export function suggestions(design: ModelDesign): Suggestion[] {
  const out: Suggestion[] = [];
  const hasReceptor = design.features.some((f) => f.kind === "receptor");
  const shown = new Set(design.features.filter((f) => f.kind === "sidechain").flatMap((f) => f.residues));
  const shownPairs = new Set(
    design.features.filter((f) => f.kind === "interaction").map((f) => `${f.interaction}:${[...f.residues].sort((a, b) => a - b).join("-")}`),
  );
  if (!hasReceptor) {
    out.push({
      key: "receptor",
      title: "Add the sialic acid receptor",
      detail: "The LSTc glycan bound in the pocket in 3UBE.",
      level: "State",
      build: receptorFeature,
    });
  }
  for (const c of receptorContacts()) {
    if (!c.sideChain || shown.has(c.n)) continue;
    out.push({
      key: `rc-${c.n}`,
      title: `${resLabel3(c.n)} side chain`,
      detail: `${c.hbond ? "H-bonds" : "Contacts"} the receptor (${c.distance.toFixed(1)} Å)`,
      level: "State",
      build: () => sideChainFeature(c.n),
    });
  }
  const ranked = interactions()
    .filter((it) => it.type !== "hydrophobic" || it.contacts >= 4)
    .filter((it) => !shownPairs.has(`${it.type}:${it.a}-${it.b}`))
    .sort((x, y) => rankType(x.type) - rankType(y.type) || y.contacts - x.contacts);
  for (const it of ranked.slice(0, 14)) {
    out.push({
      key: `it-${it.type}-${it.a}-${it.b}`,
      title: `${INTERACTION_INFO[it.type].label}: ${resLabel3(it.a)}–${resLabel3(it.b)}`,
      detail: `${it.atomA}…${it.atomB} ${it.distance.toFixed(1)} Å${it.type === "hydrophobic" ? ` · ${it.contacts} contacts` : ""}`,
      level: "National",
      build: () => interactionFeature(it),
    });
  }
  return out;
}

function rankType(t: InteractionType): number {
  return { disulfide: 0, "salt-bridge": 1, hydrophobic: 2, "h-bond": 3 }[t];
}

// ---------- side chains shown on the model ----------

/** Every residue whose side chain the model shows (side-chain and interaction features). */
export function shownSideChains(design: ModelDesign): Set<number> {
  const s = new Set<number>();
  for (const f of design.features) if (f.kind === "sidechain" || f.kind === "interaction") f.residues.forEach((n) => s.add(n));
  return s;
}

// ---------- checks against the rules ----------

export interface Check {
  key: string;
  ok: boolean;
  label: string;
  detail?: string;
}

export function ruleChecks(design: ModelDesign, extentMaxCm: number): Check[] {
  const legend = design.features.filter((f) => f.inLegend);
  const missingWhy = legend.filter((f) => !f.why.trim());
  const g = design.backbone.color;
  const [r, gg, b] = [1, 3, 5].map((i) => Number.parseInt(g.slice(i, i + 2), 16));
  const grayish = Math.max(r!, gg!, b!) - Math.min(r!, gg!, b!) < 40;
  const extra = design.features.filter((f) => f.kind !== "backbone");
  return [
    { key: "scale", ok: true, label: "Scale 2 cm per amino acid", detail: "100 residues → 200 cm of backbone material" },
    {
      key: "diameter",
      ok: design.backbone.diameterCm >= 0.75 && design.backbone.diameterCm <= 1.25,
      label: "Backbone diameter 0.75–1.25 cm",
      detail: `${design.backbone.diameterCm} cm`,
    },
    { key: "gray", ok: grayish, label: "Backbone mostly gray", detail: grayish ? "Gray" : "Pick a gray backbone color" },
    { key: "size", ok: extentMaxCm <= 50, label: "Fits in a 50 × 50 × 50 cm cube", detail: `Longest backbone span ≈ ${extentMaxCm.toFixed(1)} cm` },
    {
      key: "features",
      ok: extra.length > 0,
      label: "Functionally relevant features added",
      detail: extra.length ? `${extra.length} feature${extra.length === 1 ? "" : "s"}` : "Add side chains, the receptor or interactions",
    },
    {
      key: "legend",
      ok: legend.length > 0 && missingWhy.length === 0,
      label: "Every legend row says why",
      detail: missingWhy.length ? `${missingWhy.length} row${missingWhy.length === 1 ? " is" : "s are"} missing a “why”` : `${legend.length} rows`,
    },
  ];
}
