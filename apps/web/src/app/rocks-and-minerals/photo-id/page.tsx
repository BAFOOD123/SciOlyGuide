import type { Metadata } from "next";
import Link from "next/link";
import type { Focus } from "@sciolyguide/rocks-minerals";
import { requireUser } from "@/lib/auth";
import { getRmStats, weightedPhotoPool } from "@/lib/rocks";
import { PhotoDrill } from "@/components/rocks/PhotoDrill";

export const metadata: Metadata = { title: "Photo ID" };
const FOCI: Focus[] = ["all", "minerals", "rocks", "igneous", "sedimentary", "metamorphic"];

export default async function PhotoIdPage({ searchParams }: { searchParams: Promise<{ deck?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const deck = FOCI.includes(sp.deck as Focus) ? (sp.deck as Focus) : "all";
  const stats = await getRmStats(user.id);
  return (
    <div className="space-y-5">
      <nav className="text-sm text-zinc-500">
        <Link href="/rocks-and-minerals" className="hover:underline">
          Rocks and Minerals
        </Link>{" "}
        / <span className="text-zinc-800 dark:text-zinc-200">Photo ID</span>
      </nav>
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Photo ID</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Real specimen photos from Wikimedia Commons, several per specimen. Name what you see, use hints if you&apos;re stuck, then answer a
          follow-up about it, the way a tournament station works.
        </p>
      </header>
      <PhotoDrill key={deck} pool={weightedPhotoPool(deck, stats.bySpecimen)} deck={deck} today={stats.photoToday} />
    </div>
  );
}
