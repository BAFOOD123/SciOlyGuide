"use client";

import { useMemo, useState } from "react";
import { anatomyImg, labelChoices, matchLabel, type LabelSet, type Marker } from "@/lib/anatomy";

type Phase = { order: number[]; i: number; score: number; done: boolean };

function shuffle(n: number, seed: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  let s = seed >>> 0;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function LabelDrill({ set }: { set: LabelSet }) {
  const [mode, setMode] = useState<"choices" | "type">("choices");
  const [seed, setSeed] = useState(() => (Date.now() >>> 0) || 1);
  const [phase, setPhase] = useState<Phase>(() => ({ order: shuffle(set.markers.length, seed), i: 0, score: 0, done: false }));
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<null | { ok: boolean }>(null);

  const markerIndex = phase.order[phase.i]!;
  const marker: Marker | undefined = set.markers[markerIndex];
  const choices = useMemo(
    () => (marker ? labelChoices(set, marker.id, seed + phase.i * 97) : []),
    [set, marker, seed, phase.i],
  );

  const restart = () => {
    const s = (Date.now() >>> 0) || 1;
    setSeed(s);
    setPhase({ order: shuffle(set.markers.length, s), i: 0, score: 0, done: false });
    setGuess("");
    setResult(null);
  };

  const answer = (value: string) => {
    if (result || !marker) return;
    const ok = matchLabel(marker, value);
    setResult({ ok });
    setPhase((p) => ({ ...p, score: p.score + (ok ? 1 : 0) }));
  };

  const next = () => {
    setGuess("");
    setResult(null);
    setPhase((p) => (p.i + 1 >= p.order.length ? { ...p, done: true } : { ...p, i: p.i + 1 }));
  };

  // Which markers are already answered (for dimming), and the current highlight.
  const answeredIds = new Set(phase.order.slice(0, phase.i).map((m) => set.markers[m]!.id));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{set.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{set.blurb}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">
            {phase.done ? "Done" : `Structure ${phase.i + 1} of ${phase.order.length}`} · {phase.score} correct
          </span>
          <div className="inline-flex overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
            <button type="button" onClick={() => setMode("choices")} aria-pressed={mode === "choices"} className={`px-2.5 py-1 ${mode === "choices" ? "bg-brand-600 text-white" : ""}`}>
              Choices
            </button>
            <button type="button" onClick={() => setMode("type")} aria-pressed={mode === "type"} className={`px-2.5 py-1 ${mode === "type" ? "bg-brand-600 text-white" : ""}`}>
              Type it
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Diagram with numbered pins */}
        <figure className="relative mx-auto w-full max-w-md self-start overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={anatomyImg(set.image)} alt={`${set.title} diagram to label`} className="block w-full" />
          {set.markers.map((m) => {
            const isCurrent = !phase.done && m.id === marker?.id;
            const isDone = answeredIds.has(m.id);
            return (
              <span
                key={m.id}
                className={`absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 text-[11px] font-bold shadow-sm transition ${
                  isCurrent
                    ? "z-10 scale-125 animate-pulse border-white bg-brand-600 text-white"
                    : isDone
                      ? "border-white bg-emerald-500 text-white"
                      : "border-white bg-zinc-700/80 text-white"
                }`}
                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                aria-hidden
              >
                {set.markers.indexOf(m) + 1}
              </span>
            );
          })}
        </figure>

        {/* Prompt / answer panel */}
        <div className="self-start">
          {phase.done ? (
            <div className="card space-y-3 p-5 text-center">
              <p className="text-lg font-semibold">
                {phase.score} / {phase.order.length} correct
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {phase.score === phase.order.length ? "Perfect — you labeled them all." : "Review the ones you missed and try again."}
              </p>
              <button type="button" onClick={restart} className="btn btn-primary w-full">
                Label again
              </button>
            </div>
          ) : (
            marker && (
              <div className="card space-y-4 p-5">
                <p className="text-sm text-zinc-500">
                  What is structure <span className="font-semibold text-brand-600 dark:text-brand-300">#{markerIndex + 1}</span> (the highlighted pin)?
                </p>

                {mode === "choices" ? (
                  <div className="grid gap-2">
                    {choices.map((c) => {
                      const state = !result ? "idle" : matchLabel(marker, c) ? "correct" : c === guess ? "wrong" : "idle";
                      return (
                        <button
                          key={c}
                          type="button"
                          disabled={!!result}
                          onClick={() => {
                            setGuess(c);
                            answer(c);
                          }}
                          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                            state === "correct"
                              ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                              : state === "wrong"
                                ? "border-red-500 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100"
                                : "border-zinc-300 hover:border-brand-400 dark:border-zinc-700"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!result) answer(guess);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      autoFocus
                      className="input flex-1"
                      placeholder="Name the structure…"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      disabled={!!result}
                    />
                    {!result && (
                      <button type="submit" className="btn btn-primary">
                        Check
                      </button>
                    )}
                  </form>
                )}

                {result && (
                  <div className={`rounded-xl px-3 py-2 text-sm ${result.ok ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100" : "bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100"}`}>
                    <p className="font-semibold">{result.ok ? "Correct!" : `It's the ${marker.label.toLowerCase()}.`}</p>
                    <p className="mt-0.5 text-zinc-600 dark:text-zinc-300">{marker.hint}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {!result && mode === "choices" && <span className="text-xs text-zinc-400">Pick the highlighted structure's name.</span>}
                  {result && (
                    <button type="button" onClick={next} className="btn btn-primary ml-auto">
                      {phase.i + 1 >= phase.order.length ? "See score" : "Next structure"}
                    </button>
                  )}
                  {!result && mode === "type" && (
                    <button type="button" onClick={() => answer("")} className="btn btn-ghost ml-auto text-xs">
                      Skip / reveal
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
