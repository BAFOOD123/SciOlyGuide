"use client";

import { useMemo, type ReactNode } from "react";
import {
  BACON24,
  EN,
  EN25,
  MORSE,
  baconCode,
  baconDecode,
  decodeMorseStream,
  polybiusSquare,
  portaTable,
  type Response,
  type Token,
  type ToolId,
} from "@sciolyguide/codebusters";
import type { PublicPuzzle, ToolNotes } from "@/lib/codebusters-types";
import { normalizeTyped } from "./Workspace";

type CipherTok = Extract<Token, { k: "c" }>;

export interface ToolCtx {
  puzzle: PublicPuzzle;
  response: Response;
  onChange: (r: Response) => void;
  notes: ToolNotes;
  setNote: (key: string, value: unknown) => void;
  readOnly?: boolean;
}

const TOOL_TITLES: Record<ToolId, string> = {
  frequency: "Frequency table",
  "plain-cipher-table": "Plain → cipher alphabet",
  "baconian-ab": "A / B sorter",
  "morse-trigraphs": "Trigraph notes",
  "porta-table": "Porta tableau",
  "polybius-builder": "Polybius square builder",
  "columnar-grid": "Column arranger",
  "homophonic-table": "Homophonic table builder",
  "cryptarithm-digits": "Digit tracker",
  "morse-table": "Morse code",
  "baconian-table": "Baconian alphabet",
};

export function toolTitle(id: ToolId) {
  return TOOL_TITLES[id];
}

function cipherTokens(p: PublicPuzzle): CipherTok[] {
  return p.display.tokens.filter((t): t is CipherTok => t.k === "c");
}

/* ------------------------------------------------------------------------------ */

function FrequencyTool({ puzzle, response, onChange, readOnly }: ToolCtx) {
  const d = puzzle.display;
  const toks = cipherTokens(puzzle);
  const counts = new Map<string, number>();
  for (const t of toks) counts.set(t.t, (counts.get(t.t) ?? 0) + 1);
  const units =
    d.unit === "letter" && d.cipherAlphabet
      ? d.cipherAlphabet
      : [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)! || a.localeCompare(b));
  const editable = d.propagate && d.layout === "aligned" && !readOnly;
  const firstIndex = new Map<string, number[]>();
  for (const t of toks) if (t.a !== undefined) (firstIndex.get(t.t) ?? firstIndex.set(t.t, []).get(t.t)!).push(t.a);

  const setUnit = (unit: string, raw: string) => {
    const ch = normalizeTyped(raw, d.answerAlphabet);
    if (ch === null) return;
    const plain = response.plain.slice();
    for (const a of firstIndex.get(unit) ?? []) plain[a] = ch;
    onChange({ ...response, plain });
  };

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-0.5 text-center font-mono text-xs">
        <tbody>
          <tr>
            <th className="pr-2 text-left font-sans font-medium text-zinc-500">Cipher</th>
            {units.map((u) => (
              <td key={u} className="min-w-7 rounded bg-zinc-100 px-1 py-0.5 font-semibold dark:bg-zinc-800">
                {u}
              </td>
            ))}
          </tr>
          <tr>
            <th className="pr-2 text-left font-sans font-medium text-zinc-500">Count</th>
            {units.map((u) => (
              <td key={u} className={counts.get(u) ? "" : "text-zinc-300 dark:text-zinc-700"}>
                {counts.get(u) ?? 0}
              </td>
            ))}
          </tr>
          {editable && (
            <tr>
              <th className="pr-2 text-left font-sans font-medium text-zinc-500">Plain</th>
              {units.map((u) => {
                const idx = firstIndex.get(u);
                return (
                  <td key={u}>
                    {idx ? (
                      <input
                        className="cell-input h-7 w-7 text-sm"
                        value={response.plain[idx[0]!] ?? ""}
                        onChange={(e) => setUnit(u, e.target.value)}
                        aria-label={`Plaintext for ${u}`}
                        maxLength={2}
                      />
                    ) : null}
                  </td>
                );
              })}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PlainCipherTool({ puzzle, response }: ToolCtx) {
  const d = puzzle.display;
  const map = new Map<string, string>();
  for (const t of cipherTokens(puzzle)) {
    if (t.a === undefined) continue;
    const l = response.plain[t.a];
    if (l && !map.has(l)) map.set(l, t.t);
  }
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-0.5 text-center font-mono text-xs">
          <tbody>
            <tr>
              <th className="pr-2 text-left font-sans font-medium text-zinc-500">Plain</th>
              {d.answerAlphabet.map((l) => (
                <td key={l} className="min-w-6 rounded bg-zinc-100 px-1 py-0.5 font-semibold dark:bg-zinc-800">
                  {l}
                </td>
              ))}
            </tr>
            <tr>
              <th className="pr-2 text-left font-sans font-medium text-zinc-500">Cipher</th>
              {d.answerAlphabet.map((l) => (
                <td key={l} className="text-brand-600 dark:text-brand-300">
                  {map.get(l) ?? "·"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500">
        K2 alphabets show the keyword in the cipher row. For K1, read the frequency table&apos;s Plain row in cipher order.
      </p>
    </div>
  );
}

/* --------------------------------- Baconian ---------------------------------- */

function baconMap(notes: ToolNotes): Record<string, "A" | "B"> {
  return (notes.baconian as Record<string, "A" | "B">) ?? {};
}

function BaconianTool({ puzzle, notes, setNote, readOnly }: ToolCtx) {
  const syms = useMemo(() => [...new Set(cipherTokens(puzzle).flatMap((t) => [...t.t]))].sort(), [puzzle]);
  const map = baconMap(notes);
  const cycle = (s: string) => {
    if (readOnly) return;
    const next = { ...map };
    if (!map[s]) next[s] = "A";
    else if (map[s] === "A") next[s] = "B";
    else delete next[s];
    setNote("baconian", next);
  };
  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">Click a symbol to mark it A, then B, then clear. The A/B pattern shows under each group.</p>
      <div className="flex flex-wrap gap-1.5">
        {syms.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => cycle(s)}
            className={`flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-2 font-mono text-sm ${
              map[s] === "A"
                ? "border-sky-500 bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-200"
                : map[s] === "B"
                  ? "border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200"
                  : "border-zinc-300 dark:border-zinc-700"
            }`}
          >
            {s}
            {map[s] && <span className="text-[10px] font-bold">{map[s]}</span>}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-ghost px-2 py-1 text-xs" onClick={() => setNote("baconian", Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v === "A" ? "B" : "A"])))}>
        Swap A ↔ B
      </button>
    </div>
  );
}

function baconAnnotation(t: CipherTok, notes: ToolNotes): ReactNode {
  const map = baconMap(notes);
  const ab = [...t.t].map((s) => map[s] ?? "·").join("");
  const letter = baconDecode(ab);
  return (
    <span className="font-mono text-[10px] leading-4 text-zinc-500">
      {ab}
      {letter && <span className="ml-0.5 font-bold text-brand-600 dark:text-brand-300">{letter}</span>}
    </span>
  );
}

function BaconianTable() {
  return (
    <div className="grid grid-cols-4 gap-x-3 gap-y-0.5 font-mono text-xs sm:grid-cols-6">
      {BACON24.map((l) => (
        <span key={l}>
          <b>{l === "I" ? "I/J" : l === "U" ? "U/V" : l}</b> {baconCode(l)}
        </span>
      ))}
    </div>
  );
}

/* ---------------------------------- Morse ------------------------------------ */

function trigraphs(notes: ToolNotes): Record<string, string> {
  return (notes.trigraphs as Record<string, string>) ?? {};
}

function MorseTrigraphTool({ puzzle, notes, setNote, readOnly }: ToolCtx) {
  const toks = cipherTokens(puzzle);
  const present = [...new Set(toks.map((t) => t.t))].sort();
  const tri = trigraphs(notes);
  const stream = toks.map((t) => (tri[t.t]?.length === 3 ? tri[t.t] : "???")).join("");
  const preview = decodeMorseStream(stream.replace(/\?\?\?/g, "x?x"));
  const set = (l: string, raw: string) => {
    const v = raw
      .replace(/[•·*]/g, ".")
      .replace(/[–—_]/g, "-")
      .replace(/[^.\-xX]/g, "")
      .toLowerCase()
      .slice(0, 3);
    setNote("trigraphs", { ...tri, [l]: v });
  };
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">
        Type each cipher letter&apos;s trigraph using <code>.</code> <code>-</code> <code>x</code>. Every occurrence shows it, and the Morse
        decodes live below.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {present.map((l) => (
          <label key={l} className="flex items-center gap-1 rounded-lg border border-zinc-200 px-1.5 py-1 dark:border-zinc-800">
            <span className="w-3 font-mono text-sm font-semibold">{l}</span>
            <input
              className="input h-7 w-14 px-1 py-0 text-center font-mono text-sm"
              value={tri[l] ?? ""}
              onChange={(e) => set(l, e.target.value)}
              readOnly={readOnly}
              aria-label={`Trigraph for ${l}`}
            />
          </label>
        ))}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Live decode</p>
        <p className="mt-1 break-all font-mono text-sm tracking-widest">{preview}</p>
      </div>
    </div>
  );
}

function morseAnnotation(t: CipherTok, notes: ToolNotes): ReactNode {
  const v = trigraphs(notes)[t.t];
  return <span className="h-4 font-mono text-[11px] leading-4 text-brand-600 dark:text-brand-300">{v || "\u00a0"}</span>;
}

function MorseTable() {
  return (
    <div className="grid grid-cols-4 gap-x-4 gap-y-0.5 font-mono text-xs sm:grid-cols-7">
      {EN.map((l) => (
        <span key={l}>
          <b>{l}</b> {MORSE[l]}
        </span>
      ))}
    </div>
  );
}

/* ----------------------------------- Porta ----------------------------------- */

function PortaTable() {
  const rows = portaTable();
  return (
    <div className="overflow-x-auto">
      <table className="font-mono text-xs">
        <thead>
          <tr>
            <th className="pr-3 text-left text-zinc-500">Key</th>
            {EN.slice(0, 13).map((l) => (
              <th key={l} className="w-5 text-center">
                {l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.keys}>
              <td className="pr-3 font-semibold text-zinc-500">{r.keys}</td>
              {[...r.row].map((c, i) => (
                <td key={i} className="text-center">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-zinc-500">Reciprocal: A–M letters swap with the row letter below them, and vice versa.</p>
    </div>
  );
}

/* ---------------------------------- Polybius --------------------------------- */

function PolybiusTool({ puzzle, notes, setNote, readOnly }: ToolCtx) {
  const given = Object.fromEntries(puzzle.display.given.map((g) => [g.label, g.value]));
  const state = (notes.polybius as { key?: string; rows?: string; cols?: string }) ?? {};
  const key = state.key ?? given["Polybius key"] ?? "";
  const rows = state.rows ?? given["Row keyword"] ?? (puzzle.type === "nihilist" ? "12345" : "");
  const cols = state.cols ?? given["Column keyword"] ?? (puzzle.type === "nihilist" ? "12345" : "");
  const square = polybiusSquare(key.toUpperCase());
  const set = (k: "key" | "rows" | "cols", v: string) => setNote("polybius", { key, rows, cols, [k]: v.toUpperCase().slice(0, k === "key" ? 25 : 5) });
  return (
    <div className="flex flex-wrap gap-6">
      <div className="space-y-2 text-sm">
        <label className="block">
          <span className="text-xs text-zinc-500">Square keyword</span>
          <input className="input font-mono uppercase" value={key} onChange={(e) => set("key", e.target.value)} readOnly={readOnly} />
        </label>
        <label className="block">
          <span className="text-xs text-zinc-500">Row labels</span>
          <input className="input font-mono uppercase" value={rows} onChange={(e) => set("rows", e.target.value)} readOnly={readOnly} />
        </label>
        <label className="block">
          <span className="text-xs text-zinc-500">Column labels</span>
          <input className="input font-mono uppercase" value={cols} onChange={(e) => set("cols", e.target.value)} readOnly={readOnly} />
        </label>
      </div>
      <table className="border-separate border-spacing-1 text-center font-mono text-sm">
        <thead>
          <tr>
            <th />
            {Array.from({ length: 5 }, (_, c) => (
              <th key={c} className="w-8 text-brand-600 dark:text-brand-300">
                {cols[c] ?? ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }, (_, r) => (
            <tr key={r}>
              <th className="w-6 text-brand-600 dark:text-brand-300">{rows[r] ?? ""}</th>
              {Array.from({ length: 5 }, (_, c) => (
                <td key={c} className="h-8 w-8 rounded-md bg-zinc-100 font-semibold dark:bg-zinc-800">
                  {square[r * 5 + c] === "I" ? "I/J" : square[r * 5 + c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------- Columnar --------------------------------- */

function ColumnarTool({ puzzle, notes, setNote }: ToolCtx) {
  const letters = cipherTokens(puzzle).map((t) => t.t);
  const n = letters.length;
  const divisors = Array.from({ length: 11 }, (_, i) => i + 2).filter((c) => n % c === 0);
  const state = (notes.columnar as { cols?: number; order?: number[] }) ?? {};
  const cols = state.cols && divisors.includes(state.cols) ? state.cols : divisors[0] ?? 1;
  const rows = n / cols;
  const order = state.order?.length === cols ? state.order : Array.from({ length: cols }, (_, i) => i);
  const columns = Array.from({ length: cols }, (_, j) => letters.slice(j * rows, (j + 1) * rows));
  const move = (pos: number, dir: -1 | 1) => {
    const o = order.slice();
    const q = pos + dir;
    if (q < 0 || q >= cols) return;
    [o[pos], o[q]] = [o[q]!, o[pos]!];
    setNote("columnar", { cols, order: o });
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-zinc-500">Columns ({n} letters):</span>
        {divisors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setNote("columnar", { cols: c, order: Array.from({ length: c }, (_, i) => i) })}
            className={`btn px-2.5 py-1 ${c === cols ? "btn-primary" : "btn-secondary"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="text-xs text-zinc-500">The ciphertext is cut into equal columns. Reorder them until the rows read as English.</p>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-1 text-center font-mono text-sm">
          <thead>
            <tr>
              {order.map((c, pos) => (
                <th key={c} className="text-xs font-normal text-zinc-500">
                  <div className="flex items-center justify-center gap-0.5">
                    <button type="button" aria-label="Move left" onClick={() => move(pos, -1)} className="rounded px-1 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                      ‹
                    </button>
                    {c + 1}
                    <button type="button" aria-label="Move right" onClick={() => move(pos, 1)} className="rounded px-1 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                      ›
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r}>
                {order.map((c) => (
                  <td key={c} className="h-7 w-9 rounded bg-zinc-100 font-semibold dark:bg-zinc-800">
                    {columns[c]![r]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-mono text-sm tracking-widest">
        {Array.from({ length: rows }, (_, r) => order.map((c) => columns[c]![r]).join("")).join("")}
      </p>
    </div>
  );
}

/* --------------------------------- Homophonic -------------------------------- */

function HomophonicTool({ puzzle, notes, setNote, readOnly }: ToolCtx) {
  const given = puzzle.display.given.find((g) => g.label === "Keyword")?.value ?? "";
  const kw = ((notes.homophonic as string) ?? given).toUpperCase().padEnd(4, " ").slice(0, 4);
  const set = (i: number, raw: string) => {
    const ch = raw.toUpperCase().replace(/J/g, "I").replace(/[^A-Z]/g, "").slice(-1) || " ";
    setNote("homophonic", kw.slice(0, i) + ch + kw.slice(i + 1));
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Keyword letters:</span>
        {[0, 1, 2, 3].map((i) => (
          <input
            key={i}
            className="cell-input h-8 w-8"
            value={kw[i]!.trim()}
            onChange={(e) => set(i, e.target.value)}
            readOnly={readOnly}
            aria-label={`Keyword letter ${i + 1}`}
          />
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-0.5 text-center font-mono text-[11px]">
          <tbody>
            <tr>
              <th />
              {EN25.map((l) => (
                <td key={l} className="w-6 rounded bg-zinc-100 font-semibold dark:bg-zinc-800">
                  {l}
                </td>
              ))}
            </tr>
            {[0, 1, 2, 3].map((r) => {
              const k = kw[r]!.trim();
              return (
                <tr key={r}>
                  <th className="pr-1 text-zinc-500">{k || "?"}</th>
                  {EN25.map((l) => {
                    if (!k) return <td key={l} className="text-zinc-300 dark:text-zinc-700">·</td>;
                    const idx = (EN25.indexOf(l) - EN25.indexOf(k) + 25) % 25;
                    const n = r * 25 + idx + 1;
                    return <td key={l}>{n === 100 ? "00" : String(n).padStart(2, "0")}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500">Rows: 01–25, 26–50, 51–75, 76–00. Each row starts under its keyword letter.</p>
    </div>
  );
}

/* --------------------------------- Cryptarithm ------------------------------- */

function CryptarithmTool({ puzzle, notes, setNote, readOnly }: ToolCtx) {
  const lines = puzzle.display.lines ?? [];
  const letters = [...new Set(lines.join("").replace(/[^A-Z]/g, ""))].sort();
  const given = new Map(
    (puzzle.display.given.find((g) => g.label === "Given")?.value.split(", ") ?? []).map((e) => e.split(" = ") as [string, string]),
  );
  const digits = { ...Object.fromEntries(given), ...((notes.digits as Record<string, string>) ?? {}) };
  const set = (l: string, v: string) => setNote("digits", { ...((notes.digits as Record<string, string>) ?? {}), [l]: v.replace(/\D/g, "").slice(-1) });
  const usedBy = new Map<string, string[]>();
  for (const l of letters) if (digits[l]) (usedBy.get(digits[l]!) ?? usedBy.set(digits[l]!, []).get(digits[l]!)!).push(l);
  const sub = lines.map((ln) => [...ln].map((c) => (/[A-Z]/.test(c) ? (digits[c] ?? "·") : c)).join(""));
  const rows = lines.filter((l) => /[A-Z]/.test(l)).map((l) => l.replace(/[^A-Z]/g, ""));
  const complete = letters.every((l) => digits[l]);
  const value = (w: string) => Number([...w].map((c) => digits[c]).join(""));
  const ok = complete && rows.slice(0, -1).reduce((s, w) => s + value(w), 0) === value(rows.at(-1)!);
  return (
    <div className="flex flex-wrap gap-6">
      <div className="grid grid-cols-5 gap-1.5">
        {letters.map((l) => (
          <label key={l} className="flex items-center gap-1">
            <span className="w-3 font-mono text-sm font-semibold">{l}</span>
            <input
              className="cell-input h-8 w-8"
              data-state={digits[l] && (usedBy.get(digits[l]!)?.length ?? 0) > 1 ? "conflict" : given.has(l) ? "hint" : undefined}
              value={digits[l] ?? ""}
              onChange={(e) => set(l, e.target.value)}
              readOnly={readOnly || given.has(l)}
              inputMode="numeric"
              aria-label={`Digit for ${l}`}
            />
          </label>
        ))}
      </div>
      <div>
        <pre className="font-mono text-base leading-6 tracking-[0.3em]">{sub.join("\n")}</pre>
        {complete && <p className={`mt-2 text-sm font-semibold ${ok ? "text-emerald-600" : "text-red-600"}`}>{ok ? "✓ The sum checks out" : "✗ The sum doesn't add up"}</p>}
        <p className="mt-2 font-mono text-sm">
          0–9:{" "}
          {Array.from({ length: 10 }, (_, d) => letters.find((l) => digits[l] === String(d)) ?? "·").join(" ")}
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------- Exports --------------------------------- */

export function Tool({ id, ctx }: { id: ToolId; ctx: ToolCtx }) {
  switch (id) {
    case "frequency":
      return <FrequencyTool {...ctx} />;
    case "plain-cipher-table":
      return <PlainCipherTool {...ctx} />;
    case "baconian-ab":
      return <BaconianTool {...ctx} />;
    case "baconian-table":
      return <BaconianTable />;
    case "morse-trigraphs":
      return <MorseTrigraphTool {...ctx} />;
    case "morse-table":
      return <MorseTable />;
    case "porta-table":
      return <PortaTable />;
    case "polybius-builder":
      return <PolybiusTool {...ctx} />;
    case "columnar-grid":
      return <ColumnarTool {...ctx} />;
    case "homophonic-table":
      return <HomophonicTool {...ctx} />;
    case "cryptarithm-digits":
      return <CryptarithmTool {...ctx} />;
  }
}

/** Reference tools are on the official resource sheet, so they stay in paper mode. */
export const REFERENCE_TOOLS: ReadonlySet<ToolId> = new Set(["morse-table", "baconian-table", "porta-table"]);

/** Per-unit annotation for tools that write under the ciphertext. */
export function annotatorFor(puzzle: PublicPuzzle, notes: ToolNotes, assist: boolean) {
  if (!assist) return undefined;
  if (puzzle.display.tools.includes("baconian-ab")) return (t: CipherTok) => baconAnnotation(t, notes);
  if (puzzle.display.tools.includes("morse-trigraphs")) return (t: CipherTok) => morseAnnotation(t, notes);
  return undefined;
}
