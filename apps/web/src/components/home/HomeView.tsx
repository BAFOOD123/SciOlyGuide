"use client";

import Link from "next/link";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { toggleEvent } from "@/app/home-actions";
import { BUILD_BLOCK, CATEGORIES, DIV_C_EVENTS, EVENT_SOURCE, blockConflicts, type DivCEvent } from "@/lib/events";

const CATEGORY_STYLE: Record<string, string> = {
  "Life, Personal & Social Science": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  "Earth & Space Science": "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  "Physical Science & Chemistry": "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  "Technology & Engineering": "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
  "Inquiry & Nature of Science": "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
};

export interface HomeViewProps {
  displayName: string;
  chosen: string[];
  /** One-line progress summary per live event slug. */
  progress: Record<string, string>;
}

function eventHref(e: DivCEvent) {
  return e.href ?? `/events/${e.slug}`;
}

export function HomeView({ displayName, chosen: initial, progress }: HomeViewProps) {
  const [chosen, setChosen] = useState(initial);
  const [optimistic, applyOptimistic] = useOptimistic(chosen, (cur: string[], slug: string) =>
    cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug],
  );
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [liveOnly, setLiveOnly] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(initial.length === 0);

  const toggle = (slug: string) =>
    startTransition(async () => {
      applyOptimistic(slug);
      setChosen(await toggleEvent(slug));
    });

  const mine = DIV_C_EVENTS.filter((e) => optimistic.includes(e.slug)).sort((a, b) => Number(!!b.href) - Number(!!a.href));
  const conflicts = blockConflicts(optimistic);
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      DIV_C_EVENTS.filter(
        (e) => (!liveOnly || e.href) && (!q || e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)),
      ),
    [q, liveOnly],
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-brand-600 dark:text-brand-300">Division C · 2026–27 season</p>
          <h1 className="text-3xl font-bold tracking-tight [text-wrap:balance]">Hi, {displayName}</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {mine.length ? `You're studying ${mine.length} event${mine.length === 1 ? "" : "s"}.` : "Pick the events you're competing in to build your study home."}
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => setPickerOpen((o) => !o)} aria-expanded={pickerOpen} aria-controls="all-events">
          {pickerOpen ? "Done choosing" : "Choose events"}
        </button>
      </header>

      <section aria-labelledby="my-events" className="space-y-4">
        <h2 id="my-events" className="text-xl font-bold">
          My events
        </h2>
        {mine.length === 0 ? (
          <div className="card flex flex-col items-start gap-3 border-dashed p-6">
            <p className="font-medium">No events yet.</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Add your events from the list below. Codebusters and Rocks and Minerals are ready now, and the rest are on the way.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((e) => (
              <article key={e.slug} className="card flex flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`chip ${CATEGORY_STYLE[e.category]}`}>{e.category}</span>
                  {e.href ? (
                    <span className="chip bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">Live</span>
                  ) : (
                    <span className="chip bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">Coming soon</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold">{e.name}</h3>
                <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {e.href ? (progress[e.slug] ?? "Start studying.") : "Read the full event guide, then practice with the official resources."}
                </p>
                <div className="flex items-center gap-2">
                  <Link href={eventHref(e)} className={`btn ${e.href ? "btn-primary" : "btn-secondary"} flex-1`}>
                    {e.href ? "Study" : "Event guide"}
                  </Link>
                  {e.href && (
                    <Link href={`/events/${e.slug}`} className="btn btn-ghost px-3" title="Read the event guide">
                      Guide
                    </Link>
                  )}
                  <button type="button" className="btn btn-ghost px-3" onClick={() => toggle(e.slug)} aria-label={`Remove ${e.name}`}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {conflicts.map((c) => (
          <p key={c.block} role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
            <b>Schedule conflict:</b> {c.events.map((e) => e.name).join(" and ")} are both in conflict block {c.block} at the 2027 National Tournament,
            so one student usually can&apos;t compete in both. Check your own tournament&apos;s schedule.
          </p>
        ))}
      </section>

      {pickerOpen && (
        <section id="all-events" aria-labelledby="all-events-h" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="all-events-h" className="text-xl font-bold">
                All Division C events
              </h2>
              <p className="text-sm text-zinc-500">
                Descriptions from{" "}
                <a className="underline" href={EVENT_SOURCE.url} target="_blank" rel="noreferrer">
                  {EVENT_SOURCE.label}
                </a>
                . Numbers are the 2027 national conflict blocks.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="accent-brand-600" checked={liveOnly} onChange={(ev) => setLiveOnly(ev.target.checked)} />
                Live only
              </label>
              <input
                id="event-search"
                type="search"
                className="input w-56"
                placeholder="Search events"
                value={query}
                onChange={(ev) => setQuery(ev.target.value)}
                aria-label="Search events"
              />
            </div>
          </div>
          {CATEGORIES.map((cat) => {
            const list = filtered.filter((e) => e.category === cat);
            if (!list.length) return null;
            return (
              <div key={cat} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{cat}</h3>
                <ul className="card divide-y divide-zinc-100 dark:divide-zinc-800">
                  {list.map((e) => {
                    const on = optimistic.includes(e.slug);
                    return (
                      <li key={e.slug} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:flex-nowrap">
                        <span
                          className="grid size-8 shrink-0 place-items-center rounded-lg bg-zinc-100 text-xs font-bold tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                          title={e.block === BUILD_BLOCK ? "Block 7: build events" : `Conflict block ${e.block}`}
                        >
                          {e.block}
                        </span>
                        <div className="min-w-0 flex-1 basis-60">
                          <p className="flex flex-wrap items-center gap-2 font-medium">
                            {e.name}
                            {e.href && <span className="chip bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">Live</span>}
                            {e.build && <span className="chip bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">Build</span>}
                          </p>
                          <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{e.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggle(e.slug)}
                          aria-pressed={on}
                          className={`btn w-28 shrink-0 ${on ? "btn-secondary" : "btn-primary"}`}
                        >
                          {on ? "✓ Added" : "Add"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-sm text-zinc-500">No events match “{query}”.</p>}
        </section>
      )}
    </div>
  );
}
