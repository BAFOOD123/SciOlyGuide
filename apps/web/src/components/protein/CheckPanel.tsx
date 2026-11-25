"use client";

import { useState } from "react";
import { checkpoints, type Segment } from "@/lib/protein/analysis";
import { ruleChecks, type ModelDesign } from "@/lib/protein/design";

const CP_COUNT = checkpoints().length;

const RESOURCES = [
  { label: "Official event page and rules (soinc.org)", href: "https://www.soinc.org/protein-modeling-c" },
  { label: "3D Molecular Designs event site (modified 3UBE file)", href: "https://learn.3dmoleculardesigns.com/science-olympiad-protein-modeling-event" },
  { label: "JUDE (the only viewer allowed at the event)", href: "https://learn.3dmoleculardesigns.com/digital-modeling-hub/jude_online_jmol" },
  { label: "3UBE at the RCSB Protein Data Bank", href: "https://www.rcsb.org/structure/3UBE" },
  { label: "Xu et al. 2012, J. Virol. (the reference paper)", href: "https://journals.asm.org/doi/10.1128/JVI.06322-11" },
];

export function CheckPanel({
  design,
  update,
  segs,
  extent,
  onReset,
}: {
  design: ModelDesign;
  update: (fn: (d: ModelDesign) => ModelDesign) => void;
  segs: Segment[];
  extent: { x: number; y: number; z: number; maxSpan: number };
  onReset: () => void;
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const steps = segs.filter((s) => design.progress[`seg-${s.index}`]).length;
  const cps = Object.keys(design.progress).filter((k) => k.startsWith("cp-") && design.progress[k]).length;
  const checks = [
    ...ruleChecks(design, extent.maxSpan),
    { key: "folded", ok: steps === segs.length, label: "Every folding step done", detail: `${steps}/${segs.length} steps` },
    { key: "verified", ok: cps >= CP_COUNT, label: "Fold checkpoints measured", detail: `${cps}/${CP_COUNT} checked (Build tab)` },
  ];
  return (
    <div className="space-y-4 text-sm">
      <ul className="space-y-1.5">
        {checks.map((c) => (
          <li key={c.key} className="flex items-start gap-2">
            <span
              className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${c.ok ? "bg-emerald-500" : "bg-amber-500"}`}
              aria-label={c.ok ? "Done" : "Needs work"}
            >
              {c.ok ? "✓" : "!"}
            </span>
            <span>
              <span className="font-medium">{c.label}</span>
              {c.detail && <span className="block text-xs text-zinc-500">{c.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-zinc-500">
        Backbone size on the model: {extent.x.toFixed(1)} × {extent.y.toFixed(1)} × {extent.z.toFixed(1)} cm along the x, y and z axes (alpha
        carbons; side chains and the receptor add a little). Turn on “50 cm box” to see the limit at scale.
      </p>
      <div className="rounded-xl bg-zinc-100 p-3 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
        <strong>Also in the rules:</strong> no 3D-printed backbone (3D-printed features are fine); judges must be able to lift it off any stand and
        rotate it; the model and legend are impounded. Check the official manual for your level’s rubric.
      </div>
      <label className="block" htmlFor="pm-notes">
        <span className="mb-0.5 block font-semibold">Build notes</span>
        <textarea
          id="pm-notes"
          className="input"
          rows={5}
          maxLength={4000}
          placeholder="What’s left to do, judges’ feedback, questions for your partner…"
          value={design.notes}
          onChange={(e) => update((d) => ({ ...d, notes: e.target.value }))}
        />
      </label>
      <div>
        <h3 className="mb-1 font-semibold">Resources</h3>
        <ul className="space-y-1">
          {RESOURCES.map((r) => (
            <li key={r.href}>
              <a className="text-brand-600 hover:underline dark:text-brand-300" href={r.href} target="_blank" rel="noreferrer">
                {r.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
        {confirmReset ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-2 text-xs dark:border-red-900 dark:bg-red-950/40">
            <span className="min-w-0 flex-1">Clear all features, progress and notes and start over? You can undo right after.</span>
            <button
              className="btn px-2 py-1 text-xs bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                setConfirmReset(false);
                onReset();
              }}
            >
              Start over
            </button>
            <button className="btn btn-secondary px-2 py-1 text-xs" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-ghost px-2 py-1 text-xs text-red-600 dark:text-red-400" onClick={() => setConfirmReset(true)}>
            Start over with a blank design…
          </button>
        )}
      </div>
    </div>
  );
}
