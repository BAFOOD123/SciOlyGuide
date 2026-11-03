import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CIPHERS, GUIDES, cipherInfo, isCipherType } from "@sciolyguide/codebusters";

type Params = { params: Promise<{ type: string }> };

export function generateStaticParams() {
  return CIPHERS.map((c) => ({ type: c.type }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { type } = await params;
  return { title: isCipherType(type) ? `How to solve ${cipherInfo(type).name}` : "Learn" };
}

const MODE_LABEL = { decode: "Decode", cryptanalysis: "Cryptanalysis", keyword: "Keyword" } as const;

export default async function LearnPage({ params }: Params) {
  const { type } = await params;
  if (!isCipherType(type)) notFound();
  const info = cipherInfo(type);
  const guide = GUIDES[type];
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <nav className="text-sm text-zinc-500">
        <Link href="/codebusters" className="hover:underline">
          Codebusters
        </Link>{" "}
        / Learn / <span className="text-zinc-800 dark:text-zinc-200">{info.name}</span>
      </nav>
      <header className="space-y-2">
        <p className="text-sm font-medium text-brand-600">{info.family}</p>
        <h1 className="text-3xl font-bold tracking-tight">How to solve {info.name}</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{guide.summary}</p>
      </header>
      <div className="card grid gap-4 p-5 sm:grid-cols-2">
        {(["regional", "state"] as const).map((lvl) => (
          <div key={lvl}>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{lvl === "regional" ? "Regional / Invitational" : "State / National"}</p>
            <p className="mt-1 font-medium">{info.levels[lvl].map((m) => MODE_LABEL[m]).join(" · ")}</p>
          </div>
        ))}
        <p className="text-xs text-zinc-500 sm:col-span-2">2026–27 Division C usage. Always confirm with the official rules manual.</p>
      </div>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Method</h2>
        <ol className="space-y-3">
          {guide.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-800 dark:bg-brand-900/60 dark:text-brand-200">
                {i + 1}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Tips</h2>
        <ul className="list-disc space-y-2 pl-5">
          {guide.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>
      <Link href={`/codebusters/practice/${type}`} className="btn btn-primary">
        Practice {info.name} →
      </Link>
    </article>
  );
}
