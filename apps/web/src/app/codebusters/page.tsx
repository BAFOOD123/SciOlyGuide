import type { Metadata } from "next";
import Link from "next/link";
import { CIPHERS, EVENT_DESCRIPTION, SCORING, cipherInfo, isCipherType } from "@sciolyguide/codebusters";
import { requireUser } from "@/lib/auth";
import { getUserStats, recentAttempts } from "@/lib/codebusters";
import { createTest, startTimed } from "./actions";

export const metadata: Metadata = { title: "Codebusters" };

function fmt(ms: number | null) {
  if (ms === null) return "—";
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const FAMILY_COLOR: Record<string, string> = {
  Substitution: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  Polybius: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
  Transposition: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  Polyalphabetic: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
  Other: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
};

export default async function CodebustersHub() {
  const user = await requireUser();
  const [stats, recent] = await Promise.all([getUserStats(user.id), recentAttempts(user.id, 8)]);
  const rec = stats.recommended ? cipherInfo(stats.recommended) : null;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-brand-600">Division C · 2026–27</p>
          <h1 className="text-3xl font-bold tracking-tight">Codebusters</h1>
          <blockquote className="max-w-2xl text-zinc-700 dark:text-zinc-300">
            “{EVENT_DESCRIPTION.text}”{" "}
            <a className="text-xs text-zinc-500 underline" href={EVENT_DESCRIPTION.source.url} target="_blank" rel="noreferrer">
              {EVENT_DESCRIPTION.source.label}
            </a>
          </blockquote>
          <Link href="/events/codebusters" className="inline-flex text-sm font-medium text-brand-600 hover:underline dark:text-brand-300">
            Read the full event guide →
          </Link>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Unlimited generated puzzles for every 2027 cipher, scored by tournament rules ({SCORING.freeErrors} free errors, then −
            {SCORING.penaltyPerError} each). Your progress saves to your account.
          </p>
        </div>
        <dl className="flex gap-6 text-sm">
          <div>
            <dt className="text-zinc-500">Solved</dt>
            <dd className="text-2xl font-bold tabular-nums">{stats.totalSolved}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Streak</dt>
            <dd className="text-2xl font-bold tabular-nums">{stats.streakDays}d</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Best timed</dt>
            <dd className="text-2xl font-bold tabular-nums">{fmt(stats.bestTimedMs)}</dd>
          </div>
        </dl>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <form action={startTimed} className="card flex flex-col gap-3 p-5">
          <h2 className="font-semibold">⏱ Timed question</h2>
          <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
            The test opener: an Aristocrat against the clock. Solve it in under 10 minutes for a bonus of {SCORING.timedBonusPerSecond} points
            per second left.
          </p>
          <button className="btn btn-primary self-start">Start the clock</button>
        </form>
        <div className="card flex flex-col gap-3 p-5">
          <h2 className="font-semibold">📝 Full mock test</h2>
          <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
            {SCORING.testMinutes} minutes with a tournament question mix, a timed question and special bonus questions.
          </p>
          <div className="flex flex-wrap gap-2">
            <form action={createTest.bind(null, "regional")}>
              <button className="btn btn-primary">Regional</button>
            </form>
            <form action={createTest.bind(null, "state")}>
              <button className="btn btn-secondary">State / Nationals</button>
            </form>
            <Link href="/codebusters/test" className="btn btn-ghost">
              Past tests
            </Link>
          </div>
        </div>
        <div className="card flex flex-col gap-3 p-5">
          <h2 className="font-semibold">🎯 Recommended next</h2>
          {rec ? (
            <>
              <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                <b className="text-zinc-900 dark:text-zinc-100">{rec.name}</b>:{" "}
                {stats.byType[rec.type].attempts === 0
                  ? "you haven't tried this one yet."
                  : `your weakest cipher (${Math.round((stats.byType[rec.type].accuracy ?? 0) * 100)}% solved).`}
              </p>
              <Link href={`/codebusters/practice/${rec.type}`} className="btn btn-primary self-start">
                Practice {rec.name}
              </Link>
            </>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Ciphers</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CIPHERS.map((c) => {
            const s = stats.byType[c.type];
            const pct = s.accuracy === null ? null : Math.round(s.accuracy * 100);
            return (
              <div key={c.type} className="card flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  <span className={`chip ${FAMILY_COLOR[c.family]}`}>{c.family}</span>
                </div>
                <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">{c.blurb}</p>
                <div className="space-y-1.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct ?? 0}%` }} />
                  </div>
                  <p className="flex justify-between text-xs text-zinc-500">
                    <span>{s.attempts ? `${s.solved}/${s.attempts} solved` : "Not started"}</span>
                    <span>median {fmt(s.medianMs)} · best {fmt(s.bestMs)}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/codebusters/practice/${c.type}`} className="btn btn-primary flex-1">
                    Practice
                  </Link>
                  <Link href={`/codebusters/learn/${c.type}`} className="btn btn-secondary">
                    Learn
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Recent activity</h2>
          <div className="card divide-y divide-zinc-100 dark:divide-zinc-800">
            {recent.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <span className="w-40 font-medium">{isCipherType(a.cipherType) ? cipherInfo(a.cipherType).name : a.cipherType}</span>
                <span className="chip bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{a.kind}</span>
                <span
                  className={
                    a.status === "solved" ? "text-emerald-600" : a.status === "skipped" ? "text-zinc-400" : "text-red-600"
                  }
                >
                  {a.status}
                </span>
                <span className="ml-auto tabular-nums text-zinc-500">
                  {a.score ?? 0}/{a.points} pts · {fmt(a.kind === "test" ? null : a.elapsedMs)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
