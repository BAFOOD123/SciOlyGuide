/** [atom name, element, x, y, z] — Å, centered on the fragment. */
export type AtomRow = [string, string, number, number, number];
/** [atom name, element, x, y, z, residue name, residue number] */
export type LigandAtomRow = [string, string, number, number, number, string, number];

export type SS = "H" | "E" | "L";

export interface ResidueData {
  n: number;
  /** Three-letter code, e.g. "TRP". */
  aa: string;
  ss: SS;
  atoms: AtomRow[];
  /** Index pairs into `atoms`. */
  bonds: [number, number][];
}

export interface StructureData {
  pdbId: string;
  chain: string;
  first: number;
  last: number;
  center: number[];
  residues: ResidueData[];
  helices: { start: number; end: number; kind: string }[];
  strands: { start: number; end: number }[];
  sheetPairs: { a: number[]; b: number[]; parallel: boolean; sheet: string }[];
  ssbonds: { residue: number; partnerChain: string; partnerResidue: number }[];
  ligand: { chain: string | null; atoms: LigandAtomRow[]; bonds: [number, number][] };
}
