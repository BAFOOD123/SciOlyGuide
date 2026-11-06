"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildQuiz,
  countForTopics,
  questionsForTopics,
  SYSTEMS,
  topicsBySystem,
  type QuizItem,
  type System,
} from "@/lib/anatomy-questions";
import { saveAnatomyRun } from "@/app/anatomy-physiology/actions";

type Mode = "practice" | "test";
type Stage = "setup" | "run" | "done";

const SYSTEM_ACCENT: Record<System, string> = {
  Respiratory: "text-sky-700 dark:text-sky-300",
  Digestive: "text-amber-700 dark:text-amber-300",
  Immune: "text-emerald-700 dark:text-emerald-300",
};

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function AnatomyQuiz({ initialMode = "practice" }: { initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [stage, setStage] = useState<Stage>("setup");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [count, setCount] = useState(mode === "test" ? 25 : 10);
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [picks, setPicks] = useState<(number | null)[]>([]);

  const available = useMemo(() => countForTopics([...selected]), [selected]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setCount(m === "test" ? 25 : 10);
  };

  const start = () => {
    const slugs = [...selected];
    const seed = (Date.now() >>> 0) || 1;
    const built = buildQuiz(slugs, count, seed);
    if (!built.length) return;
    setQuiz(built);
    setStage("run");
  };

  if (stage === "setup")
    return (
      <Setup
        mode={mode}
        onMode={switchMode}
        selected={selected}
        onSelected={setSelected}
        count={count}
        onCount={setCount}
        available={available}
        onStart={start}
      />
    );

  const finish = (finalPicks: (number | null)[]) => {
    setPicks(finalPicks);
    setStage("done");
    // Save the finished run to the account (fire-and-forget; scoring still shows locally).
    const items = quiz.map((it, idx) => ({ topic: it.topic, answered: finalPicks[idx] != null, correct: finalPicks[idx] === it.answer }));
    void saveAnatomyRun({ mode, items }).catch(() => {});
  };

  if (stage === "run")
    return mode === "practice" ? (
      <PracticeRun quiz={quiz} onDone={finish} onExit={() => setStage("setup")} />
    ) : (
      <TestRun quiz={quiz} onDone={finish} onExit={() => setStage("setup")} />
    );

  return <Review mode={mode} quiz={quiz} picks={picks} onAgain={() => setStage("setup")} />;
}

/* ----------------------------------- Setup ---------------------------------- */

function Setup({
  mode,
  onMode,
  selected,
  onSelected,
  count,
  onCount,
  available,
  onStart,
}: {
  mode: Mode;
  onMode: (m: Mode) => void;
  selected: Set<string>;
  onSelected: (s: Set<string>) => void;
  count: number;
  onCount: (n: number) => void;
  available: number;
  onStart: () => void;
}) {
  const toggle = (slug: string) => {
    const next = new Set(selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onSelected(next);
  };
  const toggleSystem = (system: System) => {
    const slugs = topicsBySystem(system).map((t) => t.slug);
    const allOn = slugs.every((s) => selected.has(s));
    const next = new Set(selected);
    for (const s of slugs) (allOn ? next.delete(s) : next.add(s));
    onSelected(next);
  };

  const total = available; // questions matching current selection (all if none picked)
  const countOptions = mode === "test" ? [20, 25, 40] : [10, 15, 20];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Mode toggle */}
      <div className="card space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Set up your {mode === "test" ? "timed test" : "practice set"}</h2>
          <div className="inline-flex overflow-hidden rounded-lg border border-zinc-300 text-sm dark:border-zinc-700">
            <button type="button" onClick={() => onMode("practice")} aria-pressed={mode === "practice"} className={`px-3 py-1.5 ${mode === "practice" ? "bg-brand-600 text-white" : ""}`}>
              Practice
            </button>
            <button type="button" onClick={() => onMode("test")} aria-pressed={mode === "test"} className={`px-3 py-1.5 ${mode === "test" ? "bg-brand-600 text-white" : ""}`}>
              Timed test
            </button>
          </div>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {mode === "practice"
            ? "Pick the topics you want to drill. You'll see whether each answer is right, with an explanation, as you go."
            : "A mixed, timed test like a tournament station round. No feedback until you finish, then a full review."}
        </p>
      </div>

      {/* Topic picker */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Choose topics</h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-zinc-500">
              {selected.size ? `${selected.size} selected` : "All topics"} · {total} questions
            </span>
            {selected.size > 0 && (
              <button type="button" onClick={() => onSelected(new Set())} className="text-brand-600 hover:underline dark:text-brand-300">
                Clear
              </button>
            )}
          </div>
        </div>

        {SYSTEMS.map((system) => {
          const topics = topicsBySystem(system);
          const slugs = topics.map((t) => t.slug);
          const allOn = slugs.every((s) => selected.has(s));
          const someOn = slugs.some((s) => selected.has(s));
          return (
            <div key={system} className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className={`font-semibold ${SYSTEM_ACCENT[system]}`}>{system} system</h4>
                <button
                  type="button"
                  onClick={() => toggleSystem(system)}
                  className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300"
                >
                  {allOn ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {topics.map((t) => {
                  const on = selected.has(t.slug);
                  const n = questionsForTopics([t.slug]).length;
                  return (
                    <label
                      key={t.slug}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition ${
                        on ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40" : "border-zinc-300 hover:border-brand-400 dark:border-zinc-700"
                      }`}
                    >
                      <input type="checkbox" checked={on} onChange={() => toggle(t.slug)} className="size-4 accent-brand-600" />
                      <span className="flex-1">{t.label}</span>
                      <span className="text-xs text-zinc-400">{n}</span>
                    </label>
                  );
                })}
              </div>
              {someOn && !allOn && <p className="mt-2 text-xs text-zinc-400">Some topics selected</p>}
            </div>
          );
        })}
      </div>

      {/* Count + start */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Questions:</span>
          <div className="inline-flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
            {countOptions.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onCount(n)}
                aria-pressed={count === n}
                className={`px-3 py-1.5 ${count === n ? "bg-brand-600 text-white" : ""}`}
              >
                {n}
              </button>
            ))}
          </div>
          {count > total && <span className="text-xs text-amber-700 dark:text-amber-400">Only {total} available — you'll get {total}.</span>}
          {mode === "test" && <span className="text-xs text-zinc-400">· ~45 s each</span>}
        </div>
        <button type="button" className="btn btn-primary" onClick={onStart} disabled={total === 0}>
          {mode === "test" ? "Start timed test →" : "Start practice →"}
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- Practice --------------------------------- */

function PracticeRun({ quiz, onDone, onExit }: { quiz: QuizItem[]; onDone: (picks: (number | null)[]) => void; onExit: () => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>(() => quiz.map(() => null));
  const [checked, setChecked] = useState<boolean[]>(() => quiz.map(() => false));
  const q = quiz[i]!;
  const sel = picked[i];
  const isChecked = checked[i];
  const answeredCount = checked.filter(Boolean).length;
  const correct = quiz.filter((qq, idx) => checked[idx] && picked[idx] === qq.answer).length;
  const last = i === quiz.length - 1;

  const choose = (c: number) => {
    if (isChecked) return;
    setPicked((p) => p.map((x, idx) => (idx === i ? c : x)));
  };
  const check = () => {
    if (sel == null) return;
    setChecked((c) => c.map((x, idx) => (idx === i ? true : x)));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="font-semibold">
          Question {i + 1} of {quiz.length}
        </span>
        <div className="h-2 min-w-32 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800" aria-hidden>
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(answeredCount / quiz.length) * 100}%` }} />
        </div>
        <span className="tabular-nums text-zinc-500">
          {correct}/{answeredCount} correct
        </span>
        <button type="button" onClick={onExit} className="text-zinc-500 hover:underline">
          Exit
        </button>
      </div>

      <div className="card space-y-5 p-5 sm:p-6">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${SYSTEM_ACCENT[q.system]}`}>{q.system}</p>
          <p className="mt-1 text-lg font-medium [text-wrap:pretty]">{q.prompt}</p>
        </div>

        <div className="grid gap-2">
          {q.choices.map((c, idx) => {
            const state = !isChecked
              ? idx === sel
                ? "picked"
                : "idle"
              : idx === q.answer
                ? "correct"
                : idx === sel
                  ? "wrong"
                  : "idle";
            return (
              <button
                key={idx}
                type="button"
                disabled={isChecked}
                onClick={() => choose(idx)}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                  state === "correct"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                    : state === "wrong"
                      ? "border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100"
                      : state === "picked"
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40"
                        : "border-zinc-300 hover:border-brand-400 dark:border-zinc-700"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {isChecked && (
          <div
            className={`rounded-xl px-3 py-2.5 text-sm ${
              sel === q.answer
                ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                : "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100"
            }`}
          >
            <p className="font-semibold">{sel === q.answer ? "Correct!" : `Answer: ${q.choices[q.answer]}`}</p>
            <p className="mt-0.5 text-zinc-600 dark:text-zinc-300">{q.explanation}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {!isChecked ? (
            <button className="btn btn-primary" onClick={check} disabled={sel == null}>
              Check
            </button>
          ) : last ? (
            <button className="btn btn-primary" onClick={() => onDone(picked)}>
              See results →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setI((x) => x + 1)}>
              Next question →
            </button>
          )}
          {i > 0 && (
            <button className="btn btn-ghost" onClick={() => setI((x) => x - 1)}>
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------- Test ----------------------------------- */

function TestRun({ quiz, onDone, onExit }: { quiz: QuizItem[]; onDone: (picks: (number | null)[]) => void; onExit: () => void }) {
  const totalMs = quiz.length * 45_000;
  const startedAt = useRef(Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>(() => quiz.map(() => null));
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onDone(picked);
  }, [onDone, picked]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const remaining = totalMs - (now - startedAt.current);
  useEffect(() => {
    if (remaining <= 0) finish();
  }, [remaining, finish]);

  const q = quiz[i]!;
  const sel = picked[i];
  const answered = picked.filter((p) => p != null).length;

  const choose = (c: number) => setPicked((p) => p.map((x, idx) => (idx === i ? c : x)));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="card sticky top-16 z-30 flex flex-wrap items-center gap-4 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Question</p>
          <p className="text-2xl font-bold tabular-nums">
            {i + 1}
            <span className="text-base font-medium text-zinc-500"> / {quiz.length}</span>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Time left</p>
          <p className={`font-mono text-2xl font-bold tabular-nums ${remaining < 60_000 ? "text-red-600 dark:text-red-400" : ""}`}>{fmt(remaining)}</p>
        </div>
        <p className="text-sm text-zinc-500">{answered} answered</p>
        <div className="ml-auto flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={onExit}>
            Quit
          </button>
          <button type="button" className="btn btn-primary" onClick={finish}>
            Finish test
          </button>
        </div>
      </div>

      <div className="card space-y-5 p-5 sm:p-6">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${SYSTEM_ACCENT[q.system]}`}>{q.system}</p>
          <p className="mt-1 text-lg font-medium [text-wrap:pretty]">{q.prompt}</p>
        </div>
        <div className="grid gap-2">
          {q.choices.map((c, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => choose(idx)}
              aria-pressed={idx === sel}
              className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                idx === sel ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40" : "border-zinc-300 hover:border-brand-400 dark:border-zinc-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn btn-primary" onClick={() => (i === quiz.length - 1 ? finish() : setI((x) => x + 1))}>
            {i === quiz.length - 1 ? "Finish test" : "Next →"}
          </button>
          {i > 0 && (
            <button className="btn btn-ghost" onClick={() => setI((x) => x - 1)}>
              ← Back
            </button>
          )}
          {sel != null && (
            <button className="btn btn-ghost ml-auto text-xs" onClick={() => setPicked((p) => p.map((x, idx) => (idx === i ? null : x)))}>
              Clear answer
            </button>
          )}
        </div>
      </div>

      {/* Quick jump grid */}
      <div className="flex flex-wrap gap-1.5">
        {quiz.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setI(idx)}
            className={`size-8 rounded-md border text-xs font-medium tabular-nums transition ${
              idx === i
                ? "border-brand-600 bg-brand-600 text-white"
                : picked[idx] != null
                  ? "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                  : "border-zinc-300 text-zinc-500 dark:border-zinc-700"
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- Review ---------------------------------- */

function Review({ mode, quiz, picks, onAgain }: { mode: Mode; quiz: QuizItem[]; picks: (number | null)[]; onAgain: () => void }) {
  const score = quiz.filter((q, idx) => picks[idx] === q.answer).length;
  const pct = Math.round((score / Math.max(1, quiz.length)) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card flex flex-wrap items-end gap-6 p-6">
        <div>
          <p className="text-sm text-zinc-500">{mode === "test" ? "Timed test" : "Practice set"} · {quiz.length} questions</p>
          <p className="text-5xl font-bold tabular-nums">
            {score}
            <span className="text-2xl text-zinc-500">/{quiz.length}</span>
          </p>
        </div>
        <p className="text-lg font-semibold">{pct}%</p>
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={onAgain}>
            New set
          </button>
          <Link href="/anatomy-physiology" className="btn btn-secondary">
            Back to Anatomy
          </Link>
        </div>
      </div>

      <ol className="space-y-4">
        {quiz.map((q, idx) => {
          const p = picks[idx];
          const right = p === q.answer;
          return (
            <li key={q.id} className="card space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium [text-wrap:pretty]">
                  <span className="mr-2 text-zinc-400">{idx + 1}.</span>
                  {q.prompt}
                </p>
                <span className={`chip shrink-0 ${right ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-100" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-100"}`}>
                  {right ? "Correct" : p == null ? "Skipped" : "Missed"}
                </span>
              </div>
              <div className="grid gap-1.5">
                {q.choices.map((c, ci) => {
                  const isAnswer = ci === q.answer;
                  const isPick = ci === p;
                  return (
                    <div
                      key={ci}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        isAnswer
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                          : isPick
                            ? "border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100"
                            : "border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {c}
                      {isAnswer && <span className="ml-2 text-xs font-semibold">✓ answer</span>}
                      {isPick && !isAnswer && <span className="ml-2 text-xs font-semibold">your pick</span>}
                    </div>
                  );
                })}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{q.explanation}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
