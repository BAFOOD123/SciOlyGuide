/**
 * Pure helpers for the Protein Modeling studio: amino-acid properties and the
 * event's color code, model scale, secondary-structure segments, and the
 * side-chain interactions / receptor contacts found in the structure.
 */
import { STRUCTURE } from "./structure.generated";
import type { ResidueData, SS } from "./types";

// ---------- amino acids ----------

export type Property = "hydrophobic" | "hydrophilic" | "acidic" | "basic" | "cysteine";

export interface AminoAcid {
  three: string;
  one: string;
  name: string;
  property: Property;
}

const AA_LIST: AminoAcid[] = [
  { three: "GLY", one: "G", name: "Glycine", property: "hydrophobic" },
  { three: "ALA", one: "A", name: "Alanine", property: "hydrophobic" },
  { three: "VAL", one: "V", name: "Valine", property: "hydrophobic" },
  { three: "LEU", one: "L", name: "Leucine", property: "hydrophobic" },
  { three: "ILE", one: "I", name: "Isoleucine", property: "hydrophobic" },
  { three: "PRO", one: "P", name: "Proline", property: "hydrophobic" },
  { three: "PHE", one: "F", name: "Phenylalanine", property: "hydrophobic" },
  { three: "MET", one: "M", name: "Methionine", property: "hydrophobic" },
  { three: "TRP", one: "W", name: "Tryptophan", property: "hydrophobic" },
  { three: "SER", one: "S", name: "Serine", property: "hydrophilic" },
  { three: "THR", one: "T", name: "Threonine", property: "hydrophilic" },
  { three: "TYR", one: "Y", name: "Tyrosine", property: "hydrophilic" },
  { three: "ASN", one: "N", name: "Asparagine", property: "hydrophilic" },
  { three: "GLN", one: "Q", name: "Glutamine", property: "hydrophilic" },
  { three: "ASP", one: "D", name: "Aspartate", property: "acidic" },
  { three: "GLU", one: "E", name: "Glutamate", property: "acidic" },
  { three: "LYS", one: "K", name: "Lysine", property: "basic" },
  { three: "ARG", one: "R", name: "Arginine", property: "basic" },
  { three: "HIS", one: "H", name: "Histidine", property: "basic" },
  { three: "CYS", one: "C", name: "Cysteine", property: "cysteine" },
];
const AA = new Map(AA_LIST.map((a) => [a.three, a]));

export function aminoAcid(three: string): AminoAcid {
  return AA.get(three) ?? { three, one: "X", name: three, property: "hydrophilic" };
}

/** The event's side-chain color code (marked on the alpha carbon). */
export const PROPERTY_INFO: Record<Property, { label: string; colorName: string; hex: string }> = {
  hydrophobic: { label: "Hydrophobic", colorName: "yellow", hex: "#facc15" },
  hydrophilic: { label: "Hydrophilic", colorName: "white", hex: "#f4f4f5" },
  acidic: { label: "Acidic (−)", colorName: "red", hex: "#ef4444" },
  basic: { label: "Basic (+)", colorName: "blue", hex: "#3b82f6" },
  cysteine: { label: "Cysteine", colorName: "green", hex: "#22c55e" },
};

export const SS_INFO: Record<SS, { label: string; hex: string }> = {
  H: { label: "α-helix", hex: "#e11d48" },
  E: { label: "β-strand", hex: "#eab308" },
  L: { label: "Loop / turn", hex: "#9ca3af" },
};

// ---------- scale ----------

/** Event scale: 2 cm of backbone per amino acid. */
export const CM_PER_RESIDUE = 2;
/** Typical alpha-carbon to alpha-carbon distance. */
export const CA_CA_ANGSTROM = 3.8;
/** Model centimetres per ångström at the event scale (≈ 0.53). */
export const CM_PER_ANGSTROM = CM_PER_RESIDUE / CA_CA_ANGSTROM;
export const MAX_MODEL_CM = 50;

export const RESIDUES: ResidueData[] = STRUCTURE.residues;
export const FIRST = STRUCTURE.first;
export const LAST = STRUCTURE.last;
const byNum = new Map(RESIDUES.map((r) => [r.n, r]));

export function residue(n: number): ResidueData | undefined {
  return byNum.get(n);
}

export type Vec3 = [number, number, number];

export function atomPos(r: ResidueData, name: string): Vec3 | undefined {
  const a = r.atoms.find((x) => x[0] === name);
  return a ? [a[2], a[3], a[4]] : undefined;
}

export function caPos(n: number): Vec3 {
  const r = byNum.get(n);
  const p = r && atomPos(r, "CA");
  if (!p) throw new Error(`no CA for residue ${n}`);
  return p;
}

export function dist(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** Alpha-carbon distance between two residues: Å and model cm. */
export function caDistance(a: number, b: number): { angstrom: number; cm: number } {
  const d = dist(caPos(a), caPos(b));
  return { angstrom: d, cm: d * CM_PER_ANGSTROM };
}

/** Where residue n's mark sits along the backbone material, from the N-terminal end (cm). */
export function tooberCm(n: number): number {
  return (n - FIRST) * CM_PER_RESIDUE + CM_PER_RESIDUE / 2;
}
export const TOOBER_LENGTH_CM = (LAST - FIRST + 1) * CM_PER_RESIDUE;

/** Short label like "W153". */
export function resLabel(n: number): string {
  const r = byNum.get(n);
  return r ? `${aminoAcid(r.aa).one}${n}` : String(n);
}
/** Label like "Trp153". */
export function resLabel3(n: number): string {
  const r = byNum.get(n);
  if (!r) return String(n);
  return `${r.aa[0]}${r.aa.slice(1).toLowerCase()}${n}`;
}

// ---------- secondary-structure segments ----------

export interface Segment {
  index: number;
  ss: SS;
  start: number;
  end: number;
  length: number;
  /** Backbone length of this segment at the event scale. */
  cm: number;
  /** Position along the backbone material (cm from the N-terminal end). */
  fromCm: number;
  toCm: number;
  /** Strand partners in the same sheet, if any. */
  partners: { start: number; end: number; parallel: boolean }[];
}

let cachedSegments: Segment[] | null = null;
export function segments(): Segment[] {
  return (cachedSegments ??= buildSegments());
}

function buildSegments(): Segment[] {
  const out: Segment[] = [];
  let start = FIRST;
  for (let n = FIRST + 1; n <= LAST + 1; n++) {
    const prev = byNum.get(n - 1)!.ss;
    const cur = n <= LAST ? byNum.get(n)!.ss : null;
    if (cur !== prev) {
      const end = n - 1;
      const length = end - start + 1;
      const partners =
        prev === "E"
          ? STRUCTURE.sheetPairs.flatMap((p) => {
              const hit = (s: number[]) => s[0]! <= end && s[1]! >= start;
              if (hit(p.a)) return [{ start: p.b[0]!, end: p.b[1]!, parallel: p.parallel }];
              if (hit(p.b)) return [{ start: p.a[0]!, end: p.a[1]!, parallel: p.parallel }];
              return [];
            })
          : [];
      out.push({
        index: out.length,
        ss: prev,
        start,
        end,
        length,
        cm: length * CM_PER_RESIDUE,
        fromCm: (start - FIRST) * CM_PER_RESIDUE,
        toCm: (end - FIRST + 1) * CM_PER_RESIDUE,
        partners,
      });
      start = n;
    }
  }
  return out;
}

// ---------- interactions ----------

export type InteractionType = "salt-bridge" | "h-bond" | "hydrophobic" | "disulfide";

export const INTERACTION_INFO: Record<InteractionType, { label: string; hex: string; blurb: string }> = {
  "salt-bridge": { label: "Salt bridge", hex: "#a855f7", blurb: "An ionic bond between an acidic (−) and a basic (+) side chain." },
  "h-bond": { label: "Hydrogen bond", hex: "#06b6d4", blurb: "A side-chain N or O sharing a hydrogen with another N or O (≤ 3.5 Å)." },
  hydrophobic: { label: "Hydrophobic packing", hex: "#f59e0b", blurb: "Nonpolar side chains packed together, away from water." },
  disulfide: { label: "Disulfide bond", hex: "#22c55e", blurb: "A covalent S–S bond between two cysteines." },
};

export interface Interaction {
  type: InteractionType;
  a: number;
  b: number;
  atomA: string;
  atomB: string;
  /** Shortest qualifying atom–atom distance (Å). */
  distance: number;
  /** Number of qualifying atom pairs (for hydrophobic packing, a strength hint). */
  contacts: number;
}

const BACKBONE = new Set(["N", "CA", "C", "O", "OXT"]);
const ACID_O: Record<string, string[]> = { ASP: ["OD1", "OD2"], GLU: ["OE1", "OE2"] };
const BASE_N: Record<string, string[]> = { LYS: ["NZ"], ARG: ["NE", "NH1", "NH2"], HIS: ["ND1", "NE2"] };
const NONPOLAR = new Set(["ALA", "VAL", "LEU", "ILE", "PRO", "PHE", "MET", "TRP", "TYR"]);

function findInteractions(): Interaction[] {
  const best = new Map<string, Interaction>();
  const add = (it: Omit<Interaction, "contacts">) => {
    const key = `${it.type}:${it.a}:${it.b}`;
    const cur = best.get(key);
    if (!cur) best.set(key, { ...it, contacts: 1 });
    else {
      cur.contacts++;
      if (it.distance < cur.distance) Object.assign(cur, { distance: it.distance, atomA: it.atomA, atomB: it.atomB });
    }
  };
  for (let i = 0; i < RESIDUES.length; i++) {
    const ri = RESIDUES[i]!;
    for (let j = i + 1; j < RESIDUES.length; j++) {
      const rj = RESIDUES[j]!;
      const seqGap = rj.n - ri.n;
      for (const ai of ri.atoms) {
        for (const aj of rj.atoms) {
          const scI = !BACKBONE.has(ai[0]);
          const scJ = !BACKBONE.has(aj[0]);
          if (!scI && !scJ) continue; // backbone–backbone H-bonds are the secondary structure itself
          const d = Math.hypot(ai[2] - aj[2], ai[3] - aj[3], ai[4] - aj[4]);
          if (d > 4.5) continue;
          const base = { a: ri.n, b: rj.n, atomA: ai[0], atomB: aj[0], distance: d };
          if (ai[1] === "S" && aj[1] === "S" && d <= 2.5 && ri.aa === "CYS" && rj.aa === "CYS") {
            add({ type: "disulfide", ...base });
            continue;
          }
          const acidBase =
            (ACID_O[ri.aa]?.includes(ai[0]) && BASE_N[rj.aa]?.includes(aj[0])) ||
            (BASE_N[ri.aa]?.includes(ai[0]) && ACID_O[rj.aa]?.includes(aj[0]));
          if (acidBase && d <= 4.0) {
            add({ type: "salt-bridge", ...base });
            continue;
          }
          const polar = (ai[1] === "N" || ai[1] === "O") && (aj[1] === "N" || aj[1] === "O");
          if (polar && d <= 3.5 && seqGap > 1) {
            add({ type: "h-bond", ...base });
            continue;
          }
          if (
            scI && scJ && seqGap >= 3 && d <= 4.2 && ai[1] === "C" && aj[1] === "C" &&
            ai[0] !== "CB" && aj[0] !== "CB" && NONPOLAR.has(ri.aa) && NONPOLAR.has(rj.aa)
          ) {
            add({ type: "hydrophobic", ...base });
          }
        }
      }
    }
  }
  // A salt bridge already explains an H-bond between the same pair.
  const list = [...best.values()].filter(
    (it) => !(it.type === "h-bond" && best.has(`salt-bridge:${it.a}:${it.b}`)),
  );
  const order: InteractionType[] = ["disulfide", "salt-bridge", "h-bond", "hydrophobic"];
  return list.sort((x, y) => order.indexOf(x.type) - order.indexOf(y.type) || x.a - y.a || x.b - y.b);
}

let cachedInteractions: Interaction[] | null = null;
export function interactions(): Interaction[] {
  return (cachedInteractions ??= findInteractions());
}

// ---------- receptor (LSTc / sialic acid) contacts ----------

export const SUGAR_NAMES: Record<string, string> = {
  SIA: "sialic acid",
  GAL: "galactose",
  NAG: "N-acetylglucosamine",
};

export interface ReceptorContact {
  n: number;
  /** Closest atom–atom distance to the receptor (Å). */
  distance: number;
  /** Polar contact (N/O within 3.5 Å) — a likely hydrogen bond. */
  hbond: boolean;
  /** Sugars touched, e.g. ["SIA", "GAL"]. */
  sugars: string[];
  /** Whether the side chain (not just the backbone) makes the contact. */
  sideChain: boolean;
}

function findReceptorContacts(cutoff = 4.0): ReceptorContact[] {
  const lig = STRUCTURE.ligand.atoms;
  const out: ReceptorContact[] = [];
  for (const r of RESIDUES) {
    let min = Infinity;
    let hbond = false;
    let sideChain = false;
    const sugars = new Set<string>();
    for (const a of r.atoms) {
      for (const l of lig) {
        const d = Math.hypot(a[2] - l[2], a[3] - l[3], a[4] - l[4]);
        if (d > cutoff) continue;
        min = Math.min(min, d);
        sugars.add(l[5]);
        if (!BACKBONE.has(a[0])) sideChain = true;
        if ((a[1] === "N" || a[1] === "O") && (l[1] === "N" || l[1] === "O") && d <= 3.5) hbond = true;
      }
    }
    if (min <= cutoff) out.push({ n: r.n, distance: min, hbond, sugars: [...sugars].sort(), sideChain });
  }
  return out;
}

let cachedContacts: ReceptorContact[] | null = null;
export function receptorContacts(): ReceptorContact[] {
  return (cachedContacts ??= findReceptorContacts());
}

// ---------- model size ----------

/** Extent of the folded backbone along each axis, in model cm. */
export function modelExtentCm(): { x: number; y: number; z: number; maxSpan: number } {
  const ca = RESIDUES.map((r) => atomPos(r, "CA")!);
  const ext = [0, 1, 2].map((k) => {
    const v = ca.map((p) => p[k]!);
    return (Math.max(...v) - Math.min(...v)) * CM_PER_ANGSTROM;
  });
  let span = 0;
  for (let i = 0; i < ca.length; i++) for (let j = i + 1; j < ca.length; j++) span = Math.max(span, dist(ca[i]!, ca[j]!));
  return { x: ext[0]!, y: ext[1]!, z: ext[2]!, maxSpan: span * CM_PER_ANGSTROM };
}

/** Composition of the fragment by property. */
export function composition(): Record<Property, number[]> {
  const out: Record<Property, number[]> = { hydrophobic: [], hydrophilic: [], acidic: [], basic: [], cysteine: [] };
  for (const r of RESIDUES) out[aminoAcid(r.aa).property].push(r.n);
  return out;
}

// ---------- folding geometry ----------

/**
 * The angle at residue n's alpha carbon between the backbone coming in and
 * going out (degrees). 180° = straight; an α-helix is ≈ 90°, a β-strand ≈ 120°.
 * Null at the two ends.
 */
export function bendAngle(n: number): number | null {
  if (n <= FIRST || n >= LAST) return null;
  const a = caPos(n - 1);
  const b = caPos(n);
  const c = caPos(n + 1);
  const u = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const v = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
  const dot = u[0]! * v[0]! + u[1]! * v[1]! + u[2]! * v[2]!;
  const cos = dot / (Math.hypot(u[0]!, u[1]!, u[2]!) * Math.hypot(v[0]!, v[1]!, v[2]!));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

/** Residues whose alpha carbons sit close to residue n but far along the chain: where the fold brings parts together. */
export function nearbyResidues(n: number, maxAngstrom = 7, minSeqGap = 4): { n: number; cm: number; angstrom: number }[] {
  const p = caPos(n);
  return RESIDUES.filter((r) => Math.abs(r.n - n) >= minSeqGap)
    .map((r) => {
      const d = dist(p, caPos(r.n));
      return { n: r.n, angstrom: d, cm: d * CM_PER_ANGSTROM };
    })
    .filter((x) => x.angstrom <= maxAngstrom)
    .sort((a, b) => a.angstrom - b.angstrom);
}

export interface Checkpoint {
  key: string;
  a: number;
  b: number;
  angstrom: number;
  cm: number;
  /** The structures the two residues belong to, e.g. "β-strand 164–169". */
  segA: string;
  segB: string;
}

function segName(s: Segment): string {
  return `${SS_INFO[s.ss].label} ${s.start === s.end ? s.start : `${s.start}–${s.end}`}`;
}

/**
 * Tertiary-fold checkpoints: for every pair of segments that touch in the
 * structure, the closest pair of alpha carbons (at least 5 residues apart).
 * On a correct model these marks sit this far apart.
 */
export function checkpoints(maxAngstrom = 6.5): Checkpoint[] {
  const segs = segments();
  const segOf = (n: number) => segs.find((s) => n >= s.start && n <= s.end)!;
  const best = new Map<string, Checkpoint>();
  for (const ra of RESIDUES) {
    for (const rb of RESIDUES) {
      if (rb.n - ra.n < 5) continue;
      const d = dist(caPos(ra.n), caPos(rb.n));
      if (d > maxAngstrom) continue;
      const sa = segOf(ra.n);
      const sb = segOf(rb.n);
      if (sa.index === sb.index) continue;
      const key = `${sa.index}-${sb.index}`;
      const cur = best.get(key);
      if (!cur || d < cur.angstrom) {
        best.set(key, { key: `cp-${ra.n}-${rb.n}`, a: ra.n, b: rb.n, angstrom: d, cm: d * CM_PER_ANGSTROM, segA: segName(sa), segB: segName(sb) });
      }
    }
  }
  return [...best.values()].sort((x, y) => x.a - y.a || x.b - y.b);
}

/** Display name for a segment, e.g. "α-helix 187–196". */
export function segmentName(s: Segment): string {
  return segName(s);
}

/** The segment holding residue n. */
export function segmentOf(n: number): Segment {
  return segments().find((s) => n >= s.start && n <= s.end)!;
}
