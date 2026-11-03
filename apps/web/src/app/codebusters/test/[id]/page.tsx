import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { generate, grade, specialBonus, timedBonus } from "@sciolyguide/codebusters";
import { requireUser } from "@/lib/auth";
import { parseResponse, parseSpec, revealOf, toPublic } from "@/lib/codebusters";
import { db, schema } from "@/lib/db";
import { TestClient, TestReview } from "@/components/codebusters/TestClient";
import { submitTest } from "../../actions";

export const metadata: Metadata = { title: "Mock test" };

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const [test] = await db
    .select()
    .from(schema.tests)
    .where(and(eq(schema.tests.id, id), eq(schema.tests.userId, user.id)));
  if (!test) notFound();
  const rows = await db.select().from(schema.attempts).where(eq(schema.attempts.testId, id)).orderBy(asc(schema.attempts.questionIndex));
  const specials = new Set(JSON.parse(test.specials) as number[]);
  const level = test.level === "state" ? "State / Nationals" : "Regional";

  // Time ran out while the student was away: grade it now.
  if (!test.finishedAt && Date.now() > test.endsAt.getTime() + 30_000) {
    await submitTest(id);
  }

  if (!test.finishedAt) {
    const questions = rows.map((a) => ({
      attemptId: a.id,
      puzzle: toPublic(generate(parseSpec(a.spec))),
      response: parseResponse(a.response),
      notes: JSON.parse(a.notes ?? "{}"),
      special: specials.has(a.questionIndex!),
    }));
    return (
      <div className="space-y-4">
        <nav className="text-sm text-zinc-500">
          <Link href="/codebusters" className="hover:underline">
            Codebusters
          </Link>{" "}
          / Mock test ({level})
        </nav>
        <TestClient
          testId={id}
          endsAt={test.endsAt.getTime()}
          questions={questions}
          timed={test.timedSeconds !== null ? { seconds: test.timedSeconds, bonus: timedBonus(test.timedSeconds) } : null}
        />
      </div>
    );
  }

  const review = rows.map((a) => {
    const puzzle = generate(parseSpec(a.spec));
    const response = parseResponse(a.response);
    const g = grade(puzzle, response);
    return {
      puzzle: toPublic(puzzle),
      response,
      reveal: revealOf(puzzle, g.wrong),
      score: g.score,
      errors: g.errors,
      special: specials.has(a.questionIndex!),
      penaltyFree: g.solved && g.penalty === 0,
    };
  });
  const base = review.reduce((s, q) => s + q.score, 0);
  const tBonus = test.timedSeconds !== null ? timedBonus(test.timedSeconds) : 0;
  const sBonus = specialBonus(review.filter((q) => q.special && q.penaltyFree).length);
  const solved = review.filter((q) => q.errors <= q.puzzle.answer.freeErrors).length;

  return (
    <div className="space-y-6">
      <nav className="text-sm text-zinc-500">
        <Link href="/codebusters" className="hover:underline">
          Codebusters
        </Link>{" "}
        /{" "}
        <Link href="/codebusters/test" className="hover:underline">
          Mock tests
        </Link>{" "}
        / Results
      </nav>
      <div className="card grid gap-6 p-6 sm:grid-cols-[auto_1fr]">
        <div>
          <p className="text-sm text-zinc-500">{level} mock test</p>
          <p className="text-5xl font-bold tabular-nums">{test.score}</p>
          <p className="text-sm text-zinc-500">points</p>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-zinc-500">Questions</dt>
            <dd className="text-xl font-semibold tabular-nums">{base}<span className="text-sm text-zinc-500"> / {test.maxScore}</span></dd>
          </div>
          <div>
            <dt className="text-zinc-500">Timed bonus</dt>
            <dd className="text-xl font-semibold tabular-nums">+{tBonus}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Special bonus</dt>
            <dd className="text-xl font-semibold tabular-nums">+{sBonus}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Solved</dt>
            <dd className="text-xl font-semibold tabular-nums">
              {solved}/{review.length}
            </dd>
          </div>
        </dl>
      </div>
      <TestReview questions={review} />
      <div className="flex gap-2">
        <Link href="/codebusters/test" className="btn btn-primary">
          Take another test
        </Link>
        <Link href="/codebusters" className="btn btn-secondary">
          Back to Codebusters
        </Link>
      </div>
    </div>
  );
}
