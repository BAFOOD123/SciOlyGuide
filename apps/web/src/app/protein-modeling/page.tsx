import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getProteinDesign } from "@/lib/protein-store";
import { receptorContacts, resLabel3, segments } from "@/lib/protein/analysis";

export const metadata: Metadata = { title: "Protein Modeling" };

export default async function ProteinModelingHub() {
  const user = await requireUser();
  const { design, updatedAt } = await getProteinDesign(user.id);
  const segs = segments();
  const done = segs.filter((s) => design.progress[`seg-${s.index}`]).length;
  const features = design.features.filter((f) => f.kind !== "backbone").length;
  const rbs = receptorContacts().filter((c) => c.sideChain);
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-300">Physical Science &amp; Chemistry · Division C · 2026–27</p>
        <h1 className="text-3xl font-bold tracking-tight">Protein Modeling</h1>
        <p className="max-w-3xl text-zinc-700 dark:text-zinc-300">
          This year’s pre-build is the <strong>sialic acid binding site</strong> of the 2009 H1N1 influenza <strong>hemagglutinin</strong>:
          residues <strong>153–252 of chain A, PDB 3UBE</strong>, at 2 cm per amino acid. Plan and check your model in 3D before you bend a
          single centimeter, then print your build sheet and legend.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href="/events/protein-modeling" className="btn btn-secondary">
            Read the full event guide →
          </Link>
          <a href="https://www.soinc.org/protein-modeling-c" target="_blank" rel="noreferrer" className="btn btn-secondary">
            Official rules &amp; resources ↗
          </a>
        </div>
      </header>

      <Link href="/protein-modeling/studio" className="card group flex flex-col gap-3 p-6 hover:border-brand-400">
        <span className="text-xl font-semibold">Model Studio →</span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          A 3D workspace for your pre-build: the real 3UBE backbone at model scale, a step-by-step folding guide with where every residue goes on
          your Mini-Toober, a side-chain and interaction finder, a ruler that measures in model centimeters, and a Model Description Legend
          you can print. Saves to your account as you go.
        </span>
        <span className="flex flex-wrap gap-2 pt-1 text-xs font-medium">
          <span className="chip bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            {done}/{segs.length} folding steps done
          </span>
          <span className="chip bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-200">
            {features} feature{features === 1 ? "" : "s"} on the model
          </span>
          {updatedAt && (
            <span className="chip bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              last saved {new Date(updatedAt).toLocaleDateString()}
            </span>
          )}
        </span>
      </Link>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <h2 className="font-semibold">The fold</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            One α-helix (the “190-helix”, 187–196), {segs.filter((s) => s.ss === "E").length} β-strand segments that pair into sheets, and the loops between
            them — {segs.length} segments to fold in order.
          </p>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold">The binding site</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Side chains touching the bound receptor in 3UBE: {rbs.map((c) => resLabel3(c.n)).join(", ")}.
          </p>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold">Numbering</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            The studio uses the residue numbers in the RCSB 3UBE file. Confirm them against the modified file from 3D Molecular Designs and JUDE
            before you label.
          </p>
        </div>
      </section>
    </div>
  );
}
