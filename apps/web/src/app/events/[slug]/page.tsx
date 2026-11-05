import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { BUILD_BLOCK, DIV_C_EVENTS, eventBySlug } from "@/lib/events";
import { getMyEvents } from "@/lib/user-events";
import { guideFor } from "@/lib/guides.generated";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const e = eventBySlug((await params).slug);
  return { title: e?.name ?? "Event" };
}

export default async function EventInfo({ params }: Params) {
  const { slug } = await params;
  const e = eventBySlug(slug);
  if (!e) notFound();
  const user = await requireUser();
  const mine = await getMyEvents(user.id);
  const guide = guideFor(slug);
  const sameBlock = e.block === BUILD_BLOCK ? [] : DIV_C_EVENTS.filter((o) => o.block === e.block && o.slug !== e.slug);

  return (
    <div className="mx-auto max-w-6xl">
      <nav className="mb-4 text-sm text-zinc-500">
        <Link href="/dashboard" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-zinc-800 dark:text-zinc-200">{e.name}</span>
      </nav>

      <header className="mb-6 space-y-2">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-300">{e.category}</p>
        <h1 className="text-3xl font-bold tracking-tight">{e.name}</h1>
        {guide?.summary && <p className="text-lg text-zinc-700 dark:text-zinc-300">{guide.summary}</p>}
        <div className="flex flex-wrap gap-2 pt-1">
          {e.href && (
            <Link className="btn btn-primary" href={e.href}>
              Open practice tools →
            </Link>
          )}
          <a className="btn btn-secondary" href={e.officialUrl} target="_blank" rel="noreferrer">
            Official rules & resources ↗
          </a>
          {!mine.includes(e.slug) && (
            <Link className="btn btn-secondary" href="/dashboard">
              Add to my events
            </Link>
          )}
        </div>
      </header>

      {guide ? (
        <div className="gap-8 lg:flex">
          {guide.toc.length > 1 && (
            <nav aria-label="Contents" className="mb-6 shrink-0 lg:sticky lg:top-6 lg:mb-0 lg:max-h-[calc(100vh-3rem)] lg:w-56 lg:self-start lg:overflow-auto">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">On this page</p>
              <ul className="space-y-1 text-sm">
                {guide.toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="block rounded px-2 py-1 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <article className="guide-prose min-w-0 flex-1" dangerouslySetInnerHTML={{ __html: guide.html }} />
        </div>
      ) : (
        <div className="card space-y-3 p-5">
          <blockquote className="text-zinc-700 dark:text-zinc-300">“{e.description}”</blockquote>
          <p className="text-sm text-zinc-500">A full study guide for this event is coming soon.</p>
          <dl className="grid gap-4 pt-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">2027 national conflict block</dt>
              <dd className="font-semibold">{e.block === BUILD_BLOCK ? "Block 7 (build events)" : `Block ${e.block}`}</dd>
              {sameBlock.length > 0 && <dd className="mt-1 text-zinc-600 dark:text-zinc-400">Same block as {sameBlock.map((o) => o.name).join(", ")}.</dd>}
            </div>
            <div>
              <dt className="text-zinc-500">Format</dt>
              <dd className="font-semibold">{e.build ? "Built before the tournament" : "Competed on site"}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
