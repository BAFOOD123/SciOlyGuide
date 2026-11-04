"use client";

import { SPECIMENS, specimenById, type QResponse } from "@sciolyguide/rocks-minerals";
import type { Feedback, PublicQuestion } from "@/lib/rocks-types";
import { SpecimenCard } from "./SpecimenCard";

const NAMES = SPECIMENS.map((s) => s.name);

interface Props {
  q: PublicQuestion;
  index: number;
  response: QResponse | null;
  onChange: (r: QResponse) => void;
  disabled?: boolean;
  feedback?: Feedback | null;
  /** Show the specimen card with feedback. */
  showSpecimen?: boolean;
}

export function QuestionView({ q, index, response, onChange, disabled, feedback, showSpecimen = true }: Props) {
  const id = `q${index}`;
  const order = response?.order ?? q.items?.map((_, i) => i) ?? [];
  const move = (pos: number, dir: -1 | 1) => {
    const o = order.slice();
    const t = pos + dir;
    if (t < 0 || t >= o.length) return;
    [o[pos], o[t]] = [o[t]!, o[pos]!];
    onChange({ order: o });
  };
  const specimen = feedback?.specimenId ? specimenById(feedback.specimenId) : undefined;

  return (
    <fieldset className="space-y-4" disabled={disabled}>
      <legend className="text-lg font-semibold [text-wrap:pretty]">{q.prompt}</legend>
      {q.clues && (
        <ul className="grid gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          {q.clues.map((c) => {
            const [k, ...rest] = c.split(": ");
            return (
              <li key={c} className="flex gap-2">
                <span aria-hidden className="text-brand-500">▸</span>
                {rest.length ? (
                  <span>
                    <span className="font-medium">{k}:</span> {rest.join(": ")}
                  </span>
                ) : (
                  <span>{c}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {q.kind === "mcq" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {q.choices!.map((c, i) => {
            const picked = response?.choice === i;
            const right = feedback && feedback.correctText === c;
            const wrong = feedback && picked && !feedback.correct;
            return (
              <label
                key={i}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500 ${
                  right
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                    : wrong
                      ? "border-red-500 bg-red-50 dark:bg-red-950/40"
                      : picked
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40"
                        : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-700"
                }`}
              >
                <input type="radio" name={id} className="accent-brand-600" checked={picked} onChange={() => onChange({ choice: i })} />
                <span>{c}</span>
              </label>
            );
          })}
        </div>
      )}

      {q.kind === "order" && (
        <ol className="space-y-2">
          {order.map((itemIdx, pos) => (
            <li key={itemIdx} className="flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700">
              <span className="w-6 text-center font-mono text-sm text-zinc-500">{pos + 1}</span>
              <span className="flex-1">{q.items![itemIdx]}</span>
              <button type="button" className="btn btn-ghost px-2 py-1" onClick={() => move(pos, -1)} aria-label={`Move ${q.items![itemIdx]} up`}>
                ↑
              </button>
              <button type="button" className="btn btn-ghost px-2 py-1" onClick={() => move(pos, 1)} aria-label={`Move ${q.items![itemIdx]} down`}>
                ↓
              </button>
            </li>
          ))}
          {!response?.order && <p className="text-xs text-zinc-500">Use the arrows to reorder, then submit.</p>}
        </ol>
      )}

      {q.kind === "text" && (
        <div className="max-w-sm">
          <input
            id={`${id}-text`}
            list="specimen-names"
            className="input text-base"
            placeholder="Type the specimen name"
            value={response?.text ?? ""}
            onChange={(e) => onChange({ text: e.target.value })}
            autoComplete="off"
            aria-label="Specimen name"
          />
          <datalist id="specimen-names">
            {NAMES.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>
      )}

      {feedback && (
        <div
          role="status"
          className={`space-y-3 rounded-xl p-4 ${feedback.correct ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100" : "bg-red-50 text-red-950 dark:bg-red-950/40 dark:text-red-100"}`}
        >
          <p className="font-semibold">{feedback.correct ? "Correct." : `Not quite. Answer: ${feedback.correctText}`}</p>
          <p className="text-sm">{feedback.explanation}</p>
          {showSpecimen && specimen && (
            <details className="rounded-lg bg-white/70 p-3 text-zinc-900 dark:bg-zinc-900/70 dark:text-zinc-100">
              <summary className="cursor-pointer text-sm font-medium">Specimen sheet: {specimen.name}</summary>
              <div className="pt-3">
                <SpecimenCard s={specimen} />
              </div>
            </details>
          )}
        </div>
      )}
    </fieldset>
  );
}

export function hasAnswer(q: PublicQuestion, r: QResponse | null): boolean {
  if (!r) return false;
  if (q.kind === "mcq") return r.choice !== undefined;
  if (q.kind === "order") return !!r.order;
  return !!r.text?.trim();
}
