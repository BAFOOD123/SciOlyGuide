import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { AnatomyQuiz } from "@/components/anatomy/AnatomyQuiz";

export const metadata: Metadata = { title: "Anatomy practice" };

export default async function AnatomyPracticePage() {
  await requireUser();
  return (
    <div className="space-y-4">
      <nav className="mx-auto max-w-3xl text-sm text-zinc-500">
        <Link href="/anatomy-physiology" className="hover:underline">
          Anatomy and Physiology
        </Link>{" "}
        / <span className="text-zinc-800 dark:text-zinc-200">Practice questions</span>
      </nav>
      <AnatomyQuiz initialMode="practice" />
    </div>
  );
}
