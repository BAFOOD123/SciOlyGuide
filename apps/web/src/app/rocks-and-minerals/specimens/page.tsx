import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getRmStats } from "@/lib/rocks";
import { masteryOf } from "@/lib/rocks-types";
import { SPECIMENS } from "@sciolyguide/rocks-minerals";
import { SpecimenGallery } from "@/components/rocks/SpecimenGallery";

export const metadata: Metadata = { title: "Specimen gallery" };

export default async function SpecimensPage() {
  const user = await requireUser();
  const stats = await getRmStats(user.id);
  const mastery = Object.fromEntries(SPECIMENS.map((s) => [s.id, masteryOf(stats.bySpecimen[s.id])]));
  return (
    <div className="space-y-6">
      <nav className="text-sm text-zinc-500">
        <Link href="/rocks-and-minerals" className="hover:underline">
          Rocks and Minerals
        </Link>{" "}
        / <span className="text-zinc-800 dark:text-zinc-200">Specimens</span>
      </nav>
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Specimen gallery</h1>
        <p className="text-zinc-600 dark:text-zinc-400">The 92 specimens of the official Ward&apos;s kit, numbered as on the kit list. Values are typical; real specimens vary.</p>
      </header>
      <SpecimenGallery mastery={mastery} />
    </div>
  );
}
