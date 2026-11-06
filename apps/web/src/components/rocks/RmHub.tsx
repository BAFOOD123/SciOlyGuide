"use client";

import Link from "next/link";
import { useState } from "react";
import { SKILLS, specimenById, type Focus } from "@sciolyguide/rocks-minerals";
import { startRmPractice, startRmStations } from "@/app/rocks-and-minerals/actions";
import { photoSrc, type RmStats } from "@/lib/rocks-types";
import { SPECIMENS as ALL_SPECIMENS, photosFor } from "@sciolyguide/rocks-minerals";

const PHOTO_COUNT = ALL_SPECIMENS.reduce((n, s) => n + photosFor(s.id).length, 0);
/** A few recognizable specimens for the Photo ID preview. */
const PREVIEW = ["labradorite", "malachite", "gneiss", "azurite", "obsidian", "coquina"]
  .map((id) => photosFor(id)[0]?.key)
  .filter((k): k is string => !!k);

const FOCUS: { value: Focus; label: string }[] = [
  { value: "all", label: "All specimens and concepts" },
  { value: "minerals", label: "Minerals" },
  { value: "rocks", label: "All rocks" },
  { value: "igneous", label: "Igneous rocks" },
  { value: "sedimentary", label: "Sedimentary rocks" },
  { value: "metamorphic", label: "Metamorphic rocks" },
];
const GROUPS = ["Identification", "Mineral properties", "Rocks", "Geology concepts"];

export const RM_DESCRIPTION = {
  text: "Teams will identify and classify rocks and minerals and demonstrate knowledge of how rocks and minerals help to understand geologic processes, interpretation of earth’s history, the development of natural resources, and use by society.",
  url: "https://www.soinc.org/rocks-and-minerals-c",
};

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export function RmHub({ stats }: { stats: RmStats }) {
  const [focus, setFocus] = useState<Focus>("all");
  const [group, setGroup] = useState("");
  const [count, setCount] = useState(10);
  const [typed, setTyped] = useState(false);
  const [stations, setStations] = useState(15);
  const [seconds, setSeconds] = useState(120);
  const [stationTyped, setStationTyped] = useState(false);
  const [deck, setDeck] = useState<Focus>("all");
  const [direction, setDirection] = useState<"name" | "clues" | "photo">("photo");
  const [photoDeck, setPhotoDeck] = useState<Focus>("all");

  const skillRows = SKILLS.map((s) => ({ ...s, st: stats.bySkill[s.skill] }))
    .filter((s) => s.st && s.st.answered >= 2)
    .sort((a, b) => a.st!.correct / a.st!.answered - b.st!.correct / b.st!.answered)
    .slice(0, 6);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-300">Earth &amp; Space Science · Division C · 2026–27</p>
        <h1 className="text-3xl font-bold tracking-tight">Rocks and Minerals</h1>
        <blockquote className="max-w-3xl text-zinc-700 dark:text-zinc-300">
          “{RM_DESCRIPTION.text}”{" "}
          <a className="text-xs text-zinc-500 underline" href={RM_DESCRIPTION.url} target="_blank" rel="noreferrer">
            soinc.org
          </a>
        </blockquote>
        <Link href="/events/rocks-and-minerals" className="inline-flex text-sm font-medium text-brand-600 hover:underline dark:text-brand-300">
          Read the full event guide →
        </Link>
        <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
          Covers all 129 specimens of the 2027 National Rocks & Minerals List. At the tournament you&apos;ll handle real specimens, so pair this with hands-on
          hardness, streak and acid tests.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Your progress">
        <Stat label="Mastered" value={`${stats.mastered}/129`} hint="≥ 80% on 3+ recent answers" />
        <Stat label="Answered" value={String(stats.answered)} />
        <Stat label="Accuracy" value={stats.accuracy === null ? "—" : `${Math.round(stats.accuracy * 100)}%`} />
        <Stat label="Cards due" value={String(stats.dueCards)} hint={`${stats.newCards} not started`} />
      </section>

      <section className="card grid gap-5 overflow-hidden p-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1">
          {PREVIEW.map((k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={k} src={photoSrc(k)} alt="" className="aspect-square w-full rounded object-cover" loading="lazy" />
          ))}
        </div>
        <div className="flex flex-col gap-3 p-5">
          <h2 className="text-xl font-bold">Photo ID</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Name real specimens from photos: {PHOTO_COUNT} Wikimedia Commons photos covering the specimen list. Type the name or pick from look-alikes,
            use hints when stuck, and answer a follow-up about each specimen. Your mix-ups are tracked below.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-xs font-medium text-zinc-500">Deck</span>
              <select id="photo-deck" className="input w-48" value={photoDeck} onChange={(e) => setPhotoDeck(e.target.value as Focus)}>
                {FOCUS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.value === "all" ? "All 129 specimens" : f.label}
                  </option>
                ))}
              </select>
            </label>
            <Link href={`/rocks-and-minerals/photo-id?deck=${photoDeck}`} className="btn btn-primary">
              Start Photo ID
            </Link>
          </div>
          <p className="text-xs text-zinc-500">
            Today: {stats.photoToday.correct}/{stats.photoToday.answered} correct
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <form
          className="card flex flex-col gap-3 p-5"
          action={() => startRmPractice({ focus, count, typed, skillGroup: group || undefined })}
        >
          <h2 className="font-semibold">Practice set</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Instant feedback and a specimen sheet after every question. Your weak specimens come up more often.</p>
          <label className="space-y-1 text-sm">
            <span className="text-xs font-medium text-zinc-500">Specimens</span>
            <select id="rm-focus" className="input" value={focus} onChange={(e) => setFocus(e.target.value as Focus)}>
              {FOCUS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-xs font-medium text-zinc-500">Topic</span>
            <select id="rm-group" className="input" value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="">Everything</option>
              {GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-500">Questions</span>
              <select id="rm-count" className="input w-20" value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {[5, 10, 20, 30].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-brand-600" checked={typed} onChange={(e) => setTyped(e.target.checked)} />
              Type the names
            </label>
          </div>
          <button className="btn btn-primary mt-auto">Start practice</button>
        </form>

        <form className="card flex flex-col gap-3 p-5" action={() => startRmStations({ stations, seconds, typed: stationTyped })}>
          <h2 className="font-semibold">Station test</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tournament format: one specimen per station with ID plus property questions. Stations rotate on a timer and you can&apos;t go back.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="space-y-1">
              <span className="text-xs font-medium text-zinc-500">Stations</span>
              <select id="rm-stations" className="input" value={stations} onChange={(e) => setStations(Number(e.target.value))}>
                {[10, 15, 20, 25].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-medium text-zinc-500">Per station</span>
              <select id="rm-seconds" className="input" value={seconds} onChange={(e) => setSeconds(Number(e.target.value))}>
                <option value={60}>1 min</option>
                <option value={90}>1.5 min</option>
                <option value={120}>2 min</option>
                <option value={180}>3 min</option>
                <option value={0}>Untimed</option>
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-brand-600" checked={stationTyped} onChange={(e) => setStationTyped(e.target.checked)} />
            Write specimen names (no choices)
          </label>
          <p className="text-xs text-zinc-500">{seconds ? `${(stations * seconds) / 60} minutes total.` : "Move on when you're ready."}</p>
          <button className="btn btn-primary mt-auto">Start station test</button>
        </form>

        <div className="card flex flex-col gap-3 p-5">
          <h2 className="font-semibold">Flashcards</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Spaced repetition: cards you know come back after 1, 3, 7 and 21 days, and cards you miss come back the same day.
          </p>
          <label className="space-y-1 text-sm">
            <span className="text-xs font-medium text-zinc-500">Deck</span>
            <select id="rm-deck" className="input" value={deck} onChange={(e) => setDeck(e.target.value as Focus)}>
              {FOCUS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.value === "all" ? "All 129 specimens" : f.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-xs font-medium text-zinc-500">Front of card</span>
            <select id="rm-direction" className="input" value={direction} onChange={(e) => setDirection(e.target.value as "name" | "clues" | "photo")}>
              <option value="photo">Photo → name</option>
              <option value="clues">Properties → name</option>
              <option value="name">Name → properties</option>
            </select>
          </label>
          <p className="text-xs text-zinc-500">
            {stats.dueCards} due now · {stats.newCards} new
          </p>
          <Link href={`/rocks-and-minerals/flashcards?deck=${deck}&front=${direction}`} className="btn btn-primary mt-auto">
            Study cards
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link href="/rocks-and-minerals/specimens" className="card block p-5 hover:border-brand-400">
          <h2 className="font-semibold">Specimen gallery →</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            All 129 specimens with hardness, streak, luster, cleavage, formation and uses. Search and filter by type, and see what you&apos;ve mastered.
          </p>
        </Link>
        <Link href="/rocks-and-minerals/reference" className="card block p-5 hover:border-brand-400">
          <h2 className="font-semibold">Reference tables →</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Mohs scale, igneous texture × composition grid, sedimentary and metamorphic classification, Bowen&apos;s series, grain sizes.
          </p>
        </Link>
      </section>
      <p className="text-xs text-zinc-500">
        Photos: Wikimedia Commons contributors. Summaries: Wikipedia (CC BY-SA 4.0).{" "}
        <Link className="underline" href="/rocks-and-minerals/credits">
          Full credits
        </Link>
      </p>

      {stats.confusions.length > 0 && (
        <section className="card space-y-3 p-5">
          <h2 className="font-semibold">Your Photo ID mix-ups</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {stats.confusions.map((c) => (
              <li key={`${c.actual}>${c.guessed}`} className="flex items-center gap-2 text-sm">
                <span className="font-medium">{specimenById(c.actual)?.name}</span>
                <span className="text-zinc-400">mistaken for</span>
                <span className="font-medium">{specimenById(c.guessed)?.name}</span>
                <span className="ml-auto chip bg-zinc-100 tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">×{c.count}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-zinc-500">Compare them side by side in the specimen gallery.</p>
        </section>
      )}

      {(stats.weakest.length > 0 || skillRows.length > 0) && (
        <section className="grid gap-4 md:grid-cols-2">
          {stats.weakest.length > 0 && (
            <div className="card space-y-3 p-5">
              <h2 className="font-semibold">Specimens to review</h2>
              <ul className="flex flex-wrap gap-2">
                {stats.weakest.map((id) => {
                  const st = stats.bySpecimen[id]!;
                  return (
                    <li key={id}>
                      <Link href={`/rocks-and-minerals/specimens#${id}`} className="chip bg-red-50 px-2.5 py-1 text-red-800 dark:bg-red-950/40 dark:text-red-200">
                        {specimenById(id)?.name} · {st.correct}/{st.answered}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-zinc-500">Practice sets show these more often.</p>
            </div>
          )}
          {skillRows.length > 0 && (
            <div className="card space-y-3 p-5">
              <h2 className="font-semibold">Weakest topics</h2>
              <ul className="space-y-2 text-sm">
                {skillRows.map((s) => {
                  const pct = Math.round((s.st!.correct / s.st!.answered) * 100);
                  return (
                    <li key={s.skill}>
                      <div className="flex justify-between gap-2">
                        <span>{s.label}</span>
                        <span className="tabular-nums text-zinc-500">{pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}

      {stats.recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Recent sessions</h2>
          <div className="card divide-y divide-zinc-100 dark:divide-zinc-800">
            {stats.recent.map((r) => (
              <Link key={r.id} href={`/rocks-and-minerals/quiz/${r.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <span className="w-40">{new Date(r.startedAt).toLocaleString()}</span>
                <span className="chip bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{r.mode === "stations" ? "station test" : "practice"}</span>
                <span className="ml-auto font-semibold tabular-nums">{r.finishedAt ? `${r.score}/${r.maxScore}` : "In progress →"}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
