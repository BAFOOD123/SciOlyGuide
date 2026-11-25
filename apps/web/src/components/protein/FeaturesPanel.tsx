"use client";

import { useState } from "react";
import { INTERACTION_INFO, resLabel3 } from "@/lib/protein/analysis";
import { customFeature, suggestions, type Feature, type ModelDesign, type Suggestion } from "@/lib/protein/design";
import { Field } from "./ui";

const KIND_LABEL: Record<Feature["kind"], string> = {
  backbone: "Backbone",
  sidechain: "Side chain",
  interaction: "Interaction",
  receptor: "Receptor",
  custom: "Custom",
};

export function FeaturesPanel({
  design,
  selected,
  onAdd,
  onPatch,
  onRemove,
  onShow,
}: {
  design: ModelDesign;
  selected: number | null;
  onAdd: (f: Feature) => void;
  onPatch: (id: string, patch: Partial<Feature>) => void;
  onRemove: (f: Feature) => void;
  onShow: (f: Feature) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const ideas = suggestions(design);
  const site = ideas.filter((s) => s.level !== "National");
  const stab = ideas.filter((s) => s.level === "National");
  const missingWhy = design.features.filter((f) => f.inLegend && !f.why.trim()).length;

  return (
    <div className="space-y-4 text-sm">
      <p className="text-zinc-600 dark:text-zinc-400">
        Everything you add to the backbone. Each feature is a row of your legend: <em>what</em> it is, <em>how</em> you show it, and{" "}
        <em>why</em> it matters. The “why” is what earns the points.
      </p>

      <section className="space-y-2">
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
        <ul className="space-y-1.5">
          {design.features.map((f) => {
            const open = openId === f.id;
            const needsWhy = f.inLegend && !f.why.trim();
            return (
              <li key={f.id} className={`rounded-xl border ${open ? "border-brand-300 dark:border-brand-800" : "border-zinc-200 dark:border-zinc-800"}`}>
                <button className="flex w-full items-center gap-2 px-3 py-2 text-left" aria-expanded={open} onClick={() => setOpenId(open ? null : f.id)}>
                  <span className="size-3 shrink-0 rounded-full border border-zinc-400" style={{ background: f.color }} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{f.what.trim() || <em className="font-normal text-zinc-400">Untitled feature</em>}</span>
                    <span className="block text-xs text-zinc-500">
                      {f.kind === "interaction" && f.interaction ? INTERACTION_INFO[f.interaction].label : KIND_LABEL[f.kind]}
                      {!f.inLegend && " · not in legend"}
                    </span>
                  </span>
                  {needsWhy && <span className="chip shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">needs why</span>}
                  <span className={`shrink-0 text-xs text-zinc-400 transition-transform ${open ? "rotate-90" : ""}`} aria-hidden>
                    ▶
                  </span>
                </button>
                {open && (
                  <div className="space-y-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
                    <Field id={`f-${f.id}-what`} label="What is displayed?" value={f.what} onChange={(v) => onPatch(f.id, { what: v })} max={300} />
                    <Field id={`f-${f.id}-how`} label="How is it displayed?" value={f.how} onChange={(v) => onPatch(f.id, { how: v })} max={300} />
                    <Field
                      id={`f-${f.id}-why`}
                      label="Why is it displayed?"
                      value={f.why}
                      onChange={(v) => onPatch(f.id, { why: v })}
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
                          onChange={(e) => onPatch(f.id, { color: e.target.value })}
                          className="size-6 cursor-pointer rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
                        />
                        {f.kind === "sidechain" ? "Color set by the rules" : "Color"}
                      </label>
                      <label className="flex items-center gap-1.5 text-xs" htmlFor={`f-${f.id}-legend`}>
                        <input id={`f-${f.id}-legend`} type="checkbox" className="accent-brand-600" checked={f.inLegend} onChange={(e) => onPatch(f.id, { inLegend: e.target.checked })} />
                        In legend
                      </label>
                      <span className="ml-auto flex gap-1.5">
                        {f.residues.length > 0 && (
                          <button className="btn btn-secondary px-2 py-1 text-xs" onClick={() => onShow(f)}>
                            Show in 3D
                          </button>
                        )}
                        <button
                          className="btn btn-ghost px-2 py-1 text-xs text-red-600 dark:text-red-400"
                          onClick={() => {
                            setOpenId(null);
                            onRemove(f);
                          }}
                        >
                          Remove
                        </button>
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {site.length > 0 && <SuggestionGroup title="Binding site" hint="State and National rubrics reward functionally relevant side chains." items={site} onAdd={onAdd} />}
      {stab.length > 0 && <SuggestionGroup title="Interactions that stabilize the fold" hint="National rubric: side chains that hold the structure together." items={stab} onAdd={onAdd} />}
    </div>
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
