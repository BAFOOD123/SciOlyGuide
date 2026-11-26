"use client";

import { useState } from "react";
import { INTERACTION_INFO, RESIDUES, FIRST, resLabel3 } from "@/lib/protein/analysis";
import { customFeature, suggestions, type Feature, type ModelDesign, type Suggestion } from "@/lib/protein/design";
import { Field } from "./ui";

const KIND_LABEL: Record<Feature["kind"], string> = {
  backbone: "Backbone",
  sidechain: "Side chain",
  interaction: "Bond",
  receptor: "Receptor",
  custom: "Custom",
};

const GROUPS: { title: string; kinds: Feature["kind"][]; removable?: Feature["kind"] }[] = [
  { title: "Side chains", kinds: ["sidechain"], removable: "sidechain" },
  { title: "Bonds", kinds: ["interaction"], removable: "interaction" },
  { title: "Receptor and other features", kinds: ["receptor", "custom"] },
  { title: "Backbone", kinds: ["backbone"] },
];

const hasSideChainAtoms = (n: number) => RESIDUES[n - FIRST]?.aa !== "GLY";

export function FeaturesPanel({
  design,
  selected,
  onAdd,
  onPatch,
  onRemove,
  onRemoveGroup,
  onShow,
  onToggleAtoms,
  onSetAtoms,
}: {
  design: ModelDesign;
  selected: number | null;
  onAdd: (f: Feature) => void;
  onPatch: (id: string, patch: Partial<Feature>) => void;
  onRemove: (f: Feature) => void;
  onRemoveGroup: (kind: Feature["kind"]) => void;
  onShow: (f: Feature) => void;
  onToggleAtoms: (n: number) => void;
  onSetAtoms: (ns: number[], on: boolean) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmGroup, setConfirmGroup] = useState<Feature["kind"] | null>(null);
  const ideas = suggestions(design);
  const site = ideas.filter((s) => s.level !== "National");
  const stab = ideas.filter((s) => s.level === "National");
  const missingWhy = design.features.filter((f) => f.inLegend && !f.why.trim()).length;
  const atoms = new Set(design.atoms);

  return (
    <div className="space-y-4 text-sm">
      <p className="text-zinc-600 dark:text-zinc-400">
        Everything you’ve added to the backbone. Tap a row to edit its legend text; ✕ removes it (you can undo). Each row is a line of your legend:{" "}
        <em>what</em>, <em>how</em> and <em>why</em>. The “why” earns the points.
      </p>

      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">
          On your model ({design.features.length})
          {missingWhy > 0 && <span className="ml-2 chip bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">{missingWhy} need a why</span>}
        </h3>
        <button
          className="btn btn-secondary shrink-0 px-2 py-1 text-xs"
          onClick={() => {
            const f = customFeature(selected != null ? [selected] : []);
            onAdd(f);
            setOpenId(f.id);
          }}
        >
          + Custom{selected != null ? ` at ${resLabel3(selected)}` : ""}
        </button>
      </div>

      {GROUPS.map((g) => {
        const items = design.features.filter((f) => g.kinds.includes(f.kind));
        if (!items.length) return null;
        const scResidues = g.removable === "sidechain" ? items.map((f) => f.residues[0]!).filter(hasSideChainAtoms) : [];
        const allAtoms = scResidues.length > 0 && scResidues.every((n) => atoms.has(n));
        return (
          <section key={g.title} className="space-y-1.5" aria-label={g.title}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {g.title} <span className="tabular-nums">({items.length})</span>
              </h4>
              <span className="ml-auto flex items-center gap-1">
                {scResidues.length > 0 && (
                  <button className="btn btn-ghost px-1.5 py-0.5 text-xs" onClick={() => onSetAtoms(scResidues, !allAtoms)}>
                    {allAtoms ? "Hide all atoms" : "Show all atoms"}
                  </button>
                )}
                {g.removable && items.length > 1 && (
                  <button className="btn btn-ghost px-1.5 py-0.5 text-xs text-red-600 dark:text-red-400" onClick={() => setConfirmGroup(g.removable!)}>
                    Remove all
                  </button>
                )}
              </span>
            </div>
            {confirmGroup && confirmGroup === g.removable && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-red-300 bg-red-50 p-2 text-xs dark:border-red-900 dark:bg-red-950/40">
                <span className="min-w-0 flex-1">
                  Remove all {items.length} {g.title.toLowerCase()}
                  {g.removable === "sidechain" ? " and the bonds that use them" : ""}? You can undo.
                </span>
                <button
                  className="btn bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                  onClick={() => {
                    setConfirmGroup(null);
                    onRemoveGroup(g.removable!);
                  }}
                >
                  Remove all
                </button>
                <button className="btn btn-secondary px-2 py-1 text-xs" onClick={() => setConfirmGroup(null)}>
                  Cancel
                </button>
              </div>
            )}
            <ul className="space-y-1.5">
              {items.map((f) => (
                <FeatureRow
                  key={f.id}
                  f={f}
                  open={openId === f.id}
                  onToggleOpen={() => setOpenId(openId === f.id ? null : f.id)}
                  atomsOn={f.kind === "sidechain" ? atoms.has(f.residues[0]!) : null}
                  onToggleAtoms={() => onToggleAtoms(f.residues[0]!)}
                  onPatch={(patch) => onPatch(f.id, patch)}
                  onRemove={() => {
                    if (openId === f.id) setOpenId(null);
                    onRemove(f);
                  }}
                  onShow={() => onShow(f)}
                />
              ))}
            </ul>
          </section>
        );
      })}

      {site.length > 0 && <SuggestionGroup title="Binding site" hint="State and National rubrics reward functionally relevant side chains." items={site} onAdd={onAdd} />}
      {stab.length > 0 && <SuggestionGroup title="Bonds that stabilize the fold" hint="National rubric: side chains that hold the structure together." items={stab} onAdd={onAdd} />}
    </div>
  );
}

function FeatureRow({
  f,
  open,
  onToggleOpen,
  atomsOn,
  onToggleAtoms,
  onPatch,
  onRemove,
  onShow,
}: {
  f: Feature;
  open: boolean;
  onToggleOpen: () => void;
  /** null: not a side chain (no atoms toggle). */
  atomsOn: boolean | null;
  onToggleAtoms: () => void;
  onPatch: (patch: Partial<Feature>) => void;
  onRemove: () => void;
  onShow: () => void;
}) {
  const needsWhy = f.inLegend && !f.why.trim();
  const title = f.what.trim() || "Untitled feature";
  const canAtoms = atomsOn != null && hasSideChainAtoms(f.residues[0]!);
  return (
    <li className={`rounded-xl border ${open ? "border-brand-300 dark:border-brand-800" : "border-zinc-200 dark:border-zinc-800"}`}>
      <div className="flex items-center gap-1 pr-1.5">
        <button className="flex min-w-0 flex-1 items-center gap-2 py-2 pl-3 text-left" aria-expanded={open} onClick={onToggleOpen}>
          <span className="size-3 shrink-0 rounded-full border border-zinc-400" style={{ background: f.color }} aria-hidden />
          <span className="min-w-0 flex-1">
            <span className={`block truncate font-medium ${f.what.trim() ? "" : "font-normal italic text-zinc-400"}`}>{title}</span>
            <span className="block text-xs text-zinc-500">
              {f.kind === "interaction" && f.interaction ? INTERACTION_INFO[f.interaction].label : KIND_LABEL[f.kind]}
              {!f.inLegend && " · not in legend"}
              {needsWhy && <span className="text-amber-700 dark:text-amber-400"> · needs a why</span>}
            </span>
          </span>
        </button>
        {canAtoms && (
          <button
            className={`shrink-0 rounded-md px-1.5 py-1 text-[11px] font-semibold ${
              atomsOn ? "bg-brand-600 text-white" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            onClick={onToggleAtoms}
            aria-pressed={!!atomsOn}
            aria-label={`${atomsOn ? "Hide" : "Show"} atoms of ${title}`}
            title={atomsOn ? "Hide its atoms in 3D" : "Show its atoms in 3D"}
          >
            Atoms
          </button>
        )}
        {f.residues.length > 0 && f.residues.length <= 2 && (
          <button
            className="shrink-0 rounded-md px-1.5 py-1 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={onShow}
            title="Show it in 3D"
          >
            Show
          </button>
        )}
        <button
          className="grid size-7 shrink-0 place-items-center rounded-md text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          title="Remove (you can undo)"
        >
          ✕
        </button>
      </div>
      {open && (
        <div className="space-y-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
          <Field id={`f-${f.id}-what`} label="What is displayed?" value={f.what} onChange={(v) => onPatch({ what: v })} max={300} />
          <Field id={`f-${f.id}-how`} label="How is it displayed?" value={f.how} onChange={(v) => onPatch({ how: v })} max={300} />
          <Field
            id={`f-${f.id}-why`}
            label="Why is it displayed?"
            value={f.why}
            onChange={(v) => onPatch({ why: v })}
            max={600}
            multiline
            warn={needsWhy ? "explain how it relates to structure or function" : undefined}
          />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            <label className="flex items-center gap-1.5 text-xs" htmlFor={`f-${f.id}-color`}>
              <input
                id={`f-${f.id}-color`}
                type="color"
                value={f.color}
                disabled={f.kind === "sidechain"}
                onChange={(e) => onPatch({ color: e.target.value })}
                className="size-6 cursor-pointer rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
              />
              {f.kind === "sidechain" ? "Color set by the rules" : "Color"}
            </label>
            <label className="flex items-center gap-1.5 text-xs" htmlFor={`f-${f.id}-legend`}>
              <input id={`f-${f.id}-legend`} type="checkbox" className="accent-brand-600" checked={f.inLegend} onChange={(e) => onPatch({ inLegend: e.target.checked })} />
              In legend
            </label>
            <button className="btn btn-ghost ml-auto px-2 py-1 text-xs text-red-600 dark:text-red-400" onClick={onRemove}>
              Remove{f.kind === "sidechain" ? " side chain" : ""}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function SuggestionGroup({ title, hint, items, onAdd }: { title: string; hint: string; items: Suggestion[]; onAdd: (f: Feature) => void }) {
  const [all, setAll] = useState(false);
  const shown = all ? items : items.slice(0, 6);
  return (
    <section className="rounded-xl border border-brand-200 bg-brand-50/60 p-3 dark:border-brand-900 dark:bg-brand-950/30">
      <h3 className="font-semibold">Suggested: {title}</h3>
      <p className="mb-2 text-xs text-zinc-500">{hint}</p>
      <ul className="space-y-1.5">
        {shown.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span className="min-w-0 flex-1">
              <span className="font-medium">{s.title}</span>
              <span className="block text-xs text-zinc-500">{s.detail}</span>
            </span>
            <button className="btn btn-secondary shrink-0 px-2 py-1 text-xs" onClick={() => onAdd(s.build())}>
              + Add
            </button>
          </li>
        ))}
      </ul>
      {items.length > 6 && (
        <button className="mt-2 text-xs font-medium text-brand-600 hover:underline dark:text-brand-300" onClick={() => setAll((a) => !a)}>
          {all ? "Show fewer" : `Show ${items.length - 6} more`}
        </button>
      )}
    </section>
  );
}
