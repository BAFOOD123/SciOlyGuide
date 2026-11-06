import type { AnatomyStats, System } from "@/lib/anatomy-questions";

const SYSTEM_BAR: Record<System, string> = {
  Respiratory: "bg-sky-500",
  Digestive: "bg-amber-500",
  Immune: "bg-emerald-500",
};

const pct = (c: number, n: number) => (n ? Math.round((c / n) * 100) : 0);

function fmtDate(ms: number): string {
  try {
    return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
      <p className="text-2xl font-bold tabular-nums leading-7">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

/** A compact progress dashboard for Anatomy, shared by the app hub and the demo. */
export function AnatomyProgress({ stats }: { stats: AnatomyStats }) {
  if (!stats.answered) return null;
  const accuracy = Math.round(stats.accuracy * 100);

  return (
    <section className="card space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your progress</h2>
        <span className="text-xs text-zinc-500">{stats.runs} quiz{stats.runs === 1 ? "" : "zes"} completed</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile value={String(stats.answered)} label="questions answered" />
        <Tile value={`${accuracy}%`} label="correct overall" />
        <Tile value={stats.bestTestPct == null ? "—" : `${stats.bestTestPct}%`} label="best timed test" />
        <Tile value={stats.streakDays > 0 ? `${stats.streakDays}d` : "—"} label="day streak" />
      </div>

      {/* Accuracy by system */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Accuracy by system</p>
        {stats.bySystem.map((s) => {
          const p = pct(s.correct, s.answered);
          return (
            <div key={s.system} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-zinc-600 dark:text-zinc-400">{s.system}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800" aria-hidden>
                <div className={`h-full rounded-full ${SYSTEM_BAR[s.system]}`} style={{ width: `${p}%` }} />
              </div>
              <span className="w-20 shrink-0 text-right tabular-nums text-zinc-500">
                {s.answered ? `${p}% · ${s.answered}` : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {stats.weakestTopics.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Focus next</p>
          <div className="flex flex-wrap gap-1.5">
            {stats.weakestTopics.map((t) => (
              <span key={t.topic} className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-100">
                {t.label} · {pct(t.correct, t.answered)}%
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.recent.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recent</p>
          <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {stats.recent.map((r, i) => (
              <li key={i} className="flex items-center justify-between py-1.5">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {r.mode === "test" ? "Timed test" : "Practice"} · {fmtDate(r.finishedAt)}
                </span>
                <span className="font-semibold tabular-nums">
                  {r.score}/{r.total} <span className="font-normal text-zinc-500">({pct(r.score, r.total)}%)</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
