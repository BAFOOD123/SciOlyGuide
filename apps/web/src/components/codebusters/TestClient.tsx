"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Response } from "@sciolyguide/codebusters";
import { checkTimedInTest, saveProgress, submitTest } from "@/app/codebusters/actions";
import type { PublicPuzzle, Reveal, ToolNotes } from "@/lib/codebusters-types";
import { PuzzleHeader, RevealPanel, SaveIndicator, ToolsPanel, formatMs, useAssistPref, type SaveStatus } from "./common";
import { annotatorFor } from "./tools";
import { FinalAnswer, Workspace } from "./Workspace";

export interface TestQuestion {
  attemptId: string;
  puzzle: PublicPuzzle;
  response: Response;
  notes: ToolNotes;
  special: boolean;
}

interface Props {
  testId: string;
  endsAt: number;
  questions: TestQuestion[];
  timed: { seconds: number; bonus: number } | null;
}

function progress(q: TestQuestion, r: Response): number {
  if (q.puzzle.answer.kind !== "plaintext") return (r.final ?? "").length ? 1 : 0;
  return r.plain.filter(Boolean).length / Math.max(1, q.puzzle.answer.length);
}

export function TestClient({ testId, endsAt, questions, timed: timedInit }: Props) {
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState(() => questions.map((q) => q.response));
  const [notes, setNotes] = useState(() => questions.map((q) => q.notes));
  const [assist, setAssist] = useAssistPref();
  const [timed, setTimed] = useState(timedInit);
  const [timedMsg, setTimedMsg] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [status, setStatusState] = useState<SaveStatus>("saved");
  const statusRef = useRef<SaveStatus>("saved");
  const setStatus = useCallback((st: SaveStatus) => {
    if (statusRef.current !== st) {
      statusRef.current = st;
      setStatusState(st);
    }
  }, []);
  const [pending, startTransition] = useTransition();
  const dirty = useRef(new Set<number>());
  const latest = useRef({ responses, notes });
  latest.current = { responses, notes };
  const submitted = useRef(false);

  const q = questions[current]!;
  const remaining = endsAt - now;

  const flush = useCallback(async () => {
    const ids = [...dirty.current];
    if (!ids.length) return;
    dirty.current.clear();
    setStatus("saving");
    try {
      await Promise.all(
        ids.map((i) => saveProgress(questions[i]!.attemptId, latest.current.responses[i]!, 0, latest.current.notes[i])),
      );
      setStatus(dirty.current.size ? "dirty" : "saved");
    } catch {
      ids.forEach((i) => dirty.current.add(i));
      setStatus("offline");
    }
  }, [questions, setStatus]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    const save = setInterval(() => void flush(), 2000);
    const onHide = () => document.visibilityState === "hidden" && void flush();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      clearInterval(id);
      clearInterval(save);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [flush]);

  const submit = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    startTransition(async () => {
      await flush();
      await submitTest(testId);
    });
  }, [flush, testId]);

  useEffect(() => {
    if (remaining <= 0) submit();
  }, [remaining, submit]);

  const setResponse = (r: Response) => {
    dirty.current.add(current);
    setStatus("dirty");
    setResponses((rs) => rs.map((x, i) => (i === current ? r : x)));
  };
  const setNote = (key: string, value: unknown) => {
    dirty.current.add(current);
    setNotes((ns) => ns.map((x, i) => (i === current ? { ...x, [key]: value } : x)));
  };

  const annotate = useMemo(() => annotatorFor(q.puzzle, notes[current]!, assist), [q.puzzle, notes, current, assist]);
  const ctx = { puzzle: q.puzzle, response: responses[current]!, onChange: setResponse, notes: notes[current]!, setNote };

  const checkTimed = () =>
    startTransition(async () => {
      await flush();
      const r = await checkTimedInTest(testId, responses[0]!);
      if (r.solved && r.seconds !== undefined) {
        setTimed({ seconds: r.seconds, bonus: r.bonus ?? 0 });
        setTimedMsg(null);
      } else setTimedMsg(`${r.errors} errors. Keep going.`);
    });

  return (
    <div className="space-y-4">
      <div className="card sticky top-16 z-30 flex flex-wrap items-center gap-4 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Time left</p>
          <p className={`font-mono text-2xl font-bold tabular-nums ${remaining < 5 * 60_000 ? "text-red-600" : ""}`}>{formatMs(remaining)}</p>
        </div>
        <div className="text-sm">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Timed question</p>
          <p className="font-medium">{timed ? `✓ ${formatMs(timed.seconds * 1000)} · +${timed.bonus}` : "Not solved yet"}</p>
        </div>
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm select-none">
          <input type="checkbox" className="accent-brand-600" checked={assist} onChange={(e) => setAssist(e.target.checked)} />
          Assist mode
        </label>
        <SaveIndicator status={status} />
        <button
          className="btn btn-primary"
          disabled={pending}
          onClick={() => confirm("Submit your test for grading? You can't change answers afterwards.") && submit()}
        >
          Submit test
        </button>
      </div>

      <nav aria-label="Questions" className="flex flex-wrap gap-1.5">
        {questions.map((qq, i) => {
          const p = progress(qq, responses[i]!);
          return (
            <button
              key={qq.attemptId}
              onClick={() => {
                void flush();
                setCurrent(i);
              }}
              className={`relative h-10 min-w-10 overflow-hidden rounded-lg border px-2 text-sm font-semibold ${
                i === current ? "border-brand-600 ring-2 ring-brand-500/30" : "border-zinc-300 dark:border-zinc-700"
              }`}
              title={`${qq.puzzle.title} (${qq.puzzle.points} pts)`}
            >
              <span className="absolute inset-x-0 bottom-0 bg-brand-500/20" style={{ height: `${p * 100}%` }} />
              <span className="relative">
                {i + 1}
                {qq.special && <span className="text-amber-500">★</span>}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="space-y-6">
        <div key={q.attemptId} className="card min-w-0 space-y-6 p-5 sm:p-6">
          <PuzzleHeader puzzle={q.puzzle} index={current} special={q.special} />
          <div className="pb-4">
            <Workspace puzzle={q.puzzle} response={responses[current]!} onChange={setResponse} assist={assist} annotate={annotate} />
          </div>
          <FinalAnswer puzzle={q.puzzle} response={responses[current]!} onChange={setResponse} />
          {current === 0 && !timed && (
            <div className="flex flex-wrap items-center gap-3">
              <button className="btn btn-secondary" onClick={checkTimed} disabled={pending}>
                Check timed question
              </button>
              {timedMsg && <span className="text-sm text-amber-700 dark:text-amber-300">{timedMsg}</span>}
            </div>
          )}
          <div className="flex justify-between">
            <button className="btn btn-ghost" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
              ← Previous
            </button>
            <button className="btn btn-ghost" disabled={current === questions.length - 1} onClick={() => setCurrent((c) => c + 1)}>
              Next →
            </button>
          </div>
        </div>
        <ToolsPanel ctx={ctx} assist={assist} />
      </div>
    </div>
  );
}

export interface ReviewQuestion {
  puzzle: PublicPuzzle;
  response: Response;
  reveal: Reveal;
  score: number;
  errors: number;
  special: boolean;
}

export function TestReview({ questions }: { questions: ReviewQuestion[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="card divide-y divide-zinc-100 dark:divide-zinc-800">
      {questions.map((q, i) => (
        <div key={i}>
          <button className="flex w-full flex-wrap items-center gap-3 px-5 py-3 text-left text-sm" onClick={() => setOpen(open === i ? null : i)}>
            <span className="w-8 font-semibold">Q{i + 1}</span>
            <span className="min-w-40 flex-1 font-medium">
              {q.puzzle.title} {q.special && <span className="text-amber-500">★</span>}
            </span>
            <span className={q.errors <= q.puzzle.answer.freeErrors ? "text-emerald-600" : "text-red-600"}>{q.errors} errors</span>
            <span className="w-24 text-right font-semibold tabular-nums">
              {q.score}/{q.puzzle.points}
            </span>
            <span className="text-zinc-400">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <div className="space-y-5 px-5 pb-6">
              <PuzzleHeader puzzle={q.puzzle} index={i} special={q.special} />
              <div className="pb-4">
                <Workspace
                  puzzle={q.puzzle}
                  response={q.response}
                  onChange={() => {}}
                  assist={false}
                  readOnly
                  wrong={new Set(q.reveal.wrong)}
                  expected={q.reveal.expected}
                />
              </div>
              <FinalAnswer puzzle={q.puzzle} response={q.response} onChange={() => {}} readOnly correct={q.reveal.expected.join("")} />
              <RevealPanel reveal={q.reveal} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
