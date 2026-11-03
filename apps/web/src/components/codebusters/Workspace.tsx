"use client";

import { Fragment, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import type { Response, Token } from "@sciolyguide/codebusters";
import type { PublicPuzzle } from "@/lib/codebusters-types";

type CipherTok = Extract<Token, { k: "c" }>;

export interface WorkspaceProps {
  puzzle: PublicPuzzle;
  response: Response;
  onChange: (r: Response) => void;
  /** Assist mode: auto-fill identical units, conflict warnings, focus highlights. */
  assist: boolean;
  readOnly?: boolean;
  wrong?: ReadonlySet<number>;
  hinted?: ReadonlySet<number>;
  expected?: string[];
  /** Extra line rendered between a cipher unit and its answer box (tool output). */
  annotate?: (t: CipherTok, tokenIndex: number) => ReactNode;
  onFocusIndex?: (i: number | null) => void;
}

const UNIT_WIDTH: Record<PublicPuzzle["display"]["unit"], string> = {
  letter: "w-8",
  number: "w-9",
  pair: "w-10",
  group: "w-[4.75rem]",
};

export function normalizeTyped(raw: string, alphabet: readonly string[]): string | null {
  if (!raw) return "";
  let ch = [...raw.toUpperCase()].at(-1)!;
  if (ch === "~" && alphabet.includes("Ñ")) ch = "Ñ";
  if (ch !== "Ñ") ch = ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return alphabet.includes(ch) ? ch : null;
}

/** Split a token stream into words (runs between space tokens). */
function words(tokens: Token[]): { tok: Token; i: number }[][] {
  const out: { tok: Token; i: number }[][] = [[]];
  tokens.forEach((tok, i) => {
    if (tok.k === "s") out.push([]);
    else out.at(-1)!.push({ tok, i });
  });
  return out.filter((w) => w.length);
}

export function Workspace(props: WorkspaceProps) {
  const { puzzle, response, onChange, assist, readOnly, wrong, hinted, expected, annotate, onFocusIndex } = props;
  const d = puzzle.display;
  const refs = useRef(new Map<number, HTMLInputElement>());
  const [focused, setFocused] = useState<number | null>(null);

  const cipherToks = useMemo(() => d.tokens.filter((t): t is CipherTok => t.k === "c"), [d.tokens]);
  const unitOf = useMemo(() => {
    const m = new Map<number, string>();
    for (const t of cipherToks) if (t.a !== undefined) m.set(t.a, t.t);
    return m;
  }, [cipherToks]);
  const indicesOfUnit = useMemo(() => {
    const m = new Map<string, number[]>();
    for (const t of cipherToks) if (t.a !== undefined) (m.get(t.t) ?? m.set(t.t, []).get(t.t)!).push(t.a);
    return m;
  }, [cipherToks]);

  const propagate = assist && d.propagate && d.layout === "aligned";

  const conflicts = useMemo(() => {
    const bad = new Set<number>();
    if (!propagate) return bad;
    const unitsForLetter = new Map<string, Set<string>>();
    for (const [a, unit] of unitOf) {
      const l = response.plain[a];
      if (!l) continue;
      (unitsForLetter.get(l) ?? unitsForLetter.set(l, new Set()).get(l)!).add(unit);
    }
    for (const units of unitsForLetter.values()) {
      if (units.size > 1) for (const u of units) for (const a of indicesOfUnit.get(u) ?? []) bad.add(a);
    }
    return bad;
  }, [propagate, unitOf, indicesOfUnit, response.plain]);

  // Keep the latest response in a ref so rapid keystrokes never build on a stale render.
  const latest = useRef(response);
  latest.current = response;
  const setAt = useCallback(
    (index: number, letter: string) => {
      const cur = latest.current;
      const plain = cur.plain.slice();
      const targets = propagate ? (indicesOfUnit.get(unitOf.get(index) ?? "") ?? [index]) : [index];
      for (const t of targets) plain[t] = letter;
      const next = { ...cur, plain };
      latest.current = next;
      onChange(next);
    },
    [onChange, propagate, indicesOfUnit, unitOf],
  );

  // Stable per-box ref callbacks, so re-renders never briefly drop a box from the map.
  const refSetters = useRef(new Map<number, (el: HTMLInputElement | null) => void>());
  const refFor = (a: number) => {
    let fn = refSetters.current.get(a);
    if (!fn) {
      fn = (el) => {
        if (el) refs.current.set(a, el);
        else refs.current.delete(a);
      };
      refSetters.current.set(a, fn);
    }
    return fn;
  };

  const focusIndex = (i: number) => {
    const el = refs.current.get(Math.max(0, Math.min(d.answerLength - 1, i)));
    el?.focus();
    el?.select();
  };

  const onKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (readOnly) return;
    // Handle letters here (not only in onChange): retyping the letter a box already
    // holds produces no change event, which would otherwise stall the cursor.
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !e.nativeEvent.isComposing) {
      const ch = normalizeTyped(e.key, d.answerAlphabet);
      if (ch) {
        e.preventDefault();
        enter(i, ch);
        return;
      }
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      if (latest.current.plain[i]) setAt(i, "");
      else if (i > 0) {
        focusIndex(i - 1);
      }
    } else if (e.key === "Delete") {
      e.preventDefault();
      setAt(i, "");
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusIndex(i - 1);
    } else if (e.key === "ArrowRight" || e.key === " ") {
      e.preventDefault();
      focusIndex(i + 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusIndex(d.answerLength - 1);
    }
  };

  const onInput = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const ch = normalizeTyped(e.target.value, d.answerAlphabet);
    if (ch === null) return;
    enter(i, ch);
  };

  function enter(i: number, ch: string) {
    setAt(i, ch);
    if (ch) {
      // Assist: jump to the next empty box. Otherwise: the next box.
      let next = i + 1;
      if (propagate) {
        const plainAfter = latest.current.plain;
        for (let k = 1; k <= d.answerLength; k++) {
          const j = i + k;
          if (j < d.answerLength && !plainAfter[j]) {
            next = j;
            break;
          }
        }
      }
      if (next < d.answerLength) focusIndex(next);
    }
  }

  const cellState = (a: number): string | undefined => {
    if (wrong?.has(a)) return "wrong";
    if (conflicts.has(a)) return "conflict";
    if (hinted?.has(a)) return "hint";
    if (assist && focused !== null && focused !== a && d.propagate && unitOf.get(focused) === unitOf.get(a)) return "peer";
    return undefined;
  };

  const answerInput = (a: number, label: string) => (
    <div className="relative w-full">
      <input
        ref={refFor(a)}
        className="cell-input"
        data-state={cellState(a)}
        value={response.plain[a] ?? ""}
        onChange={onInput(a)}
        onKeyDown={onKeyDown(a)}
        onFocus={(e) => {
          setFocused(a);
          onFocusIndex?.(a);
          e.currentTarget.select();
        }}
        onBlur={() => setFocused((f) => (f === a ? null : f))}
        readOnly={readOnly}
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={2}
        aria-label={label}
      />
      {expected && wrong?.has(a) && (
        <span className="absolute -bottom-4 left-0 right-0 text-center font-mono text-[11px] font-bold text-emerald-600">
          {expected[a]}
        </span>
      )}
    </div>
  );

  const cipherText = (t: CipherTok) => (
    <span
      className={`whitespace-nowrap font-mono text-sm leading-6 tracking-tight ${
        t.crib ? "rounded bg-amber-200/80 px-0.5 text-amber-950 dark:bg-amber-400/30 dark:text-amber-100" : "text-zinc-700 dark:text-zinc-300"
      }`}
    >
      {t.t}
    </span>
  );

  const width = UNIT_WIDTH[d.unit];

  /* ------------------------------- Aligned layout ------------------------------ */
  if (d.layout === "aligned") {
    return (
      <div className="flex flex-wrap gap-x-5 gap-y-6" role="group" aria-label="Ciphertext with answer boxes">
        {words(d.tokens).map((w, wi) => (
          <div key={wi} className="flex flex-wrap gap-x-1 gap-y-6">
            {w.map(({ tok, i }) =>
              tok.k === "c" ? (
                <div key={i} className={`flex ${width} flex-col items-center gap-1`}>
                  {cipherText(tok)}
                  {annotate?.(tok, i)}
                  {tok.a !== undefined && answerInput(tok.a, `Plaintext for cipher ${tok.t}, position ${tok.a + 1}`)}
                </div>
              ) : (
                <div key={i} className="flex w-3 flex-col items-center gap-1">
                  <span className="font-mono text-sm leading-6 text-zinc-500">{tok.k === "p" ? tok.t : ""}</span>
                </div>
              ),
            )}
          </div>
        ))}
      </div>
    );
  }

  /* ------------------------------ Separate layout ------------------------------ */
  return (
    <div className="space-y-6">
      {d.lines && (
        <pre className="w-fit rounded-xl bg-zinc-100 px-6 py-4 font-mono text-xl leading-8 tracking-[0.3em] dark:bg-zinc-800/60">
          {d.lines.join("\n")}
        </pre>
      )}
      {d.tokens.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-3" aria-label="Ciphertext">
          {words(d.tokens).map((w, wi) => (
            <div key={wi} className="flex flex-wrap gap-x-1 gap-y-3">
              {w.map(({ tok, i }) =>
                tok.k === "c" ? (
                  <div key={i} className="flex w-7 flex-col items-center">
                    {cipherText(tok)}
                    {annotate?.(tok, i)}
                  </div>
                ) : (
                  <Fragment key={i} />
                ),
              )}
            </div>
          ))}
        </div>
      )}
      {puzzle.answer.kind === "plaintext" && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Plaintext ({d.answerLength} letters)</p>
          <div className="flex flex-wrap gap-x-3 gap-y-6">
            {Array.from({ length: Math.ceil(d.answerLength / 5) }, (_, g) => (
              <div key={g} className="flex gap-1">
                {Array.from({ length: Math.min(5, d.answerLength - g * 5) }, (_, k) => {
                  const a = g * 5 + k;
                  return (
                    <div key={a} className="w-8">
                      {answerInput(a, `Plaintext letter ${a + 1}`)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Final-answer field for keyword and cryptarithm questions. */
export function FinalAnswer({
  puzzle,
  response,
  onChange,
  readOnly,
  correct,
}: {
  puzzle: PublicPuzzle;
  response: Response;
  onChange: (r: Response) => void;
  readOnly?: boolean;
  correct?: string;
}) {
  if (puzzle.answer.kind === "plaintext") return null;
  return (
    <label className="block max-w-md space-y-1">
      <span className="text-sm font-semibold">
        {puzzle.answer.label ?? "Answer"}{" "}
        <span className="font-normal text-zinc-500">(must be exact)</span>
      </span>
      <input
        className="input font-mono text-lg uppercase tracking-[0.25em]"
        value={response.final ?? ""}
        onChange={(e) => onChange({ ...response, final: e.target.value.toUpperCase().replace(/[^A-ZÑ]/g, "") })}
        readOnly={readOnly}
        maxLength={puzzle.answer.length + 6}
        autoComplete="off"
        spellCheck={false}
      />
      {correct && <span className="block font-mono text-sm text-emerald-600">Answer: {correct}</span>}
    </label>
  );
}
