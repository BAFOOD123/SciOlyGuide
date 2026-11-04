"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { QResponse } from "@sciolyguide/rocks-minerals";
import { answerRm, finishRm } from "@/app/rocks-and-minerals/actions";
import type { Feedback, SessionView } from "@/lib/rocks-types";
import { ConfirmButton } from "@/components/codebusters/common";
import { QuestionView, hasAnswer } from "./QuestionView";

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function QuizRunner({ view }: { view: SessionView }) {
  return view.mode === "practice" ? <Practice view={view} /> : <Stations view={view} />;
}

/* --------------------------------- Practice --------------------------------- */

function Practice({ view }: { view: SessionView }) {
  const firstOpen = view.feedback.findIndex((f) => !f);
  const [index, setIndex] = useState(firstOpen < 0 ? view.questions.length - 1 : firstOpen);
  const [responses, setResponses] = useState(view.responses);
  const [feedback, setFeedback] = useState<(Feedback | null)[]>(view.feedback);
  const [pending, startTransition] = useTransition();
  const q = view.questions[index]!;
  const r = responses[index] ?? null;
  const fb = feedback[index];
  const done = feedback.filter(Boolean).length;
  const correct = feedback.filter((f) => f?.correct).length;
  const last = index === view.questions.length - 1;

  const submit = () =>
    startTransition(async () => {
      const resp = r ?? (q.kind === "order" ? { order: q.items!.map((_, i) => i) } : null);
      if (!resp) return;
      setResponses((rs) => rs.map((x, i) => (i === index ? resp : x)));
      const res = await answerRm(view.id, index, resp);
      if (res.feedback) setFeedback((fs) => fs.map((x, i) => (i === index ? res.feedback! : x)));
    });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="font-semibold">
          Question {index + 1} of {view.questions.length}
        </span>
        <div className="h-2 min-w-32 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800" aria-hidden>
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(done / view.questions.length) * 100}%` }} />
        </div>
        <span className="tabular-nums text-zinc-500">
          {correct}/{done} correct
        </span>
      </div>
      <div className="card space-y-5 p-5 sm:p-6">
        <QuestionView
          key={index}
          q={q}
          index={index}
          response={r}
          onChange={(nr) => setResponses((rs) => rs.map((x, i) => (i === index ? nr : x)))}
          disabled={!!fb || pending}
          feedback={fb}
        />
        <div className="flex flex-wrap gap-2">
          {!fb ? (
            <button className="btn btn-primary" onClick={submit} disabled={pending || (q.kind !== "order" && !hasAnswer(q, r))}>
              Check
            </button>
          ) : last ? (
            <form action={finishRm.bind(null, view.id)}>
              <button className="btn btn-primary">See results →</button>
            </form>
          ) : (
            <button className="btn btn-primary" onClick={() => setIndex((i) => i + 1)}>
              Next question →
            </button>
          )}
          {index > 0 && (
            <button className="btn btn-ghost" onClick={() => setIndex((i) => i - 1)}>
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Stations --------------------------------- */

function Stations({ view }: { view: SessionView }) {
  const timed = !!view.stationSeconds;
  const per = (view.stationSeconds ?? 0) * 1000;
  const [now, setNow] = useState(() => Date.now());
  const [manual, setManual] = useState(() => {
    // Untimed: resume at the first station with an unanswered question.
    const firstOpen = view.questions.findIndex((q, i) => !hasAnswer(q, view.responses[i] ?? null));
    return firstOpen < 0 ? view.stationCount - 1 : view.stationOf[firstOpen]!;
  });
  const [responses, setResponses] = useState(view.responses);
  const [pending, startTransition] = useTransition();
  const finished = useRef(false);
  const saveTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const unsaved = useRef(new Map<number, QResponse>());

  useEffect(() => {
    if (!timed) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [timed]);

  const station = timed ? Math.floor((now - view.startedAt) / per) : manual;
  const remaining = timed ? per - ((now - view.startedAt) % per) : 0;

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    startTransition(async () => {
      // Flush any answer still waiting on its debounce before grading.
      for (const t of saveTimers.current.values()) clearTimeout(t);
      await Promise.all([...unsaved.current].map(([i, r]) => answerRm(view.id, i, r)));
      unsaved.current.clear();
      await finishRm(view.id);
    });
  }, [view.id]);

  useEffect(() => {
    if (timed && station >= view.stationCount) finish();
  }, [timed, station, view.stationCount, finish]);

  const setAnswer = (i: number, r: QResponse) => {
    setResponses((rs) => rs.map((x, j) => (j === i ? r : x)));
    const prev = saveTimers.current.get(i);
    if (prev) clearTimeout(prev);
    unsaved.current.set(i, r);
    saveTimers.current.set(
      i,
      setTimeout(() => {
        unsaved.current.delete(i);
        void answerRm(view.id, i, r);
      }, r.text !== undefined ? 600 : 0),
    );
  };

  if (station >= view.stationCount) return <p className="text-center text-zinc-500">Time is up. Grading your test…</p>;
  const qIdx = view.questions.map((_, i) => i).filter((i) => view.stationOf[i] === station);
  const answered = responses.filter((r, i) => hasAnswer(view.questions[i]!, r)).length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="card sticky top-16 z-30 flex flex-wrap items-center gap-4 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Station</p>
          <p className="text-2xl font-bold tabular-nums">
            {station + 1}
            <span className="text-base font-medium text-zinc-500"> / {view.stationCount}</span>
          </p>
        </div>
        {timed && (
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Rotate in</p>
            <p className={`font-mono text-2xl font-bold tabular-nums ${remaining < 15_000 ? "text-red-600 dark:text-red-400" : ""}`}>{fmt(remaining)}</p>
          </div>
        )}
        <p className="text-sm text-zinc-500">{answered} answered</p>
        <div className="ml-auto flex gap-2">
          {!timed && station < view.stationCount - 1 && (
            <button className="btn btn-secondary" onClick={() => setManual((m) => m + 1)}>
              Next station →
            </button>
          )}
          <ConfirmButton className="btn btn-primary" disabled={pending} onConfirm={finish} confirmLabel="Click again to finish">
            Finish test
          </ConfirmButton>
        </div>
      </div>
      <div className="card space-y-8 p-5 sm:p-6">
        <p className="text-sm text-zinc-500">
          {timed ? "Stations rotate automatically, as at a tournament. You can't go back." : "Untimed: move on when you're ready."} Answers save as you
          pick them.
        </p>
        {qIdx.map((i) => (
          <QuestionView key={i} q={view.questions[i]!} index={i} response={responses[i] ?? null} onChange={(r) => setAnswer(i, r)} disabled={pending} />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- Review ---------------------------------- */

export function QuizReview({ view, score }: { view: SessionView; score: number }) {
  const total = view.questions.length;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card flex flex-wrap items-end gap-6 p-6">
        <div>
          <p className="text-sm text-zinc-500">{view.mode === "stations" ? `Station test · ${view.stationCount} stations` : "Practice set"}</p>
          <p className="text-5xl font-bold tabular-nums">
            {score}
            <span className="text-2xl text-zinc-500">/{total}</span>
          </p>
        </div>
        <p className="text-lg font-semibold">{Math.round((score / Math.max(1, total)) * 100)}%</p>
        <div className="ml-auto flex flex-wrap gap-2">
          <Link href="/rocks-and-minerals" className="btn btn-primary">
            Back to Rocks and Minerals
          </Link>
        </div>
      </div>
      <ol className="space-y-4">
        {view.questions.map((q, i) => (
          <li key={i} className="card space-y-2 p-5">
            {view.mode === "stations" && <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Station {view.stationOf[i]! + 1}</p>}
            <QuestionView q={q} index={i} response={view.responses[i] ?? null} onChange={() => {}} disabled feedback={view.feedback[i]} />
          </li>
        ))}
      </ol>
    </div>
  );
}
