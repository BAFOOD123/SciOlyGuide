import type { Metadata } from "next";
import Link from "next/link";
import { specimensFor, type Focus } from "@sciolyguide/rocks-minerals";
import { requireUser } from "@/lib/auth";
import { flashcardDeck } from "@/lib/rocks";
import { Flashcards } from "@/components/rocks/Flashcards";

export const metadata: Metadata = { title: "Flashcards" };
const FOCI: Focus[] = ["all", "minerals", "rocks", "igneous", "sedimentary", "metamorphic"];

export default async function FlashcardsPage({ searchParams }: { searchParams: Promise<{ deck?: string; front?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const focus = FOCI.includes(sp.deck as Focus) ? (sp.deck as Focus) : "all";
  const deck = await flashcardDeck(user.id, specimensFor(focus).map((s) => s.id));
  return (
    <div className="space-y-4">
      <nav className="mx-auto max-w-2xl text-sm text-zinc-500">
        <Link href="/rocks-and-minerals" className="hover:underline">
          Rocks and Minerals
        </Link>{" "}
        / <span className="text-zinc-800 dark:text-zinc-200">Flashcards</span>
      </nav>
      <Flashcards deck={deck} direction={sp.front === "name" ? "name" : sp.front === "photo" ? "photo" : "clues"} />
    </div>
  );
}
