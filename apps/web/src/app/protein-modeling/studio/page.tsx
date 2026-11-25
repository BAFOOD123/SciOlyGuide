import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getProteinDesign } from "@/lib/protein-store";
import { ProteinStudio } from "@/components/protein/ProteinStudio";

export const metadata: Metadata = { title: "Protein Model Studio" };

export default async function ProteinStudioPage() {
  const user = await requireUser();
  const { design, updatedAt } = await getProteinDesign(user.id);
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-brand-600 dark:text-brand-300">
            <Link href="/protein-modeling" className="hover:underline">
              Protein Modeling
            </Link>{" "}
            · Model Studio
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Design your pre-build model</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            PDB 3UBE · chain A · residues 153–252 · 2 cm per amino acid. Drag to rotate, scroll to zoom, right-drag to pan.
          </p>
        </div>
      </header>
      <ProteinStudio initial={design} savedAt={updatedAt} />
    </div>
  );
}
