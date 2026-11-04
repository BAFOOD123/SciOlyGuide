import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { BUILD_BLOCK, DIV_C_EVENTS, eventBySlug } from "@/lib/events";
import { getMyEvents } from "@/lib/user-events";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const e = eventBySlug((await params).slug);
  return { title: e?.name ?? "Event" };
}

export default async function EventInfo({ params }: Params) {
  const { slug } = await params;
  const e = eventBySlug(slug);
  if (!e) notFound();
  if (e.href) redirect(e.href);
  const user = await requireUser();
  const mine = await getMyEvents(user.id);
  const sameBlock = e.block === BUILD_BLOCK ? [] : DIV_C_EVENTS.filter((o) => o.block === e.block && o.slug !== e.slug);
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <nav className="text-sm text-zinc-500">
        <Link href="/dashboard" className="hover:underline">
          Home
        </Link>{" "}
        / <span className="text-zinc-800 dark:text-zinc-200">{e.name}</span>
      </nav>
      <header className="space-y-2">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-300">{e.category}</p>
        <h1 className="text-3xl font-bold tracking-tight">{e.name}</h1>
        <blockquote className="text-lg text-zinc-700 dark:text-zinc-300">“{e.description}”</blockquote>
        <p className="text-xs text-zinc-500">Official short description, soinc.org</p>
      </header>
      <div className="card space-y-3 p-5">
        <p className="font-semibold">Study tools for {e.name} are coming soon.</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {mine.includes(e.slug)
            ? "It's on your list, so it'll show up on your home page as soon as it's ready."
            : "Add it to your events on the home page and it'll show up there when it's ready."}
        </p>
        <div className="flex flex-wrap gap-2">
          <a className="btn btn-primary" href={e.officialUrl} target="_blank" rel="noreferrer">
            Official event page and resources ↗
          </a>
          <Link className="btn btn-secondary" href="/dashboard">
            Back to home
          </Link>
        </div>
      </div>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div className="card p-4">
          <dt className="text-zinc-500">2027 national conflict block</dt>
          <dd className="text-lg font-semibold">
            {e.block === BUILD_BLOCK ? "Block 7 (build events)" : `Block ${e.block}`}
          </dd>
          {sameBlock.length > 0 && <dd className="mt-1 text-zinc-600 dark:text-zinc-400">Same block as {sameBlock.map((o) => o.name).join(", ")}.</dd>}
        </div>
        <div className="card p-4">
          <dt className="text-zinc-500">Format</dt>
          <dd className="text-lg font-semibold">{e.build ? "Built before the tournament" : "Competed on site"}</dd>
        </div>
      </dl>
    </article>
  );
}
