"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { SCORING, type Response } from "@sciolyguide/codebusters";
import { checkAnswer, revealAnswer, saveProgress, startTimed } from "@/app/codebusters/actions";
import type { AttemptState, CheckResult, PublicPuzzle, Reveal, ToolNotes } from "@/lib/codebusters-types";
import { ConfirmButton, PuzzleHeader, RevealPanel, SaveIndicator, ToolsPanel, formatMs, useAssistPref, useAutosave } from "./common";
import { Workspace } from "./Workspace";

export function TimedClient({ puzzle, attempt, startedAt }: { puzzle: PublicPuzzle; attempt: AttemptState; startedAt: number }) {
  const [response, setResponse] = useState<Response>(attempt.response);
  const [notes, setNotes] = useState<ToolNotes>(attempt.notes);
  const [assist, setAssist] = useAssistPref();
  const [result, setResult] = useState<CheckResult | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [pending, startTransition] = useTransition();
  const [now, setNow] = useState(() => Date.now());
  const done = !!result?.solved || !!reveal;

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [done]);

  const elapsed = done && result?.elapsedMs ? result.elapsedMs : now - startedAt;
  const remaining = SCORING.timedLimitSeconds * 1000 - elapsed;
  const save = useCallback((r: Response, n: ToolNotes) => saveProgress(attempt.id, r, 0, n), [attempt.id]);
  const { status, flush } = useAutosave(save, response, notes, !done);
  const setNote = useCallback((k: string, v: unknown) => setNotes((n) => ({ ...n, [k]: v })), []);
  const ctx = useMemo(() => ({ puzzle, response, onChange: setResponse, notes, setNote, readOnly: done }), [puzzle, response, notes, setNote, done]);

  const check = () =>
    startTransition(async () => {
      await flush();
      const r = await checkAnswer(attempt.id, response, 0);
      setResult(r);
      if (r.reveal) setReveal(r.reveal);
    });

  return (
    <div className="space-y-6">
      <div className="card min-w-0 space-y-6 p-5 sm:p-6">
        <PuzzleHeader puzzle={puzzle} />
        <div className="flex flex-wrap items-center gap-4 border-y border-zinc-100 py-3 dark:border-zinc-800">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Elapsed</p>
            <p className="font-mono text-3xl font-bold tabular-nums">{formatMs(elapsed)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Bonus if solved now</p>
            <p className={`font-mono text-3xl font-bold tabular-nums ${remaining > 0 ? "text-emerald-600" : "text-zinc-400"}`}>
              {Math.max(0, Math.round((SCORING.timedBonusPerSecond * remaining) / 1000))}
            </p>
          </div>
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm select-none">
            <input type="checkbox" className="accent-brand-600" checked={assist} onChange={(e) => setAssist(e.target.checked)} />
            Assist mode
          </label>
          <SaveIndicator status={done ? "saved" : status} />
        </div>

        <div className="pb-4">
          <Workspace
            puzzle={puzzle}
            response={response}
            onChange={setResponse}
            assist={assist}
            readOnly={done}
            wrong={reveal ? new Set(reveal.wrong) : undefined}
            expected={reveal?.expected}
          />
        </div>

        {result && !result.solved && !done && (
          <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
            {result.errors} errors. The clock keeps running until you&apos;re within {SCORING.freeErrors}.
          </p>
        )}
        {result?.solved && (
          <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
            <p className="text-lg font-bold">Solved in {formatMs(result.elapsedMs ?? 0)}</p>
            <p className="text-sm">
              {result.score}/{result.points} points + <b>{result.bonus ?? 0}</b> timing bonus
            </p>
          </div>
        )}
        {reveal && <RevealPanel reveal={reveal} />}

        <div className="flex flex-wrap gap-2">
          {!done ? (
            <>
              <button className="btn btn-primary" onClick={check} disabled={pending}>
                Check
              </button>
              <ConfirmButton
                className="btn btn-ghost"
                disabled={pending}
                confirmLabel="Click again to give up"
                onConfirm={() =>
                  startTransition(async () => {
                    const r = await revealAnswer(attempt.id, response, 0);
                    if (r) setReveal(r);
                  })
                }
              >
                Give up
              </ConfirmButton>
            </>
          ) : (
            <form action={startTimed}>
              <button className="btn btn-primary">Another timed question →</button>
            </form>
          )}
        </div>
      </div>
      <ToolsPanel ctx={ctx} assist={assist} />
    </div>
  );
}
