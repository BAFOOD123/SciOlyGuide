// Builds the Protein Modeling pre-build data (src/lib/protein/structure.generated.ts)
// from a PDB file. The structure is public-domain data from the RCSB Protein Data Bank.
//
//   curl -o 3UBE.pdb https://files.rcsb.org/download/3UBE.pdb
//   node scripts/build-protein-data.mjs 3UBE.pdb
//
// It keeps chain A residues 153–252 (every heavy atom), the HELIX/SHEET records that
// fall in that range, the disulfide records touching it, and the receptor analog
// (LSTc, the glycan whose sialic acid sits in chain A's binding site).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const outFile = join(here, "..", "src", "lib", "protein", "structure.generated.ts");

const PDB_ID = "3UBE";
const CHAIN = "A";
const FIRST = 153;
const LAST = 252;

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/build-protein-data.mjs <path/to/3UBE.pdb>");
  process.exit(1);
}
const lines = readFileSync(src, "utf8").split(/\r?\n/);
const inRange = (n) => n >= FIRST && n <= LAST;
const num = (s) => Number.parseInt(s.trim(), 10);
const r2 = (v) => Math.round(v * 100) / 100;

/** @typedef {{name:string, el:string, x:number, y:number, z:number}} Atom */

// ---- protein atoms (first altloc only, no hydrogens) ----
/** @type {Map<number, {n:number, aa:string, atoms: Atom[]}>} */
const residues = new Map();
for (const l of lines) {
  if (!l.startsWith("ATOM")) continue;
  if (l[21] !== CHAIN) continue;
  const n = num(l.slice(22, 26));
  if (!inRange(n) || l[26].trim()) continue; // no insertion codes in this range
  const alt = l[16];
  if (alt !== " " && alt !== "A") continue;
  const el = (l.slice(76, 78).trim() || l.slice(12, 14).trim()).toUpperCase();
  if (el === "H") continue;
  const aa = l.slice(17, 20);
  if (!residues.has(n)) residues.set(n, { n, aa, atoms: [] });
  residues.get(n).atoms.push({ name: l.slice(12, 16).trim(), el, x: +l.slice(30, 38), y: +l.slice(38, 46), z: +l.slice(46, 54) });
}
const resList = [...residues.values()].sort((a, b) => a.n - b.n);
if (resList.length !== LAST - FIRST + 1) throw new Error(`expected ${LAST - FIRST + 1} residues, got ${resList.length}`);

// Center on the fragment's alpha-carbon centroid (keeps the PDB axes, so the
// default view matches JUDE/Jmol's default orientation).
const cas = resList.map((r) => r.atoms.find((a) => a.name === "CA"));
const center = [0, 1, 2].map((k) => cas.reduce((s, a) => s + [a.x, a.y, a.z][k], 0) / cas.length);

// ---- secondary structure ----
const helices = [];
const strands = [];
for (const l of lines) {
  if (l.startsWith("HELIX") && l[19] === CHAIN) {
    const s = num(l.slice(21, 25));
    const e = num(l.slice(33, 37));
    const cls = num(l.slice(38, 40));
    if (e < FIRST || s > LAST) continue;
    helices.push({ start: Math.max(s, FIRST), end: Math.min(e, LAST), kind: cls === 5 ? "3-10" : "alpha" });
  }
}
// SHEET records: consecutive strands in a sheet pair up; sense is relative to the previous strand.
const sheets = new Map();
for (const l of lines) {
  if (!l.startsWith("SHEET")) continue;
  const id = l.slice(11, 14).trim();
  const chain = l[21];
  const s = num(l.slice(22, 26));
  const e = num(l.slice(33, 37));
  const sense = num(l.slice(38, 40));
  if (!sheets.has(id)) sheets.set(id, []);
  sheets.get(id).push({ chain, start: s, end: e, sense });
}
const strandKey = (s) => `${s.start}-${s.end}`;
const strandSet = new Map();
const pairs = [];
for (const [id, list] of sheets) {
  list.forEach((s, i) => {
    if (s.chain !== CHAIN || s.end < FIRST || s.start > LAST) return;
    const clipped = { start: Math.max(s.start, FIRST), end: Math.min(s.end, LAST) };
    strandSet.set(strandKey(clipped), clipped);
    if (i > 0) {
      const p = list[i - 1];
      if (p.chain === CHAIN && p.end >= FIRST && p.start <= LAST) {
        const a = { start: Math.max(p.start, FIRST), end: Math.min(p.end, LAST) };
        const key = [strandKey(a), strandKey(clipped)].sort().join("|");
        if (!pairs.some((q) => q.key === key)) pairs.push({ key, a, b: clipped, parallel: s.sense === 1, sheet: id });
      }
    }
  });
}
strands.push(...[...strandSet.values()].sort((a, b) => a.start - b.start));

// ---- disulfides touching the range ----
const ssbonds = [];
for (const l of lines) {
  if (!l.startsWith("SSBOND")) continue;
  const c1 = l[15], n1 = num(l.slice(17, 21));
  const c2 = l[29], n2 = num(l.slice(31, 35));
  const ends = [
    [c1, n1, c2, n2],
    [c2, n2, c1, n1],
  ];
  for (const [ca, na, cb, nb] of ends) {
    if (ca === CHAIN && inRange(na)) ssbonds.push({ residue: na, partnerChain: cb, partnerResidue: nb });
  }
}

// ---- receptor analog: the glycan (LSTc) whose sialic acid is closest to the fragment ----
const het = new Map();
for (const l of lines) {
  if (!l.startsWith("HETATM")) continue;
  const resName = l.slice(17, 20);
  if (!["SIA", "GAL", "NAG"].includes(resName)) continue;
  const chain = l[21];
  const el = (l.slice(76, 78).trim() || l.slice(12, 14).trim()).toUpperCase();
  if (el === "H") continue;
  if (!het.has(chain)) het.set(chain, []);
  het.get(chain).push({ name: l.slice(12, 16).trim(), el, x: +l.slice(30, 38), y: +l.slice(38, 46), z: +l.slice(46, 54), resName, resSeq: num(l.slice(22, 26)) });
}
let ligChain = null;
let best = Infinity;
for (const [chain, atoms] of het) {
  if (!atoms.some((a) => a.resName === "SIA")) continue;
  for (const a of atoms) {
    if (a.resName !== "SIA") continue;
    for (const c of cas) {
      const d = Math.hypot(a.x - c.x, a.y - c.y, a.z - c.z);
      if (d < best) { best = d; ligChain = chain; }
    }
  }
}
const ligAtoms = het.get(ligChain) ?? [];

// ---- bonds by distance ----
function bondsOf(atoms) {
  const out = [];
  for (let i = 0; i < atoms.length; i++)
    for (let j = i + 1; j < atoms.length; j++) {
      const a = atoms[i], b = atoms[j];
      const max = a.el === "S" || b.el === "S" ? 2.1 : 1.9;
      if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) <= max) out.push([i, j]);
    }
  return out;
}

const shift = (a) => [r2(a.x - center[0]), r2(a.y - center[1]), r2(a.z - center[2])];
const ssOf = (n) => (helices.some((h) => n >= h.start && n <= h.end) ? "H" : strands.some((s) => n >= s.start && n <= s.end) ? "E" : "L");

const data = {
  pdbId: PDB_ID,
  chain: CHAIN,
  first: FIRST,
  last: LAST,
  center: center.map(r2),
  residues: resList.map((r) => ({
    n: r.n,
    aa: r.aa,
    ss: ssOf(r.n),
    atoms: r.atoms.map((a) => [a.name, a.el, ...shift(a)]),
    bonds: bondsOf(r.atoms),
  })),
  helices,
  strands,
  sheetPairs: pairs.map(({ a, b, parallel, sheet }) => ({ a: [a.start, a.end], b: [b.start, b.end], parallel, sheet })),
  ssbonds,
  ligand: {
    chain: ligChain,
    atoms: ligAtoms.map((a) => [a.name, a.el, ...shift(a), a.resName, a.resSeq]),
    bonds: bondsOf(ligAtoms),
  },
};

const banner = `// GENERATED by scripts/build-protein-data.mjs from RCSB PDB ${PDB_ID} — do not edit by hand.\n// Coordinates in Å, centered on the chain ${CHAIN} ${FIRST}–${LAST} alpha-carbon centroid (PDB axes kept).\n`;
writeFileSync(
  outFile,
  `${banner}import type { StructureData } from "./types";\n\nexport const STRUCTURE: StructureData = ${JSON.stringify(data)};\n`,
);
console.log(`wrote ${outFile}: ${data.residues.length} residues, ${data.helices.length} helices, ${data.strands.length} strands, ${data.sheetPairs.length} strand pairs, ${data.ssbonds.length} disulfides, ligand chain ${ligChain} (${ligAtoms.length} atoms)`);
