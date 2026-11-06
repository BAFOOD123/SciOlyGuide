import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { labelSetBySlug } from "@/lib/anatomy";
import { LabelDrill } from "@/components/anatomy/LabelDrill";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const set = labelSetBySlug((await params).slug);
  return { title: set ? `Label: ${set.title}` : "Label the diagram" };
}

export default async function LabelPage({ params }: Params) {
  const { slug } = await params;
  const set = labelSetBySlug(slug);
  if (!set) notFound();
  await requireUser();
  return (
    <div className="space-y-4">
      <nav className="mx-auto max-w-5xl text-sm text-zinc-500">
        <Link href="/anatomy-physiology" className="hover:underline">
          Anatomy and Physiology
        </Link>{" "}
        / <span className="text-zinc-800 dark:text-zinc-200">Label: {set.title}</span>
      </nav>
      <LabelDrill set={set} />
    </div>
  );
}
