"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveProteinDesign } from "@/app/protein-modeling/actions";
import {
  aminoAcid,
  caDistance,
  CM_PER_ANGSTROM,
  composition,
  FIRST,
  INTERACTION_INFO,
  interactions,
  LAST,
  modelExtentCm,
  PROPERTY_INFO,
  receptorContacts,
  RESIDUES,
  resLabel3,
  segments,
  SS_INFO,
  SUGAR_NAMES,
  TOOBER_LENGTH_CM,
  tooberCm,
  type Interaction,
  type Property,
  type Segment,
} from "@/lib/protein/analysis";
import {
  customFeature,
  defaultDesign,
  interactionFeature,
  parseDesign,
  ruleChecks,
  shownSideChains,
  sideChainFeature,
  suggestions,
  type Feature,
  type ModelDesign,
} from "@/lib/protein/design";
import { STRUCTURE } from "@/lib/protein/structure.generated";
import { MoleculeViewer, type ColorMode, type DisplayOptions, type ViewerHandle, type ViewName } from "./MoleculeViewer";
import { printBuildSheet, printLegend } from "./print";

type Tab = "inspect" | "features" | "build" | "legend" | "check";
type SaveState = "idle" | "saving" | "saved" | "error";

const TABS: { id: Tab; label: string }[] = [
  { id: "inspect", label: "Inspect" },
  { id: "features", label: "Features" },
  { id: "build", label: "Build" },
  { id: "legend", label: "Legend" },
  { id: "check", label: "Check" },
];

const COLOR_MODES: { id: ColorMode; label: string }[] = [
  { id: "model", label: "My model" },
  { id: "ss", label: "Secondary structure" },
  { id: "property", label: "Side-chain property" },
  { id: "rainbow", label: "N → C rainbow" },
];

const VIEW_BUTTONS: { id: ViewName; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
  { id: "left", label: "Left" },
  { id: "right", label: "Right" },
  { id: "top", label: "Top" },
  { id: "bottom", label: "Bottom" },
];

const STRUCTURE_SSBONDS = STRUCTURE.ssbonds;
const pairKey = (type: string | undefined, residues: number[]) => `${type}:${[...residues].sort((a, b) => a - b).join("-")}`;

export function ProteinStudio({ initial, savedAt }: { initial: ModelDesign; savedAt: number | null }) {
  const [design, setDesign] = useState<ModelDesign>(initial);
  const [saveState, setSaveState] = useState<SaveState>(savedAt ? "saved" : "idle");
  const [tab, setTab] = useState<Tab>("build");
  const [selected, setSelected] = useState<number | null>(null);
  const [measureMode, setMeasureMode] = useState(false);
  const [measure, setMeasure] = useState<number[]>([]);
  const [focus, setFocus] = useState<{ start: number; end: number } | null>(null);
  const [display, setDisplay] = useState<DisplayOptions>({
    color: "ss",
    atoms: false,
    allSideChains: false,
    receptor: true,
    allInteractions: false,
    labels: true,
    box: false,
  });
  const viewer = useRef<ViewerHandle | null>(null);

  // ---- autosave ----
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setSaveState("saving");
    const t = setTimeout(async () => {
      try {
        const res = await saveProteinDesign(design);
        setSaveState(res.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    }, 900);
    return () => clearTimeout(t);
  }, [design]);

  const update = useCallback((fn: (d: ModelDesign) => ModelDesign) => setDesign((d) => fn(d)), []);
  const patchFeature = (id: string, patch: Partial<Feature>) =>
    update((d) => ({ ...d, features: d.features.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  const removeFeature = (id: string) => update((d) => ({ ...d, features: d.features.filter((f) => f.id !== id) }));
  const addFeature = (f: Feature) => update((d) => ({ ...d, features: [...d.features, f] }));

  const onPick = useCallback(
    (n: number) => {
      if (measureMode) {
        setMeasure((m) => (m.length >= 2 ? [n] : m.includes(n) ? m : [...m, n]));
        return;
      }
      setSelected(n);
      setTab("inspect");
    },
    [measureMode],
  );

  const shown = useMemo(() => shownSideChains(design), [design]);
  const extent = useMemo(() => modelExtentCm(), []);
  const segs = useMemo(() => segments(), []);

  const showSegment = (s: { start: number; end: number }) => {
    setFocus((f) => (f && f.start === s.start && f.end === s.end ? null : { start: s.start, end: s.end }));
  };

  const screenshot = () => {
    const url = viewer.current?.screenshot();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "protein-model-view.png";
    a.click();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
      {/* ---------- left: viewer + sequence ---------- */}
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {VIEW_BUTTONS.map((v) => (
            <button key={v.id} className="btn btn-secondary px-2.5 py-1 text-xs" onClick={() => viewer.current?.setView(v.id)}>
              {v.label}
            </button>
          ))}
          <button className="btn btn-secondary px-2.5 py-1 text-xs" onClick={() => viewer.current?.fit()}>
            Reset zoom
          </button>
          <span className="mx-1 hidden h-5 w-px bg-zinc-300 sm:block dark:bg-zinc-700" />
          <button
            className={`btn px-2.5 py-1 text-xs ${measureMode ? "btn-primary" : "btn-secondary"}`}
            onClick={() => {
              setMeasureMode((m) => !m);
              setMeasure([]);
            }}
            aria-pressed={measureMode}
          >
            📏 Measure
          </button>
          <button className="btn btn-secondary px-2.5 py-1 text-xs" onClick={screenshot}>
            Save image
          </button>
          <SaveBadge state={saveState} />
        </div>

        <div className="relative h-[58vh] min-h-[360px]">
          <MoleculeViewer
            design={design}
            display={display}
            focus={focus}
            selected={selected}
            measure={measure}
            onPick={onPick}
            onReady={(h) => (viewer.current = h)}
          />
          {measureMode && (
            <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white">
              {measure.length < 2
                ? `Click ${measure.length ? "a second" : "a"} residue to measure (alpha carbon to alpha carbon)`
                : (() => {
                    const d = caDistance(measure[0]!, measure[1]!);
                    return `${resLabel3(measure[0]!)} ↔ ${resLabel3(measure[1]!)}: ${d.cm.toFixed(1)} cm on your model (${d.angstrom.toFixed(1)} Å)`;
                  })()}
            </div>
          )}
          {focus && (
            <button
              className="absolute right-3 top-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80"
              onClick={() => setFocus(null)}
            >
              Showing {focus.start}–{focus.end} · show all ✕
            </button>
          )}
        </div>

        <DisplayBar display={display} setDisplay={setDisplay} />

        <SequenceStrip selected={selected} shown={shown} focus={focus} measure={measureMode ? measure : []} onPick={onPick} />
        <ColorKey />
      </div>

      {/* ---------- right: panels ---------- */}
      <div className="card flex min-w-0 flex-col self-start lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)]">
        <div role="tablist" className="flex gap-0.5 border-b border-zinc-200 p-1.5 dark:border-zinc-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-brand-600 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {tab === "inspect" && (
            <InspectPanel
              n={selected}
              design={design}
              shown={shown}
              onToggleSideChain={(n) => {
                const f = design.features.find((x) => x.kind === "sidechain" && x.residues[0] === n);
                if (f) removeFeature(f.id);
                else addFeature(sideChainFeature(n));
              }}
              onAddInteraction={(it) => addFeature(interactionFeature(it))}
              onSelect={setSelected}
            />
          )}
          {tab === "features" && (
            <FeaturesPanel
              design={design}
              selected={selected}
              onAdd={addFeature}
              onPatch={patchFeature}
              onRemove={removeFeature}
              onFocus={(f) => {
                if (f.residues.length === 1) setSelected(f.residues[0]!);
                else if (f.residues.length > 1) setFocus({ start: Math.min(...f.residues), end: Math.max(...f.residues) });
              }}
            />
          )}
          {tab === "build" && (
            <BuildPanel design={design} update={update} segs={segs} focus={focus} onShow={showSegment} />
          )}
          {tab === "legend" && <LegendPanel design={design} setDesign={setDesign} />}
          {tab === "check" && <CheckPanel design={design} update={update} extentMax={extent.maxSpan} extent={extent} />}
        </div>
      </div>
    </div>
  );
}

// =====================================================================

function SaveBadge({ state }: { state: SaveState }) {
  const text = { idle: "Not saved yet", saving: "Saving…", saved: "Saved to your account", error: "Couldn't save — retrying on next change" }[state];
  const cls =
    state === "error"
      ? "text-red-600 dark:text-red-400"
      : state === "saved"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-zinc-500";
  return <span className={`ml-auto text-xs font-medium ${cls}`}>{text}</span>;
}

function DisplayBar({ display, setDisplay }: { display: DisplayOptions; setDisplay: (fn: (d: DisplayOptions) => DisplayOptions) => void }) {
  const toggles: { key: keyof DisplayOptions; label: string }[] = [
    { key: "receptor", label: "Receptor" },
    { key: "atoms", label: "Side-chain atoms" },
    { key: "allSideChains", label: "All side chains" },
    { key: "allInteractions", label: "All interactions" },
    { key: "labels", label: "Labels" },
    { key: "box", label: "50 cm box" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <label className="flex items-center gap-2">
        <span className="text-zinc-500">Color</span>
        <select
          className="input w-auto py-1"
          value={display.color}
          onChange={(e) => setDisplay((d) => ({ ...d, color: e.target.value as ColorMode }))}
        >
          {COLOR_MODES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      {toggles.map((t) => (
        <label key={t.key} className="flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            className="accent-brand-600"
            checked={display[t.key] as boolean}
            onChange={(e) => setDisplay((d) => ({ ...d, [t.key]: e.target.checked }))}
          />
          {t.label}
        </label>
      ))}
    </div>
  );
}

function SequenceStrip({
  selected,
  shown,
  focus,
  measure,
  onPick,
}: {
  selected: number | null;
  shown: Set<number>;
  focus: { start: number; end: number } | null;
  measure: number[];
  onPick: (n: number) => void;
}) {
  const rows = [RESIDUES.slice(0, 50), RESIDUES.slice(50)];
  return (
    <div className="card space-y-2 p-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Sequence · chain A {FIRST}–{LAST}</h2>
        <span className="text-xs text-zinc-500">Click a residue · bar = helix / strand · dot = side chain on model</span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[560px] space-y-2">
          {rows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-[repeat(50,minmax(0,1fr))] gap-px">
              {row.map((r) => {
                const aa = aminoAcid(r.aa);
                const p = PROPERTY_INFO[aa.property];
                const dim = focus && (r.n < focus.start || r.n > focus.end);
                const isSel = selected === r.n || measure.includes(r.n);
                return (
                  <button
                    key={r.n}
                    onClick={() => onPick(r.n)}
                    title={`${resLabel3(r.n)} · ${p.label} · ${SS_INFO[r.ss].label} · mark at ${tooberCm(r.n)} cm`}
                    className={`group flex flex-col items-center ${dim ? "opacity-35" : ""}`}
                  >
                    <span className="h-1.5 w-full" style={{ background: r.ss === "L" ? "transparent" : SS_INFO[r.ss].hex }} />
                    <span
                      className={`mt-0.5 grid h-5 w-full place-items-center rounded-sm font-mono text-[10px] font-semibold text-zinc-900 ${
                        isSel ? "ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-zinc-900" : ""
                      }`}
                      style={{ background: p.hex, boxShadow: aa.property === "hydrophilic" ? "inset 0 0 0 1px #a1a1aa" : undefined }}
                    >
                      {aa.one}
                    </span>
                    <span className="h-3 text-[8px] leading-3 text-zinc-500">
                      {r.n % 10 === 0 ? r.n : shown.has(r.n) ? "●" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorKey() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
      {(Object.keys(PROPERTY_INFO) as Property[]).map((k) => (
        <span key={k} className="flex items-center gap-1.5">
          <span className="size-3 rounded-full border border-zinc-400" style={{ background: PROPERTY_INFO[k].hex }} />
          {PROPERTY_INFO[k].label} ({PROPERTY_INFO[k].colorName})
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-4" style={{ background: SS_INFO.H.hex }} /> α-helix
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-4" style={{ background: SS_INFO.E.hex }} /> β-strand
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------

function InspectPanel({
  n,
  design,
  shown,
  onToggleSideChain,
  onAddInteraction,
  onSelect,
}: {
  n: number | null;
  design: ModelDesign;
  shown: Set<number>;
  onToggleSideChain: (n: number) => void;
  onAddInteraction: (it: Interaction) => void;
  onSelect: (n: number) => void;
}) {
  if (n == null) {
    const comp = composition();
    return (
      <div className="space-y-4 text-sm">
        <p className="text-zinc-600 dark:text-zinc-400">
          Click the backbone or a letter in the sequence to inspect a residue: its property color, where it sits on your backbone material,
          what it touches, and whether to put its side chain on your model.
        </p>
        <div>
          <h3 className="mb-1 font-semibold">What’s in residues {FIRST}–{LAST}</h3>
          <ul className="space-y-1">
            {(Object.keys(comp) as Property[]).map((k) => (
              <li key={k} className="flex items-center gap-2">
                <span className="size-3 rounded-full border border-zinc-400" style={{ background: PROPERTY_INFO[k].hex }} />
                <span className="w-28">{PROPERTY_INFO[k].label}</span>
                <span className="font-mono text-xs text-zinc-500">{comp[k].length} residues</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-1 font-semibold">Receptor-binding residues</h3>
          <p className="mb-2 text-xs text-zinc-500">Side chains within 4 Å of the bound receptor (LSTc) in 3UBE.</p>
          <div className="flex flex-wrap gap-1.5">
            {receptorContacts()
              .filter((c) => c.sideChain)
              .map((c) => (
                <button key={c.n} className="chip bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200 dark:bg-fuchsia-950 dark:text-fuchsia-200" onClick={() => onSelect(c.n)}>
                  {resLabel3(c.n)}
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  }
  const r = RESIDUES[n - FIRST]!;
  const aa = aminoAcid(r.aa);
  const prop = PROPERTY_INFO[aa.property];
  const seg = segments().find((s) => n >= s.start && n <= s.end)!;
  const contact = receptorContacts().find((c) => c.n === n);
  const mine = interactions().filter((it) => it.a === n || it.b === n);
  const added = new Set(design.features.filter((f) => f.kind === "interaction").map((f) => pairKey(f.interaction, f.residues)));
  const ss = STRUCTURE_SSBONDS.filter((s) => s.residue === n);
  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-start gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-full font-mono text-lg font-bold text-zinc-900"
          style={{ background: prop.hex, boxShadow: "inset 0 0 0 1px #a1a1aa" }}
        >
          {aa.one}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight">
            {aa.name} {n}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            {aa.three[0]}
            {aa.three.slice(1).toLowerCase()} · {prop.label} → <strong>{prop.colorName}</strong>
          </p>
        </div>
        <div className="ml-auto flex gap-1">
          <button className="btn btn-ghost px-2 py-1" disabled={n <= FIRST} onClick={() => onSelect(n - 1)} aria-label="Previous residue">
            ‹
          </button>
          <button className="btn btn-ghost px-2 py-1" disabled={n >= LAST} onClick={() => onSelect(n + 1)} aria-label="Next residue">
            ›
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-zinc-500">Structure</dt>
        <dd>
          {SS_INFO[seg.ss].label} {seg.start}–{seg.end}
        </dd>
        <dt className="text-zinc-500">On your backbone</dt>
        <dd>
          mark at <strong>{tooberCm(n)} cm</strong> from the N-terminal end
        </dd>
        {contact && (
          <>
            <dt className="text-zinc-500">Receptor</dt>
            <dd>
              {contact.hbond ? "Hydrogen-bonds" : "Contacts"} the {contact.sugars.map((s) => SUGAR_NAMES[s] ?? s).join(" + ")} ({contact.distance.toFixed(1)} Å
              {contact.sideChain ? ", side chain" : ", backbone only"})
            </dd>
          </>
        )}
        {ss.map((s) => (
          <FragmentRow key={s.partnerChain} label="Disulfide">
            to Cys{s.partnerResidue} of a <em>neighboring</em> HA1 chain ({s.partnerChain}) in the trimer — a good “why” for a green side chain
          </FragmentRow>
        ))}
      </dl>

      <button className={`btn w-full ${shown.has(n) && design.features.some((f) => f.kind === "sidechain" && f.residues[0] === n) ? "btn-secondary" : "btn-primary"}`} onClick={() => onToggleSideChain(n)}>
        {design.features.some((f) => f.kind === "sidechain" && f.residues[0] === n) ? "Remove side chain from my model" : `Put a ${prop.colorName} side chain on my model`}
      </button>

      <div>
        <h4 className="mb-1.5 font-semibold">Interactions ({mine.length})</h4>
        {mine.length === 0 && <p className="text-zinc-500">No side-chain interactions found for this residue within the fragment.</p>}
        <ul className="space-y-1.5">
          {mine.map((it) => {
            const other = it.a === n ? it.b : it.a;
            const info = INTERACTION_INFO[it.type];
            const isAdded = added.has(pairKey(it.type, [it.a, it.b]));
            const d = caDistance(it.a, it.b);
            return (
              <li key={`${it.type}-${it.a}-${it.b}`} className="flex items-center gap-2 rounded-lg border border-zinc-200 px-2 py-1.5 dark:border-zinc-800">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: info.hex }} />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{info.label}</span> with{" "}
                  <button className="font-medium text-brand-600 hover:underline dark:text-brand-300" onClick={() => onSelect(other)}>
                    {resLabel3(other)}
                  </button>
                  <span className="block text-xs text-zinc-500">
                    {it.atomA}…{it.atomB} {it.distance.toFixed(1)} Å · alpha carbons {d.cm.toFixed(1)} cm apart on the model
                  </span>
                </span>
                <button className="btn btn-secondary shrink-0 px-2 py-1 text-xs" disabled={isAdded} onClick={() => onAddInteraction(it)}>
                  {isAdded ? "Added" : "+ Add"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function FragmentRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-zinc-500">{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

// ---------------------------------------------------------------------

function FeaturesPanel({
  design,
  selected,
  onAdd,
  onPatch,
  onRemove,
  onFocus,
}: {
  design: ModelDesign;
  selected: number | null;
  onAdd: (f: Feature) => void;
  onPatch: (id: string, patch: Partial<Feature>) => void;
  onRemove: (id: string) => void;
  onFocus: (f: Feature) => void;
}) {
  const ideas = suggestions(design);
  const [showIdeas, setShowIdeas] = useState(true);
  return (
    <div className="space-y-4 text-sm">
      <p className="text-zinc-600 dark:text-zinc-400">
        Everything you add to the backbone. Each feature becomes a row of your Model Description Legend: <em>what</em> it is,{" "}
        <em>how</em> you show it, and <em>why</em> it matters (the “why” earns the points).
      </p>

      <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-3 dark:border-brand-900 dark:bg-brand-950/30">
        <button className="flex w-full items-center justify-between font-semibold" onClick={() => setShowIdeas((s) => !s)}>
          Suggested features ({ideas.length}) <span>{showIdeas ? "▾" : "▸"}</span>
        </button>
        {showIdeas && (
          <ul className="mt-2 space-y-1.5">
            {ideas.map((s) => (
              <li key={s.key} className="flex items-center gap-2">
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{s.title}</span>
                  <span className="block text-xs text-zinc-500">
                    {s.detail} · <span className="font-medium">{s.level}</span>
                  </span>
                </span>
                <button className="btn btn-secondary shrink-0 px-2 py-1 text-xs" onClick={() => onAdd(s.build())}>
                  + Add
                </button>
              </li>
            ))}
            {ideas.length === 0 && <li className="text-zinc-500">You’ve added every suggestion.</li>}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Your features ({design.features.length})</h3>
        <button className="btn btn-secondary px-2 py-1 text-xs" onClick={() => onAdd(customFeature(selected != null ? [selected] : []))}>
          + Custom{selected != null ? ` at ${resLabel3(selected)}` : ""}
        </button>
      </div>
      <ul className="space-y-3">
        {design.features.map((f) => (
          <li key={f.id} className="space-y-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={f.color}
                disabled={f.kind === "sidechain"}
                title={f.kind === "sidechain" ? "Side-chain colors are set by the rules" : "Color on your model"}
                onChange={(e) => onPatch(f.id, { color: e.target.value })}
                className="size-6 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
              />
              <span className="chip bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {f.kind === "interaction" && f.interaction ? INTERACTION_INFO[f.interaction].label : f.kind}
              </span>
              {f.residues.length > 0 && (
                <button className="truncate text-xs font-medium text-brand-600 hover:underline dark:text-brand-300" onClick={() => onFocus(f)}>
                  {f.residues.slice(0, 6).map(resLabel3).join(", ")}
                  {f.residues.length > 6 ? "…" : ""}
                </button>
              )}
              <label className="ml-auto flex shrink-0 items-center gap-1 text-xs text-zinc-500">
                <input type="checkbox" className="accent-brand-600" checked={f.inLegend} onChange={(e) => onPatch(f.id, { inLegend: e.target.checked })} />
                Legend
              </label>
              <button className="btn btn-ghost shrink-0 px-1.5 py-0.5 text-xs" onClick={() => onRemove(f.id)} aria-label="Remove feature">
                ✕
              </button>
            </div>
            <Field label="What" value={f.what} onChange={(v) => onPatch(f.id, { what: v })} max={300} />
            <Field label="How" value={f.how} onChange={(v) => onPatch(f.id, { how: v })} max={300} />
            <Field label="Why" value={f.why} onChange={(v) => onPatch(f.id, { why: v })} max={600} multiline warn={!f.why.trim()} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  max,
  multiline,
  warn,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  multiline?: boolean;
  warn?: boolean;
}) {
  const cls = `input py-1.5 ${warn ? "border-amber-400 dark:border-amber-600" : ""}`;
  return (
    <label className="block">
      <span className="mb-0.5 block text-xs font-medium text-zinc-500">
        {label}
        {warn && <span className="ml-1 text-amber-600 dark:text-amber-400">— explain why this matters</span>}
      </span>
      {multiline ? (
        <textarea className={cls} rows={2} maxLength={max} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={cls} maxLength={max} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

// ---------------------------------------------------------------------

function segmentTip(s: Segment, diameterCm: number): string {
  const span = caDistance(s.start, s.end).cm;
  if (s.ss === "H") {
    const turns = s.length / 3.6;
    const cylinder = Math.max(0.3, 2.3 * 2 * CM_PER_ANGSTROM - diameterCm);
    return `Right-handed α-helix: ${turns.toFixed(1)} turns (3.6 residues per turn, ${(3.6 * 2).toFixed(1)} cm of material per turn). Its alpha carbons sit on a ${(4.6 * CM_PER_ANGSTROM).toFixed(1)} cm-wide cylinder, so wrap your ${diameterCm} cm tubing around something about ${cylinder.toFixed(1)} cm across. Finished helix: ${span.toFixed(1)} cm end to end.`;
  }
  if (s.ss === "E") {
    const pair = s.partners.length
      ? ` It lies beside ${s.partners.map((p) => `${p.start}–${p.end} (${p.parallel ? "parallel" : "antiparallel"})`).join(" and ")}; paired strands sit about ${(5 * CM_PER_ANGSTROM).toFixed(1)}–${(5.5 * CM_PER_ANGSTROM).toFixed(1)} cm apart.`
      : "";
    return s.length === 1
      ? `A single residue that pairs in the sheet.${pair}`
      : `Extended β-strand with a gentle zig-zag (pleat): ${s.length} residues (${s.cm} cm of material) stretch to about ${span.toFixed(1)} cm end to end.${pair}`;
  }
  return `Loop of ${s.length} residues (${s.cm} cm of material). Its two ends are ${span.toFixed(1)} cm apart on the model — bend it until they are.`;
}

function BuildPanel({
  design,
  update,
  segs,
  focus,
  onShow,
}: {
  design: ModelDesign;
  update: (fn: (d: ModelDesign) => ModelDesign) => void;
  segs: Segment[];
  focus: { start: number; end: number } | null;
  onShow: (s: Segment) => void;
}) {
  const done = (k: string) => !!design.progress[k];
  const toggle = (k: string) => update((d) => ({ ...d, progress: { ...d.progress, [k]: !d.progress[k] } }));
  const doneCount = segs.filter((s) => done(`seg-${s.index}`)).length;
  const nextIdx = segs.find((s) => !done(`seg-${s.index}`))?.index;
  const ends = caDistance(FIRST, LAST);
  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-2">
        <h3 className="font-semibold">Backbone</h3>
        <div className="grid grid-cols-2 gap-2">
          <label className="col-span-2 block">
            <span className="mb-0.5 block text-xs font-medium text-zinc-500">Material</span>
            <input
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
          <label className="block">
            <span className="mb-0.5 block text-xs font-medium text-zinc-500">Diameter (cm)</span>
            <input
              type="number"
              step="0.05"
              min="0.5"
              max="2"
              className="input py-1.5"
              value={design.backbone.diameterCm}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v) && v >= 0.1 && v <= 5) update((d) => ({ ...d, backbone: { ...d.backbone, diameterCm: v } }));
              }}
            />
          </label>
          <label className="block">
            <span className="mb-0.5 block text-xs font-medium text-zinc-500">Color</span>
            <input
              type="color"
              className="h-9 w-full cursor-pointer rounded-xl border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900"
              value={design.backbone.color}
              onChange={(e) => update((d) => ({ ...d, backbone: { ...d.backbone, color: e.target.value } }))}
            />
          </label>
          <label className="col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-brand-600"
              checked={design.backbone.accentSS}
              onChange={(e) => update((d) => ({ ...d, backbone: { ...d.backbone, accentSS: e.target.checked } }))}
            />
            Accent the helix and strands (rest stays gray) in “My model” view
          </label>
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            Cut <strong>{TOOBER_LENGTH_CM} cm</strong> of {design.backbone.material || "backbone material"} (2 cm × 100 residues).
          </li>
          <li>
            Mark each alpha carbon at the <strong>center</strong> of its 2 cm: {FIRST} at 1 cm, {FIRST + 1} at 3 cm … {LAST} at {TOOBER_LENGTH_CM - 1} cm. Label every 10th.
          </li>
          <li>Mark the helix and strand boundaries below, then fold them first, in order.</li>
        </ol>
        <button className="btn btn-secondary w-full" onClick={() => printBuildSheet(design)}>
          🖨 Print build sheet (every residue’s mark)
        </button>
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <h3 className="font-semibold">Folding steps</h3>
          <span className="text-xs text-zinc-500">
            {doneCount}/{segs.length} done
          </span>
        </div>
        <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(doneCount / segs.length) * 100}%` }} />
        </div>
        <ul className="space-y-1.5">
          {segs.map((s) => {
            const k = `seg-${s.index}`;
            const active = focus && focus.start === s.start && focus.end === s.end;
            return (
              <li
                key={k}
                className={`rounded-lg border px-2.5 py-2 ${
                  s.index === nextIdx ? "border-brand-400 bg-brand-50/50 dark:border-brand-700 dark:bg-brand-950/30" : "border-zinc-200 dark:border-zinc-800"
                } ${done(k) ? "opacity-60" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="accent-emerald-600" checked={done(k)} onChange={() => toggle(k)} aria-label={`Step ${s.index + 1} done`} />
                  <span className="h-3 w-1.5 rounded-sm" style={{ background: SS_INFO[s.ss].hex }} />
                  <span className="font-medium">
                    {s.index + 1}. {SS_INFO[s.ss].label} {s.start === s.end ? s.start : `${s.start}–${s.end}`}
                  </span>
                  <span className="ml-auto font-mono text-xs text-zinc-500">
                    {s.fromCm}–{s.toCm} cm
                  </span>
                  <button className={`btn px-2 py-0.5 text-xs ${active ? "btn-primary" : "btn-secondary"}`} onClick={() => onShow(s)}>
                    {active ? "Showing" : "Show"}
                  </button>
                </div>
                {(s.index === nextIdx || active) && (
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{segmentTip(s, design.backbone.diameterCm)}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl bg-zinc-100 p-3 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
        <strong>Check the tertiary fold:</strong> the N-terminus ({resLabel3(FIRST)}) and C-terminus ({resLabel3(LAST)}) end up only{" "}
        <strong>{ends.cm.toFixed(1)} cm</strong> apart — they pair in the same β-sheet. Use 📏 Measure for any other pair and compare with
        your physical model, and match the Front/Top/Right views against JUDE.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------

function LegendPanel({ design, setDesign }: { design: ModelDesign; setDesign: (d: ModelDesign) => void }) {
  const rows = design.features.filter((f) => f.inLegend);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "protein-model-design.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importJson = async (file: File) => {
    try {
      const raw = JSON.parse(await file.text());
      const d = parseDesign(raw);
      if (JSON.stringify(d) === JSON.stringify(defaultDesign()) || !raw || raw.v !== 1) throw new Error("bad");
      if (!confirm("Replace your current design with the imported one?")) return;
      setDesign(d);
      setMsg("Imported.");
    } catch {
      setMsg("That file isn’t a SciOlyGuide protein design.");
    }
  };
  return (
    <div className="space-y-4 text-sm">
      <label className="block">
        <span className="mb-0.5 block text-xs font-medium text-zinc-500">Legend title</span>
        <input className="input py-1.5" maxLength={80} value={design.title} onChange={(e) => setDesign({ ...design, title: e.target.value })} />
      </label>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-2 py-1.5">What is displayed?</th>
              <th className="px-2 py-1.5">How is it displayed?</th>
              <th className="px-2 py-1.5">Why is it displayed?</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.id} className="border-t border-zinc-100 align-top dark:border-zinc-800">
                <td className="px-2 py-1.5">{f.what || <em className="text-zinc-400">—</em>}</td>
                <td className="px-2 py-1.5">
                  <span className="mr-1 inline-block size-2.5 rounded-full border border-zinc-400 align-middle" style={{ background: f.color }} />
                  {f.how || <em className="text-zinc-400">—</em>}
                </td>
                <td className="px-2 py-1.5">{f.why || <em className="text-amber-600">missing</em>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-500">
        Prints on 8.5″ × 5.5″ (half-letter) paper, as the rules require. Edit rows in the Features tab. {rows.length > 9 && "That’s a lot of rows — keep the text short so it stays readable."}
      </p>
      <button className="btn btn-primary w-full" onClick={() => printLegend(design)}>
        🖨 Print legend (8.5″ × 5.5″)
      </button>
      <div className="space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <h3 className="font-semibold">Share with your partner</h3>
        <p className="text-xs text-zinc-500">Download your design as a file; your partner can import it into their account.</p>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex-1" onClick={exportJson}>
            Export file
          </button>
          <button className="btn btn-secondary flex-1" onClick={() => fileRef.current?.click()}>
            Import file
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importJson(f);
              e.target.value = "";
            }}
          />
        </div>
        {msg && <p className="text-xs text-zinc-600 dark:text-zinc-400">{msg}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------

function CheckPanel({
  design,
  update,
  extentMax,
  extent,
}: {
  design: ModelDesign;
  update: (fn: (d: ModelDesign) => ModelDesign) => void;
  extentMax: number;
  extent: { x: number; y: number; z: number };
}) {
  const checks = ruleChecks(design, extentMax);
  return (
    <div className="space-y-4 text-sm">
      <ul className="space-y-1.5">
        {checks.map((c) => (
          <li key={c.key} className="flex items-start gap-2">
            <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${c.ok ? "bg-emerald-500" : "bg-amber-500"}`}>
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
        Backbone size on the model: {extent.x.toFixed(1)} × {extent.y.toFixed(1)} × {extent.z.toFixed(1)} cm along the PDB x, y and z axes (alpha
        carbons only; side chains and the receptor add a little). Turn on “50 cm box” to see it at scale.
      </p>
      <div className="rounded-xl bg-zinc-100 p-3 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
        <strong>Also by the rules:</strong> no 3D-printed backbone (3D-printed features are fine); judges must be able to lift it off any stand
        and rotate it; model and legend are impounded. Check the official manual and the 3D Molecular Designs event page for your level’s rubric.
      </div>
      <label className="block">
        <span className="mb-0.5 block font-semibold">Build notes</span>
        <textarea
          className="input"
          rows={6}
          maxLength={4000}
          placeholder="What’s left to do, what the judges said last time, questions for your partner…"
          value={design.notes}
          onChange={(e) => update((d) => ({ ...d, notes: e.target.value }))}
        />
      </label>
    </div>
  );
}
