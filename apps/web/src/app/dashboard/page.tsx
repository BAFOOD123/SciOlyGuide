import type { Metadata } from "next";
import Link from "next/link";
import { cipherInfo } from "@sciolyguide/codebusters";
import { requireUser } from "@/lib/auth";
import { getUserStats } from "@/lib/codebusters";
import { DIV_C_EVENTS } from "@/lib/events";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const user = await requireUser();
  const stats = await getUserStats(user.id);
  const rec = stats.recommended ? cipherInfo(stats.recommended) : null;
  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Hi, {user.displayName} 👋</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {stats.totalAttempts === 0
            ? "Start with Codebusters. Every puzzle is generated fresh and your progress saves to your account."
            : `You've solved ${stats.totalSolved} puzzle${stats.totalSolved === 1 ? "" : "s"}${stats.streakDays ? `, and you're on a ${stats.streakDays}-day streak` : ""}.`}
        </p>
      </header>

      <Link href="/codebusters" className="card group block overflow-hidden p-0">
        <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <span className="chip bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">Live</span>
            <h2 className="text-2xl font-bold group-hover:text-brand-600">Codebusters →</h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              All 11 Division C cipher types for 2027, plus a timed question and full mock tests.
              {rec && (
                <>
                  {" "}
                  Next up: <b className="text-zinc-900 dark:text-zinc-100">{rec.name}</b>.
                </>
              )}
            </p>
          </div>
          <dl className="flex gap-6 self-center text-sm">
            <div>
              <dt className="text-zinc-500">Solved</dt>
              <dd className="text-2xl font-bold tabular-nums">{stats.totalSolved}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Accuracy</dt>
              <dd className="text-2xl font-bold tabular-nums">
                {stats.totalAttempts ? `${Math.round((stats.totalSolved / stats.totalAttempts) * 100)}%` : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </Link>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold">All Division C events</h2>
          <span className="text-sm text-zinc-500">grouped by conflict block</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DIV_C_EVENTS.map((e) => {
            const body = (
              <>
                <span className="grid size-8 place-items-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {e.block}
                </span>
                <span className="flex-1 font-medium">{e.name}</span>
                {e.live ? (
                  <span className="chip bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">Live</span>
                ) : (
                  <span className="chip bg-zinc-100 text-zinc-500 dark:bg-zinc-800">Soon</span>
                )}
              </>
            );
            return e.live ? (
              <Link key={e.slug} href={`/${e.slug}`} className="card flex items-center gap-3 px-4 py-3 hover:border-brand-400">
                {body}
              </Link>
            ) : (
              <div key={e.slug} className="card flex items-center gap-3 px-4 py-3 opacity-70">
                {body}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
