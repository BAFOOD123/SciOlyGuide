import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { SCORING } from "@sciolyguide/codebusters";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { createTest } from "../actions";

export const metadata: Metadata = { title: "Mock tests" };

export default async function TestsPage() {
  const user = await requireUser();
  const tests = await db.select().from(schema.tests).where(eq(schema.tests.userId, user.id)).orderBy(desc(schema.tests.startedAt)).limit(30);
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <nav className="text-sm text-zinc-500">
          <Link href="/codebusters" className="hover:underline">
            Codebusters
          </Link>{" "}
          / Mock tests
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">Mock tests</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          A full {SCORING.testMinutes}-minute Division C test. Question 1 is the timed Aristocrat, three questions are marked ★ special bonus,
          and the mix follows what the 2027 rules allow at each level. Answers save as you go, and the test submits itself when time runs out.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {(["regional", "state"] as const).map((lvl) => (
          <form key={lvl} action={createTest.bind(null, lvl)} className="card space-y-3 p-5">
            <h2 className="font-semibold">{lvl === "regional" ? "Regional / Invitational" : "State / Nationals"}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {lvl === "regional"
                ? "About 14–15 questions. Porta and Nihilist are decode-only, and Homophonic is cryptanalysis."
                : "About 19–20 questions, with more Xenocrypts and cryptanalysis versions of Porta, Nihilist and Checkerboard."}
            </p>
            <button className="btn btn-primary">Start {lvl === "regional" ? "Regional" : "State"} test</button>
          </form>
        ))}
      </div>
      {tests.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Your tests</h2>
          <div className="card divide-y divide-zinc-100 dark:divide-zinc-800">
            {tests.map((t) => (
              <Link key={t.id} href={`/codebusters/test/${t.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <span className="w-44">{t.startedAt.toLocaleString()}</span>
                <span className="chip bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{t.level}</span>
                <span className="ml-auto font-semibold tabular-nums">{t.finishedAt ? `${t.score} pts` : "In progress →"}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
