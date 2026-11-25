"use client";

import { useEffect, useState } from "react";
import {
  caDistance,
  checkpoints,
  CM_PER_ANGSTROM,
  FIRST,
  LAST,
  resLabel3,
  segmentName,
  SS_INFO,
  TOOBER_LENGTH_CM,
  tooberCm,
  type Checkpoint,
  type Segment,
} from "@/lib/protein/analysis";
import type { ModelDesign } from "@/lib/protein/design";
import { printBuildSheet } from "./print";
import { Disclosure, PrintButton } from "./ui";

const CHECKPOINTS = checkpoints();

/** Folding advice for one segment, using real distances from the structure. */
function segmentTip(s: Segment, diameterCm: number): string {
  const span = caDistance(s.start, s.end).cm;
  if (s.ss === "H") {
    const turns = s.length / 3.6;
    const caWidth = 4.6 * CM_PER_ANGSTROM;
    const core = Math.max(0.3, caWidth - diameterCm);
    return `Right-handed α-helix: ${turns.toFixed(1)} turns, 3.6 residues (7.2 cm of tubing) per turn, each turn rising about ${(5.4 * CM_PER_ANGSTROM).toFixed(1)} cm. The alpha carbons sit on a ${caWidth.toFixed(1)} cm-wide cylinder, so wrap your ${diameterCm} cm tubing around something about ${core.toFixed(1)} cm across (a thick marker), turning clockwise as it goes away from you. Finished, it is ${span.toFixed(1)} cm from end to end.`;
  }
  if (s.ss === "E") {
    const pair = s.partners.length
      ? ` It lies beside ${s.partners.map((p) => `${p.start === p.end ? p.start : `${p.start}–${p.end}`} (${p.parallel ? "parallel" : "antiparallel"})`).join(" and ")}, about ${(4.8 * CM_PER_ANGSTROM).toFixed(1)}–${(5.5 * CM_PER_ANGSTROM).toFixed(1)} cm away.`
      : "";
    return s.length === 1
      ? `One residue that pairs in a sheet.${pair}`
      : `Extended β-strand with a gentle zig-zag (pleat): ${s.length} residues (${s.cm} cm of tubing) stretch to ${span.toFixed(1)} cm end to end.${pair}`;
  }
  return `Loop of ${s.length} residues (${s.cm} cm of tubing). Bend it until its two ends are ${span.toFixed(1)} cm apart, then check the shape against the 3D view.`;
}

export function BuildPanel({
  design,
  update,
  segs,
  focus,
  buildAlong,
  setBuildAlong,
  onShow,
  onShowCheckpoint,
}: {
  design: ModelDesign;
  update: (fn: (d: ModelDesign) => ModelDesign) => void;
  segs: Segment[];
  focus: { start: number; end: number } | null;
  buildAlong: boolean;
  setBuildAlong: (v: boolean) => void;
  onShow: (s: Segment) => void;
  onShowCheckpoint: (c: Checkpoint) => void;
}) {
  const done = (k: string) => !!design.progress[k];
  const toggle = (k: string) => update((d) => ({ ...d, progress: { ...d.progress, [k]: !d.progress[k] } }));
  const doneCount = segs.filter((s) => done(`seg-${s.index}`)).length;
  const current = segs.find((s) => !done(`seg-${s.index}`));
  const [openStep, setOpenStep] = useState<number | null>(null);
  const expanded = openStep ?? current?.index ?? -1;
  const cpDone = CHECKPOINTS.filter((c) => done(c.key)).length;

  return (
    <div className="space-y-4 text-sm">
      {/* progress */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold">
            {current ? (
              <>
                Step {current.index + 1} of {segs.length}: {segmentName(current)}
              </>
            ) : (
              "Backbone folded"
            )}
          </h3>
          <span className="shrink-0 text-xs tabular-nums text-zinc-500">
            {doneCount}/{segs.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800" aria-hidden>
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(doneCount / segs.length) * 100}%` }} />
        </div>
        <label className="flex cursor-pointer items-start gap-2 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800/60">
          <input type="checkbox" id="pm-build-along" className="mt-0.5 accent-brand-600" checked={buildAlong} onChange={(e) => setBuildAlong(e.target.checked)} />
          <span>
            <span className="font-medium">Build-along view</span>
            <span className="block text-xs text-zinc-600 dark:text-zinc-400">
              The 3D view shows only what you’ve folded plus the current step, so it looks like the tubing in your hands. Tick a step to move on.
            </span>
          </span>
        </label>
      </div>

      <Disclosure title="Prepare the backbone" meta={`${TOOBER_LENGTH_CM} cm · ${design.backbone.diameterCm} cm wide`} defaultOpen={doneCount === 0}>
        <div className="grid grid-cols-2 gap-2">
          <label className="col-span-2 block" htmlFor="pm-material">
            <span className="mb-0.5 block text-xs font-medium text-zinc-500">Material</span>
            <input
              id="pm-material"
              className="input py-1.5"
              list="pm-materials"
              maxLength={60}
              value={design.backbone.material}
              onChange={(e) => update((d) => ({ ...d, backbone: { ...d.backbone, material: e.target.value } }))}
            />
            <datalist id="pm-materials">
              <option value="Mini-Toober" />
              <option value="Modeling Ties" />
              <option value="Kwik Twists" />
              <option value="12-gauge house wire" />
            </datalist>
          </label>
          <label className="block" htmlFor="pm-diameter">
            <span className="mb-0.5 block text-xs font-medium text-zinc-500">Diameter (cm)</span>
            <DiameterInput value={design.backbone.diameterCm} onChange={(v) => update((d) => ({ ...d, backbone: { ...d.backbone, diameterCm: v } }))} />
          </label>
          <label className="block" htmlFor="pm-color">
            <span className="mb-0.5 block text-xs font-medium text-zinc-500">Color</span>
            <input
              id="pm-color"
              type="color"
              className="h-9 w-full cursor-pointer rounded-xl border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900"
              value={design.backbone.color}
              onChange={(e) => update((d) => ({ ...d, backbone: { ...d.backbone, color: e.target.value } }))}
            />
          </label>
          <label className="col-span-2 flex items-center gap-2" htmlFor="pm-accent">
            <input
              id="pm-accent"
              type="checkbox"
              className="accent-brand-600"
              checked={design.backbone.accentSS}
              onChange={(e) => update((d) => ({ ...d, backbone: { ...d.backbone, accentSS: e.target.checked } }))}
            />
            Color the helix and strands too (rest stays gray)
          </label>
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Cut <strong>{TOOBER_LENGTH_CM} cm</strong> of {design.backbone.material || "backbone material"} (2 cm × 100 residues).
          </li>
          <li>
            Mark each alpha carbon at the <strong>center</strong> of its 2 cm: {FIRST} at 1 cm, {FIRST + 1} at 3 cm … {LAST} at {TOOBER_LENGTH_CM - 1} cm. Label every 10th.
          </li>
          <li>Mark where each helix and strand starts and ends (the cm ranges below).</li>
        </ol>
        <PrintButton className="btn btn-secondary w-full" label="build sheet" run={() => printBuildSheet(design)} />
      </Disclosure>

      <section aria-label="Folding steps" className="space-y-1.5">
        <h3 className="font-semibold">Fold, step by step</h3>
        <ul className="space-y-1.5">
          {segs.map((s) => {
            const k = `seg-${s.index}`;
            const showing = !!focus && focus.start === s.start && focus.end === s.end;
            const isOpen = expanded === s.index;
            const isCurrent = current?.index === s.index;
            const stepChecks = CHECKPOINTS.filter((c) => c.b >= s.start && c.b <= s.end);
            return (
              <li
                key={k}
                className={`rounded-lg border ${
                  isCurrent ? "border-brand-400 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-950/30" : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2 px-2.5 py-2">
                  <input type="checkbox" className="size-4 shrink-0 accent-emerald-600" checked={done(k)} onChange={() => toggle(k)} aria-label={`Step ${s.index + 1} folded`} />
                  <button
                    className={`flex min-w-0 flex-1 items-center gap-2 text-left ${done(k) ? "text-zinc-500" : ""}`}
                    aria-expanded={isOpen}
                    onClick={() => setOpenStep(isOpen ? -1 : s.index)}
                  >
                    <span className="h-3.5 w-1.5 shrink-0 rounded-sm" style={{ background: SS_INFO[s.ss].hex }} />
                    <span className={`truncate font-medium ${done(k) ? "line-through decoration-zinc-400" : ""}`}>
                      {s.index + 1}. {segmentName(s)}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-zinc-500">
                      {s.fromCm}–{s.toCm} cm
                    </span>
                  </button>
                  <button className={`btn shrink-0 px-2 py-0.5 text-xs ${showing ? "btn-primary" : "btn-secondary"}`} onClick={() => onShow(s)} aria-pressed={showing}>
                    {showing ? "Shown" : "Show"}
                  </button>
                </div>
                {isOpen && (
                  <div className="space-y-2 border-t border-zinc-200/70 px-3 py-2 text-xs leading-relaxed text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                    <p>
                      Marks {tooberCm(s.start)} cm ({resLabel3(s.start)}){s.start !== s.end && <> to {tooberCm(s.end)} cm ({resLabel3(s.end)})</>}.
                    </p>
                    <p>{segmentTip(s, design.backbone.diameterCm)}</p>
                    {stepChecks.length > 0 && (
                      <div>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">When this step is folded, check:</p>
                        <CheckpointList items={stepChecks} done={done} toggle={toggle} onShow={onShowCheckpoint} />
                      </div>
                    )}
                    {!done(k) && (
                      <button className="btn btn-primary w-full py-1.5 text-xs" onClick={() => toggle(k)}>
                        Mark step {s.index + 1} folded
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <Disclosure title="Check the whole fold" meta={`${cpDone}/${CHECKPOINTS.length} checked`}>
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
          These parts of the chain touch in the real protein. Measure between the two marks on your model (center to center of the tubing): it
          should be close to the distance shown. A big miss means a strand or loop is out of place.
        </p>
        <CheckpointList items={CHECKPOINTS} done={done} toggle={toggle} onShow={onShowCheckpoint} />
      </Disclosure>
    </div>
  );
}

function CheckpointList({
  items,
  done,
  toggle,
  onShow,
}: {
  items: Checkpoint[];
  done: (k: string) => boolean;
  toggle: (k: string) => void;
  onShow: (c: Checkpoint) => void;
}) {
  return (
    <ul className="mt-1 divide-y divide-zinc-200/70 dark:divide-zinc-800">
      {items.map((c) => (
        <li key={c.key} className="flex items-center gap-2 py-1.5">
          <input type="checkbox" className="size-4 shrink-0 accent-emerald-600" checked={done(c.key)} onChange={() => toggle(c.key)} aria-label={`Checked ${c.a} to ${c.b}`} />
          <span className="min-w-0 flex-1">
            <span className="font-medium">
              {resLabel3(c.a)} ↔ {resLabel3(c.b)}
            </span>
            <span className="block text-[11px] text-zinc-500">
              marks {tooberCm(c.a)} ↔ {tooberCm(c.b)} cm
            </span>
          </span>
          <span className="shrink-0 font-mono text-xs font-semibold tabular-nums">{c.cm.toFixed(1)} cm</span>
          <button className="btn btn-secondary shrink-0 px-2 py-0.5 text-xs" onClick={() => onShow(c)}>
            Show
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Number input that lets you type freely ("0.", "1.2") and only commits valid values. */
function DiameterInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText((t) => (Number(t) === value ? t : String(value)));
  }, [value]);
  const v = Number(text);
  const valid = text.trim() !== "" && Number.isFinite(v) && v >= 0.1 && v <= 5;
  return (
    <input
      id="pm-diameter"
      type="number"
      inputMode="decimal"
      step="0.05"
      min="0.1"
      max="5"
      className={`input py-1.5 ${valid ? "" : "border-amber-400"}`}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value.trim() !== "" && Number.isFinite(n) && n >= 0.1 && n <= 5) onChange(n);
      }}
      onBlur={() => !valid && setText(String(value))}
    />
  );
}
