import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { SCORING, generate, timedBonus } from "@sciolyguide/codebusters";
import { requireUser } from "@/lib/auth";
import { parseResponse, parseSpec, toPublic } from "@/lib/codebusters";
import { db, schema } from "@/lib/db";
import { TimedClient } from "@/components/codebusters/TimedClient";
import { startTimed } from "../actions";

export const metadata: Metadata = { title: "Timed question" };

const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.round(ms / 1000) % 60).padStart(2, "0")}`;

export default async function TimedPage() {
  const user = await requireUser();
  const [active] = await db
    .select()
    .from(schema.attempts)
    .where(and(eq(schema.attempts.userId, user.id), eq(schema.attempts.kind, "timed"), eq(schema.attempts.status, "active")))
    .orderBy(desc(schema.attempts.startedAt))
    .limit(1);

  if (active) {
    const puzzle = generate(parseSpec(active.spec));
    return (
      <div className="space-y-4">
        <nav className="text-sm text-zinc-500">
          <Link href="/codebusters" className="hover:underline">
            Codebusters
          </Link>{" "}
          / Timed question
        </nav>
        <TimedClient
          key={active.id}
          puzzle={toPublic(puzzle)}
          startedAt={active.startedAt.getTime()}
          attempt={{
            id: active.id,
            status: active.status,
            response: parseResponse(active.response),
            notes: JSON.parse(active.notes ?? "{}"),
            elapsedMs: 0,
            checks: active.checks,
            hints: 0,
            hinted: [],
            score: null,
            errors: null,
          }}
        />
      </div>
    );
  }

  const history = await db
    .select()
    .from(schema.attempts)
    .where(and(eq(schema.attempts.userId, user.id), eq(schema.attempts.kind, "timed"), eq(schema.attempts.status, "solved")))
    .orderBy(desc(schema.attempts.finishedAt))
    .limit(10);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card space-y-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Timed question</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Every Codebusters test opens with a timed Aristocrat. The clock stops when your answer has at most {SCORING.freeErrors} errors. Each
          second under {SCORING.timedLimitSeconds / 60} minutes is worth {SCORING.timedBonusPerSecond} bonus points.
        </p>
        <form action={startTimed}>
          <button className="btn btn-primary px-6 py-3 text-base">Start the clock</button>
        </form>
      </div>
      {history.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-3 font-semibold">Your recent solves</h2>
          <ul className="space-y-1 text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex justify-between tabular-nums">
                <span>{h.finishedAt?.toLocaleDateString()}</span>
                <span>
                  {fmt(h.elapsedMs)} · bonus {timedBonus(h.elapsedMs / 1000)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
