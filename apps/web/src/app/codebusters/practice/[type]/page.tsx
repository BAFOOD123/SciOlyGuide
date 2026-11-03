import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { cipherInfo, isCipherType, randomSeed, generate, type PuzzleSpec } from "@sciolyguide/codebusters";
import { newId, requireUser } from "@/lib/auth";
import { emptyResponse, parseResponse, parseSpec, toPublic } from "@/lib/codebusters";
import type { AttemptState } from "@/lib/codebusters-types";
import { db, schema } from "@/lib/db";
import { PracticeClient } from "@/components/codebusters/PracticeClient";

type Params = { params: Promise<{ type: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { type } = await params;
  return { title: isCipherType(type) ? `${cipherInfo(type).name} practice` : "Practice" };
}

export default async function PracticePage({ params }: Params) {
  const { type } = await params;
  if (!isCipherType(type)) notFound();
  const user = await requireUser();
  const info = cipherInfo(type);

  let [attempt] = await db
    .select()
    .from(schema.attempts)
    .where(
      and(
        eq(schema.attempts.userId, user.id),
        eq(schema.attempts.kind, "practice"),
        eq(schema.attempts.cipherType, type),
        eq(schema.attempts.status, "active"),
      ),
    )
    .orderBy(desc(schema.attempts.startedAt))
    .limit(1);

  if (!attempt) {
    // Reuse the settings of the last puzzle of this type, else the defaults.
    const [last] = await db
      .select({ spec: schema.attempts.spec })
      .from(schema.attempts)
      .where(and(eq(schema.attempts.userId, user.id), eq(schema.attempts.kind, "practice"), eq(schema.attempts.cipherType, type)))
      .orderBy(desc(schema.attempts.startedAt))
      .limit(1);
    const options = last ? parseSpec(last.spec).options : info.defaults;
    const spec: PuzzleSpec = { type, seed: randomSeed(), options };
    const puzzle = generate(spec);
    const now = new Date();
    const row = {
      id: newId(),
      userId: user.id,
      kind: "practice" as const,
      cipherType: type,
      spec: JSON.stringify(spec),
      status: "active" as const,
      response: JSON.stringify(emptyResponse(puzzle)),
      points: puzzle.points,
      startedAt: now,
      updatedAt: now,
    };
    await db.insert(schema.attempts).values(row);
    [attempt] = await db.select().from(schema.attempts).where(eq(schema.attempts.id, row.id));
  }

  const spec = parseSpec(attempt!.spec);
  const puzzle = generate(spec);
  const notes = JSON.parse(attempt!.notes ?? "{}") as Record<string, unknown> & { _hinted?: number[] };
  const state: AttemptState = {
    id: attempt!.id,
    status: attempt!.status,
    response: parseResponse(attempt!.response),
    notes,
    elapsedMs: attempt!.elapsedMs,
    checks: attempt!.checks,
    hints: attempt!.hints,
    hinted: notes._hinted ?? [],
    score: attempt!.score,
    errors: attempt!.errors,
  };

  return (
    <div className="space-y-4">
      <nav className="text-sm text-zinc-500">
        <Link href="/codebusters" className="hover:underline">
          Codebusters
        </Link>{" "}
        / <span className="text-zinc-800 dark:text-zinc-200">{info.name}</span>
      </nav>
      <PracticeClient key={state.id} puzzle={toPublic(puzzle)} attempt={state} info={info} options={{ ...info.defaults, ...spec.options }} />
    </div>
  );
}
