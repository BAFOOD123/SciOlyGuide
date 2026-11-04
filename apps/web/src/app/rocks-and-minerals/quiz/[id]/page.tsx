import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getOwnedSession, sessionView } from "@/lib/rocks";
import { QuizReview, QuizRunner } from "@/components/rocks/QuizRunner";
import { finishRm } from "../../actions";

export const metadata: Metadata = { title: "Rocks and Minerals quiz" };

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const s = await getOwnedSession(user.id, id);
  if (!s) notFound();
  // A timed station test whose time ran out while away gets graded now.
  if (!s.finishedAt && s.endsAt && Date.now() > s.endsAt.getTime() + 15_000) await finishRm(id);
  const view = sessionView(s);
  return (
    <div className="space-y-4">
      <nav className="mx-auto max-w-3xl text-sm text-zinc-500">
        <Link href="/rocks-and-minerals" className="hover:underline">
          Rocks and Minerals
        </Link>{" "}
        / <span className="text-zinc-800 dark:text-zinc-200">{view.mode === "stations" ? "Station test" : "Practice"}</span>
      </nav>
      {view.finished ? <QuizReview view={view} score={s.score ?? 0} /> : <QuizRunner key={id} view={view} />}
    </div>
  );
}
