"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { CipherInfo, PuzzleOptions, Response } from "@sciolyguide/codebusters";
import { checkAnswer, hintLetter, newPractice, revealAnswer, saveProgress } from "@/app/codebusters/actions";
import type { AttemptState, CheckResult, PublicPuzzle, Reveal, ToolNotes } from "@/lib/codebusters-types";
import { ConfirmButton, PuzzleHeader, RevealPanel, SaveIndicator, ToolsPanel, formatMs, useActiveTimer, useAssistPref, useAutosave } from "./common";
import { annotatorFor } from "./tools";
import { FinalAnswer, Workspace } from "./Workspace";

interface Props {
  puzzle: PublicPuzzle;
  attempt: AttemptState;
  info: CipherInfo;
  options: PuzzleOptions;
  initialReveal?: Reveal | null;
}

export function PracticeClient({ puzzle, attempt, info, options, initialReveal }: Props) {
  const [response, setResponse] = useState<Response>(attempt.response);
  const [notes, setNotes] = useState<ToolNotes>(attempt.notes);
  const [assist, setAssist] = useAssistPref();
  const [result, setResult] = useState<CheckResult | null>(null);
  const [reveal, setReveal] = useState<Reveal | null>(initialReveal ?? null);
  const [hinted, setHinted] = useState<Set<number>>(new Set(attempt.hinted));
  const [focused, setFocused] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [opts, setOpts] = useState<PuzzleOptions>(options);
  const done = attempt.status !== "active" || !!reveal || !!result?.solved;
  const elapsed = useActiveTimer(attempt.elapsedMs, !done);

  const save = useCallback((r: Response, n: ToolNotes) => saveProgress(attempt.id, r, elapsed, n), [attempt.id, elapsed]);
  const { status, flush } = useAutosave(save, response, notes, !done);

  const setNote = useCallback((key: string, value: unknown) => setNotes((n) => ({ ...n, [key]: value })), []);
  const annotate = useMemo(() => annotatorFor(puzzle, notes, assist), [puzzle, notes, assist]);

  const check = () =>
    startTransition(async () => {
      await flush();
      const r = await checkAnswer(attempt.id, response, elapsed);
      setResult(r);
      if (r.reveal) setReveal(r.reveal);
    });

  const giveUp = () => {
    startTransition(async () => {
      const r = await revealAnswer(attempt.id, response, elapsed);
      if (r) setReveal(r);
    });
  };

  const hint = () =>
    startTransition(async () => {
      const target =
        focused !== null && !response.plain[focused] ? focused : response.plain.findIndex((l) => !l);
      if (target < 0) return;
      const r = await hintLetter(attempt.id, target);
      if (!r) return;
      const plain = response.plain.slice();
      // Fill every box for the same cipher unit when the cipher allows it.
      const unit = puzzle.display.tokens.find((t) => t.k === "c" && t.a === target);
      const targets =
        assist && puzzle.display.propagate && unit && unit.k === "c"
          ? puzzle.display.tokens.flatMap((t) => (t.k === "c" && t.t === unit.t && t.a !== undefined ? [t.a] : []))
          : [target];
      for (const t of targets) plain[t] = r.letter;
      setHinted((h) => new Set([...h, target]));
      setResponse({ ...response, plain });
    });

  // Ctrl/Cmd+Enter checks.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !done) check();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const filled = puzzle.answer.kind === "plaintext" ? response.plain.filter(Boolean).length : (response.final ?? "").length;
  const wrong = reveal ? new Set(reveal.wrong) : undefined;
  const ctx = { puzzle, response, onChange: setResponse, notes, setNote, readOnly: done };
  const isXeno = puzzle.display.answerAlphabet.includes("Ñ");

  const insertEnye = () => {
    if (focused === null) return;
    const plain = response.plain.slice();
    const unit = puzzle.display.tokens.find((t) => t.k === "c" && t.a === focused);
    const targets =
      assist && unit && unit.k === "c"
        ? puzzle.display.tokens.flatMap((t) => (t.k === "c" && t.t === unit.t && t.a !== undefined ? [t.a] : []))
        : [focused];
    for (const t of targets) plain[t] = "Ñ";
    setResponse({ ...response, plain });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="min-w-0 space-y-6">
        <div className="card space-y-6 p-5 sm:p-6">
          <PuzzleHeader puzzle={puzzle} />
          <div className="flex flex-wrap items-center gap-3 border-y border-zinc-100 py-3 text-sm dark:border-zinc-800">
            <span className="font-mono text-base tabular-nums" aria-label="Elapsed time">
              ⏱ {formatMs(result?.elapsedMs && done ? result.elapsedMs : elapsed)}
            </span>
            {puzzle.answer.kind === "plaintext" && (
              <span className="text-zinc-500">
                {filled}/{puzzle.answer.length} filled
              </span>
            )}
            <label className="ml-auto flex cursor-pointer items-center gap-2 select-none">
              <input type="checkbox" className="accent-brand-600" checked={assist} onChange={(e) => setAssist(e.target.checked)} />
              <span>
                Assist mode{" "}
                <span className="text-zinc-500" title="Assist mode auto-fills repeated letters, flags conflicts and shows solving tools. Turn it off to practice like it's on paper.">
                  ⓘ
                </span>
              </span>
            </label>
            <SaveIndicator status={done ? "saved" : status} />
          </div>

          {isXeno && !done && (
            <p className="text-xs text-zinc-500">
              Type <kbd className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">~</kbd> or use{" "}
              <button type="button" onClick={insertEnye} className="btn btn-secondary px-2 py-0.5 text-xs">
                Ñ
              </button>{" "}
              for Ñ.
            </p>
          )}

          <div className="pb-4">
            <Workspace
              puzzle={puzzle}
              response={response}
              onChange={setResponse}
              assist={assist}
              readOnly={done}
              wrong={wrong}
              hinted={hinted}
              expected={reveal?.expected}
              annotate={annotate}
              onFocusIndex={setFocused}
            />
          </div>
          <FinalAnswer puzzle={puzzle} response={response} onChange={setResponse} readOnly={done} correct={reveal ? reveal.expected.join("") : undefined} />

          {result && !result.solved && !done && (
            <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              Not yet: <b>{result.errors}</b> error{result.errors === 1 ? "" : "s"} ({puzzle.answer.freeErrors} allowed). Keep going.
            </p>
          )}

          {done && (
            <div className="space-y-3">
              {(result?.solved || attempt.status === "solved") && (
                <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                  <p className="text-lg font-bold">Solved! 🎉</p>
                  <p className="text-sm">
                    {(result?.score ?? attempt.score) ?? 0}/{puzzle.points} points · {(result?.errors ?? attempt.errors) ?? 0} error(s) ·{" "}
                    {formatMs(result?.elapsedMs ?? attempt.elapsedMs)}
                    {hinted.size > 0 && ` · ${hinted.size} hint${hinted.size === 1 ? "" : "s"}`}
                  </p>
                </div>
              )}
              {reveal && <RevealPanel reveal={reveal} />}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!done ? (
              <>
                <button className="btn btn-primary" onClick={check} disabled={pending}>
                  Check answer <span className="hidden text-xs opacity-70 sm:inline">⌘↵</span>
                </button>
                {puzzle.answer.kind === "plaintext" && (
                  <button className="btn btn-secondary" onClick={hint} disabled={pending}>
                    Hint a letter
                  </button>
                )}
                <ConfirmButton className="btn btn-ghost" onConfirm={giveUp} disabled={pending} confirmLabel="Click again: counts as unsolved">
                  Show answer
                </ConfirmButton>
              </>
            ) : (
              <form action={newPractice.bind(null, puzzle.type, opts)}>
                <button className="btn btn-primary">Next puzzle →</button>
              </form>
            )}
            <Link href={`/codebusters/learn/${puzzle.type}`} className="btn btn-ghost ml-auto">
              How to solve {info.name}
            </Link>
          </div>
        </div>
        <ToolsPanel ctx={ctx} assist={assist} />
      </div>

      <aside className="space-y-4">
        <form action={newPractice.bind(null, puzzle.type, opts)} className="card space-y-3 p-4">
          <h3 className="text-sm font-semibold">Puzzle settings</h3>
          {info.options.map((def) => (
            <label key={def.key} className="block space-y-1 text-sm">
              <span className="text-xs font-medium text-zinc-500">{def.label}</span>
              <select
                className="input"
                value={String(opts[def.key] ?? info.defaults[def.key] ?? def.choices[0]!.value)}
                onChange={(e) => setOpts((o) => ({ ...o, [def.key]: e.target.value }))}
              >
                {def.choices.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button className="btn btn-secondary w-full">New puzzle with these settings</button>
        </form>
      </aside>
    </div>
  );
}
