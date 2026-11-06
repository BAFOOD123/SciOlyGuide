import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { anatomyImg, LABEL_SETS } from "@/lib/anatomy";
import { ANATOMY_QUESTIONS, ANATOMY_TOPICS } from "@/lib/anatomy-questions";

export const metadata: Metadata = { title: "Anatomy and Physiology" };

export default async function AnatomyHub() {
  await requireUser();
  const totalQ = ANATOMY_QUESTIONS.length;
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-300">Life, Personal &amp; Social Science · Division C · 2026–27</p>
        <h1 className="text-3xl font-bold tracking-tight">Anatomy and Physiology</h1>
        <p className="max-w-3xl text-zinc-700 dark:text-zinc-300">
          The 2027 systems are the <strong>respiratory</strong>, <strong>digestive</strong> and <strong>immune</strong> systems. Drill {totalQ} questions by
          topic, take a timed test, or label the diagrams — then dig into the physiology and diseases in the full event guide.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href="/events/anatomy-physiology" className="btn btn-secondary">
            Read the full event guide →
          </Link>
          <a href="https://www.soinc.org/anatomy-and-physiology-c" target="_blank" rel="noreferrer" className="btn btn-secondary">
            Official rules &amp; resources ↗
          </a>
        </div>
      </header>

      {/* Study tools */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/anatomy-physiology/practice" className="card group flex flex-col gap-2 p-5 hover:border-brand-400">
          <span className="text-lg font-semibold">Practice by topic →</span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Pick any mix of topics and answer at your own pace. Every question shows the answer and an explanation.
          </span>
          <span className="mt-auto pt-2 text-xs font-medium text-brand-600 dark:text-brand-300">{ANATOMY_TOPICS.length} topics · {totalQ} questions</span>
        </Link>
        <Link href="/anatomy-physiology/test" className="card group flex flex-col gap-2 p-5 hover:border-brand-400">
          <span className="text-lg font-semibold">Timed test →</span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            A mixed, timed round like a tournament. Answer against the clock, then get a full graded review.
          </span>
          <span className="mt-auto pt-2 text-xs font-medium text-brand-600 dark:text-brand-300">20–40 questions · ~45 s each</span>
        </Link>
      </section>

      {/* Label the diagram */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Label the diagram</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          A station classic: name each numbered structure. Choose multiple-choice to learn, or “type it” to test yourself like the real event.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {LABEL_SETS.map((s) => (
            <Link key={s.slug} href={`/anatomy-physiology/label/${s.slug}`} className="card group flex items-center gap-4 p-4 hover:border-brand-400">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={anatomyImg(s.image)} alt="" className="size-20 shrink-0 rounded-lg border border-zinc-200 object-contain dark:border-zinc-800" />
              <span className="min-w-0">
                <span className="block font-semibold">{s.title}</span>
                <span className="mt-0.5 block text-sm text-zinc-600 dark:text-zinc-400">{s.markers.length} structures to label</span>
                <span className="mt-1 inline-block text-sm font-medium text-brand-600 group-hover:underline dark:text-brand-300">Start labeling →</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
