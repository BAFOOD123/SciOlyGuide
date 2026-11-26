"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveProteinDesign } from "@/app/protein-modeling/actions";
import { offerFile } from "@/components/protein/platform";
import {
  aminoAcid,
  caDistance,
  FIRST,
  INTERACTION_INFO,
  LAST,
  modelExtentCm,
  PROPERTY_INFO,
  RESIDUES,
  resLabel3,
  segments,
  SS_INFO,
  tooberCm,
  type Property,
} from "@/lib/protein/analysis";
import {
  defaultDesign,
  interactionFeature,
  shownSideChains,
  sideChainFeature,
  sideChainStatus,
  withoutSideChain,
  type Feature,
  type ModelDesign,
} from "@/lib/protein/design";
import { BuildPanel } from "./BuildPanel";
import { CheckPanel } from "./CheckPanel";
import { FeaturesPanel } from "./FeaturesPanel";
import { InspectPanel } from "./InspectPanel";
import { LegendPanel } from "./LegendPanel";
import { MoleculeViewer, type ColorMode, type DisplayOptions, type ViewerHandle, type ViewName } from "./MoleculeViewer";

type Tab = "build" | "inspect" | "features" | "legend" | "check";
type SaveState = "idle" | "saving" | "saved" | "error";

const TABS: { id: Tab; label: string }[] = [
  { id: "build", label: "Build" },
  { id: "inspect", label: "Inspect" },
  { id: "features", label: "Features" },
  { id: "legend", label: "Legend" },
  { id: "check", label: "Check" },
];

const COLOR_MODES: { id: ColorMode; label: string }[] = [
  { id: "ss", label: "Helix / strand / loop" },
  { id: "model", label: "My model’s colors" },
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

const INTRO_KEY = "pm-intro-hidden";
const ALONG_KEY = "pm-build-along";

function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeLocal(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* blocked storage: the preference just isn't remembered */
  }
}

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

export function ProteinStudio({
  initial,
  savedAt,
  savedText = "Saved to your account",
  compactHeader = false,
}: {
  initial: ModelDesign;
  savedAt: number | null;
  /** What the save badge says once a save succeeds (where the design went). */
  savedText?: string;
  /** No site header above the studio (standalone page): the side panel sticks to the top. */
  compactHeader?: boolean;
}) {
  const [design, setDesign] = useState<ModelDesign>(initial);
  const past = useRef<{ design: ModelDesign; label: string }[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string; undo: boolean } | null>(null);
  const [saveState, setSaveState] = useState<SaveState>(savedAt ? "saved" : "idle");
  const [saveNonce, setSaveNonce] = useState(0);
  const [tab, setTab] = useState<Tab>("build");
  const [selected, setSelected] = useState<number | null>(null);
  const [measureMode, setMeasureMode] = useState(false);
  const [measure, setMeasure] = useState<number[]>([]);
  const [focus, setFocus] = useState<{ start: number; end: number } | null>(null);
  const [buildAlong, setBuildAlongState] = useState(false);
  const [introHidden, setIntroHidden] = useState(true);
  const [display, setDisplay] = useState<DisplayOptions>({
    color: "ss",
    allSideChains: false,
    receptor: true,
    allInteractions: false,
    labels: true,
    box: false,
  });
  const viewer = useRef<ViewerHandle | null>(null);

  // Per-device preferences (read after mount so server and client render the same).
  useEffect(() => {
    setIntroHidden(readLocal(INTRO_KEY) === "1");
    setBuildAlongState(readLocal(ALONG_KEY) === "1");
  }, []);
  const setBuildAlong = (v: boolean) => {
    setBuildAlongState(v);
    writeLocal(ALONG_KEY, v ? "1" : "0");
    if (v) setFocus(null);
  };

  // ---- autosave: debounced, retried after a failure, flushed when the tab is hidden ----
  const latest = useRef(design);
  latest.current = design;
  const dirty = useRef(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    dirty.current = true;
    setSaveState("saving");
    let retry: ReturnType<typeof setTimeout> | undefined;
    const t = setTimeout(async () => {
      try {
        const res = await saveProteinDesign(latest.current);
        if (res.ok) {
          dirty.current = false;
          setSaveState("saved");
        } else throw new Error(res.error);
      } catch {
        setSaveState("error");
        retry = setTimeout(() => setSaveNonce((n) => n + 1), 5000);
      }
    }, 900);
    return () => {
      clearTimeout(t);
      if (retry) clearTimeout(retry);
    };
  }, [design, saveNonce]);
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === "hidden" && dirty.current) {
        dirty.current = false;
        void saveProteinDesign(latest.current).catch(() => {
          dirty.current = true;
        });
      }
    };
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, []);

  // ---- edits: `update` for typing (no undo step), `commit` for discrete actions (undoable) ----
  const update = useCallback((fn: (d: ModelDesign) => ModelDesign) => setDesign((d) => fn(d)), []);
  const showToast = (text: string, undo: boolean) => setToast({ id: Date.now(), text, undo });
  const commit = (next: ModelDesign, label: string) => {
    past.current = [...past.current.slice(-49), { design, label }];
    setCanUndo(true);
    setDesign(next);
    showToast(label, true);
  };
  const undo = useCallback(() => {
    const last = past.current.pop();
    if (!last) return;
    setCanUndo(past.current.length > 0);
    setDesign(last.design);
    setToast({ id: Date.now(), text: `Undid: ${last.label}`, undo: false });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast((cur) => (cur?.id === toast.id ? null : cur)), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const addFeature = (f: Feature) => commit({ ...design, features: [...design.features, f] }, `Added ${f.what || "a custom feature"}`);
  const addSideChain = (n: number) => {
    if (!sideChainStatus(design, n).feature) addFeature(sideChainFeature(n));
  };
  /** Take a residue's side chain off the model, with the bonds that need it (undoable). */
  const removeSideChain = (n: number) => {
    const { design: next, bonds } = withoutSideChain(design, n);
    if (next.features.length === design.features.length) return;
    commit(next, `Removed ${resLabel3(n)} side chain${bonds ? ` and ${bonds} bond${bonds > 1 ? "s" : ""}` : ""}`);
  };
  const removeFeature = (f: Feature) => {
    if (f.kind === "sidechain") return removeSideChain(f.residues[0]!);
    commit({ ...design, features: design.features.filter((x) => x.id !== f.id) }, `Removed ${f.what || "a feature"}`);
  };
  /** Remove every feature of one kind (side chains take their bonds with them). */
  const removeGroup = (kind: Feature["kind"]) => {
    let next = design;
    let bonds = 0;
    const of = design.features.filter((f) => f.kind === kind);
    if (!of.length) return;
    if (kind === "sidechain") {
      for (const f of of) {
        const r = withoutSideChain(next, f.residues[0]!);
        next = r.design;
        bonds += r.bonds;
      }
    } else next = { ...design, features: design.features.filter((f) => f.kind !== kind) };
    const noun = { sidechain: "side chain", interaction: "bond", receptor: "receptor", backbone: "backbone row", custom: "custom feature" }[kind];
    commit(next, `Removed ${of.length} ${noun}${of.length > 1 ? "s" : ""}${bonds ? ` and ${bonds} bond${bonds > 1 ? "s" : ""}` : ""}`);
  };
  const patchFeature = (id: string, patch: Partial<Feature>) =>
    update((d) => ({ ...d, features: d.features.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  /** Which residues show their side-chain atoms in 3D. */
  const setAtoms = (ns: number[], on: boolean) =>
    update((d) => {
      const set = new Set(d.atoms);
      ns.forEach((n) => (on ? set.add(n) : set.delete(n)));
      return { ...d, atoms: [...set].sort((a, b) => a - b) };
    });
  const toggleAtoms = (n: number) => setAtoms([n], !design.atoms.includes(n));

  // ---- picking, measuring, focus ----
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
  const showPair = (a: number, b: number) => {
    setMeasureMode(false);
    setMeasure([a, b]);
  };
  const showFeature = (f: Feature) => {
    if (f.kind === "receptor") setDisplay((d) => ({ ...d, receptor: true }));
    if (f.residues.length === 1) setSelected(f.residues[0]!);
    else if (f.residues.length === 2) showPair(f.residues[0]!, f.residues[1]!);
  };

  const removeSideChainRef = useRef(removeSideChain);
  removeSideChainRef.current = removeSideChain;

  // ---- keyboard: Esc clears, ←/→ step through residues, Ctrl/⌘+Z undoes ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if (e.key === "Escape") {
        if (measureMode || measure.length) {
          setMeasureMode(false);
          setMeasure([]);
        } else if (focus) setFocus(null);
        else setSelected(null);
      } else if ((e.key === "Delete" || e.key === "Backspace") && selected != null) {
        e.preventDefault();
        removeSideChainRef.current(selected);
      } else if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && selected != null && !e.altKey && !e.metaKey && !e.ctrlKey) {
        const next = selected + (e.key === "ArrowLeft" ? -1 : 1);
        if (next >= FIRST && next <= LAST) {
          e.preventDefault();
          setSelected(next);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, measureMode, measure.length, focus, selected]);

  const shown = useMemo(() => shownSideChains(design), [design]);
  const extent = useMemo(() => modelExtentCm(), []);
  const segs = useMemo(() => segments(), []);
  const current = segs.find((s) => !design.progress[`seg-${s.index}`]);
  // An explicit "Show" of a later step extends the build-along view so that step is visible.
  const buildTo = buildAlong && current ? Math.max(current.end, focus?.end ?? 0) : null;
  const viewFocus = focus ?? (buildAlong && current ? { start: current.start, end: current.end } : null);

  const [toolMsg, setToolMsg] = useState<string | null>(null);
  const saveImage = async () => {
    const blob = await viewer.current?.snapshot();
    setToolMsg(blob ? await offerFile("protein-model-view.png", blob) : "Couldn’t capture the 3D view.");
  };

  return (
    <div className="space-y-4">
      {!introHidden && (
        <Intro
          onClose={() => {
            setIntroHidden(true);
            writeLocal(INTRO_KEY, "1");
          }}
        />
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* ---------- left: viewer + sequence ---------- */}
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex flex-wrap gap-1" role="group" aria-label="Standard views">
              {VIEW_BUTTONS.map((v) => (
                <button key={v.id} className="btn btn-secondary px-2.5 py-1 text-xs" onClick={() => viewer.current?.setView(v.id)}>
                  {v.label}
                </button>
              ))}
              <button className="btn btn-secondary px-2.5 py-1 text-xs" onClick={() => viewer.current?.fit()} title="Zoom back to fit the model">
                Fit
              </button>
            </div>
            <span className="mx-0.5 hidden h-5 w-px bg-zinc-300 sm:block dark:bg-zinc-700" />
            <button
              className={`btn px-2.5 py-1 text-xs ${measureMode ? "btn-primary" : "btn-secondary"}`}
              onClick={() => {
                setMeasureMode((m) => !m);
                setMeasure([]);
              }}
              aria-pressed={measureMode}
            >
              Measure
            </button>
            <button className="btn btn-secondary px-2.5 py-1 text-xs" onClick={saveImage}>
              Save image
            </button>
            <SaveBadge state={saveState} savedText={savedText} />
          </div>
          {toolMsg && (
            <p role="status" className="text-xs text-zinc-600 dark:text-zinc-400">
              {toolMsg}
            </p>
          )}

          <div className="relative h-[46vh] min-h-[300px] sm:h-[58vh] sm:min-h-[380px]">
            <MoleculeViewer
              design={design}
              display={display}
              focus={viewFocus}
              focusDim={focus ? 0.82 : 0.5}
              buildTo={buildTo}
              selected={selected}
              measure={measure}
              onPick={onPick}
              onReady={(h) => (viewer.current = h)}
            />
            <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
              {measure.length === 2 ? (
                <div className="pointer-events-auto flex items-center gap-2 rounded-lg bg-black/65 py-1 pl-3 pr-1 text-xs text-white">
                  <span>
                    {resLabel3(measure[0]!)} ↔ {resLabel3(measure[1]!)}: <strong>{caDistance(measure[0]!, measure[1]!).cm.toFixed(1)} cm</strong> on your model (
                    {caDistance(measure[0]!, measure[1]!).angstrom.toFixed(1)} Å)
                  </span>
                  <button className="rounded px-1.5 py-0.5 hover:bg-white/20" aria-label="Clear measurement" onClick={() => setMeasure([])}>
                    ✕
                  </button>
                </div>
              ) : measureMode ? (
                <div className="rounded-lg bg-black/65 px-3 py-1.5 text-xs text-white">
                  Click {measure.length ? "a second" : "a"} residue to measure between alpha carbons
                </div>
              ) : (
                <span />
              )}
              {focus ? (
                <button className="pointer-events-auto rounded-lg bg-black/65 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80" onClick={() => setFocus(null)}>
                  Showing {focus.start}–{focus.end} · show all ✕
                </button>
              ) : buildAlong && current ? (
                <button className="pointer-events-auto rounded-lg bg-black/65 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80" onClick={() => setBuildAlong(false)}>
                  Build-along · step {current.index + 1} · show all ✕
                </button>
              ) : null}
            </div>
          </div>

          {selected != null && !measureMode && (
            <SelectedBar
              n={selected}
              onModel={shown.has(selected)}
              atomsOn={design.atoms.includes(selected)}
              onAdd={() => addSideChain(selected)}
              onRemove={() => removeSideChain(selected)}
              onToggleAtoms={() => toggleAtoms(selected)}
              onDetails={() => {
                setTab("inspect");
                document.getElementById("pm-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              onClose={() => setSelected(null)}
            />
          )}
          <DisplayBar
            display={display}
            setDisplay={setDisplay}
            atoms={{
              on: shown.size > 0 && [...shown].every((n) => design.atoms.includes(n)),
              some: design.atoms.length > 0,
              set: (on) => (on ? setAtoms([...shown], true) : update((d) => ({ ...d, atoms: [] }))),
              disabled: shown.size === 0 && design.atoms.length === 0,
            }}
          />
          <SequenceStrip selected={selected} shown={shown} focus={viewFocus} buildTo={buildTo} measure={measure} onPick={onPick} />
          <ColorKey />
        </div>

        {/* ---------- right: panels ---------- */}
        <div
          id="pm-panel"
          className={`card flex min-w-0 scroll-mt-4 flex-col self-start lg:sticky ${
            compactHeader ? "lg:top-4 lg:max-h-[calc(100dvh-2rem)]" : "lg:top-20 lg:max-h-[calc(100dvh-6rem)]"
          }`}
        >
          <div role="tablist" aria-label="Studio panels" className="flex gap-0.5 border-b border-zinc-200 p-1.5 dark:border-zinc-800">
            {TABS.map((t) => (
              <button
                key={t.id}
                id={`pm-tab-${t.id}`}
                role="tab"
                aria-selected={tab === t.id}
                aria-controls="pm-tabpanel"
                onClick={() => setTab(t.id)}
                className={`min-w-0 flex-1 rounded-lg px-1.5 py-1.5 text-sm font-medium transition-colors ${
                  tab === t.id ? "bg-brand-600 text-white" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div id="pm-tabpanel" role="tabpanel" aria-labelledby={`pm-tab-${tab}`} className="min-h-0 flex-1 overflow-y-auto p-4">
            {tab === "build" && (
              <BuildPanel
                design={design}
                update={update}
                segs={segs}
                focus={focus}
                buildAlong={buildAlong}
                setBuildAlong={setBuildAlong}
                onShow={(s) => setFocus((f) => (f && f.start === s.start && f.end === s.end ? null : { start: s.start, end: s.end }))}
                onShowCheckpoint={(c) => showPair(c.a, c.b)}
              />
            )}
            {tab === "inspect" && (
              <InspectPanel
                n={selected}
                design={design}
                onAddSideChain={addSideChain}
                onRemoveSideChain={removeSideChain}
                onToggleAtoms={toggleAtoms}
                onRemoveFeature={removeFeature}
                onAddInteraction={(it) => addFeature(interactionFeature(it))}
                onSelect={setSelected}
                onMeasure={showPair}
              />
            )}
            {tab === "features" && (
              <FeaturesPanel
                design={design}
                selected={selected}
                onAdd={addFeature}
                onPatch={patchFeature}
                onRemove={removeFeature}
                onRemoveGroup={removeGroup}
                onShow={showFeature}
                onToggleAtoms={toggleAtoms}
                onSetAtoms={setAtoms}
              />
            )}
            {tab === "legend" && <LegendPanel design={design} update={update} onImport={(d) => commit(d, `Imported “${d.title}”`)} />}
            {tab === "check" && (
              <CheckPanel design={design} update={update} segs={segs} extent={extent} onReset={() => commit(defaultDesign(), "Started over")} />
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed inset-x-0 z-50 flex justify-center px-4"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
        >
          <div className="flex max-w-md items-center gap-3 rounded-xl bg-zinc-900 py-2 pl-4 pr-2 text-sm text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
            <span className="min-w-0 flex-1 truncate">{toast.text}</span>
            {toast.undo && canUndo && (
              <button className="rounded-lg px-2 py-1 font-semibold text-brand-300 hover:bg-white/10 dark:text-brand-700 dark:hover:bg-black/10" onClick={undo}>
                Undo
              </button>
            )}
            <button className="rounded-lg px-2 py-1 opacity-70 hover:opacity-100" aria-label="Dismiss" onClick={() => setToast(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================

function Intro({ onClose }: { onClose: () => void }) {
  const steps = [
    ["Mark", "In the Build tab, get the build sheet and mark your 200 cm of tubing every 2 cm."],
    ["Fold", "Fold one step at a time. Turn on build-along so the 3D view matches your tubing."],
    ["Check", "Measure the fold checkpoints on your model and compare the six views."],
    ["Explain", "Add side chains and interactions, then print the legend."],
  ];
  return (
    <section className="card relative p-4" aria-label="How to use the studio">
      <button className="btn btn-ghost absolute right-2 top-2 px-2 py-1 text-xs" onClick={onClose} aria-label="Hide these tips">
        ✕
      </button>
      <ol className="grid gap-3 pr-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([title, text], i) => (
          <li key={title} className="flex gap-2.5">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">{i + 1}</span>
            <span className="text-sm">
              <span className="font-semibold">{title}.</span> <span className="text-zinc-600 dark:text-zinc-400">{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** The picked residue, right under the 3D view: add or remove its side chain and atoms without leaving the model. */
function SelectedBar({
  n,
  onModel,
  atomsOn,
  onAdd,
  onRemove,
  onToggleAtoms,
  onDetails,
  onClose,
}: {
  n: number;
  onModel: boolean;
  atomsOn: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onToggleAtoms: () => void;
  onDetails: () => void;
  onClose: () => void;
}) {
  const r = RESIDUES[n - FIRST]!;
  const aa = aminoAcid(r.aa);
  const p = PROPERTY_INFO[aa.property];
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <span className="size-4 shrink-0 rounded-full border border-zinc-400" style={{ background: p.hex }} aria-hidden />
      <span className="min-w-0 flex-1 truncate">
        <strong>{resLabel3(n)}</strong> · {p.colorName} · {SS_INFO[r.ss].label} · mark {tooberCm(n)} cm
        {onModel && <span className="ml-1.5 chip bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">on your model</span>}
      </span>
      <span className="flex shrink-0 flex-wrap gap-1.5">
        {onModel ? (
          <button className="btn btn-secondary px-2.5 py-1 text-xs text-red-600 dark:text-red-400" onClick={onRemove} title="Remove (Delete key)">
            Remove side chain
          </button>
        ) : (
          <button className="btn btn-primary px-2.5 py-1 text-xs" onClick={onAdd}>
            Add side chain
          </button>
        )}
        {r.aa !== "GLY" && (
          <button className={`btn px-2.5 py-1 text-xs ${atomsOn ? "btn-primary" : "btn-secondary"}`} onClick={onToggleAtoms} aria-pressed={atomsOn}>
            {atomsOn ? "Hide atoms" : "Show atoms"}
          </button>
        )}
        <button className="btn btn-secondary px-2.5 py-1 text-xs lg:hidden" onClick={onDetails}>
          Details
        </button>
        <button className="btn btn-ghost px-2 py-1 text-xs" onClick={onClose} aria-label="Clear selection">
          ✕
        </button>
      </span>
    </div>
  );
}

function SaveBadge({ state, savedText }: { state: SaveState; savedText: string }) {
  const text = { idle: "Changes save automatically", saving: "Saving…", saved: savedText, error: "Couldn’t save. Retrying…" }[state];
  const cls =
    state === "error" ? "text-red-600 dark:text-red-400" : state === "saved" ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-500";
  return (
    <span role="status" className={`ml-auto text-xs font-medium ${cls}`}>
      {text}
    </span>
  );
}

function DisplayBar({
  display,
  setDisplay,
  atoms,
}: {
  display: DisplayOptions;
  setDisplay: (fn: (d: DisplayOptions) => DisplayOptions) => void;
  /** The atoms checkbox: on = every side chain on the model shows atoms; partly = some residues do. */
  atoms: { on: boolean; some: boolean; set: (on: boolean) => void; disabled: boolean };
}) {
  const atomsRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (atomsRef.current) atomsRef.current.indeterminate = atoms.some && !atoms.on;
  }, [atoms.some, atoms.on]);
  const toggles: { key: keyof DisplayOptions; label: string }[] = [
    { key: "receptor", label: "Receptor" },
    { key: "labels", label: "Labels" },
    { key: "allSideChains", label: "All side chains" },
    { key: "allInteractions", label: "All interactions" },
    { key: "box", label: "50 cm box" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <label className="flex items-center gap-2" htmlFor="pm-color-mode">
        <span className="text-zinc-500">Color by</span>
        <select
          id="pm-color-mode"
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
      <label
        className={`flex items-center gap-1.5 ${atoms.disabled ? "text-zinc-400" : "cursor-pointer"}`}
        htmlFor="pm-show-atoms"
        title={atoms.disabled ? "Add side chains first, or pick a residue and choose Show atoms" : "Show or hide the atoms of every side chain on your model. Pick a residue to choose one at a time."}
      >
        <input
          ref={atomsRef}
          id="pm-show-atoms"
          type="checkbox"
          className="accent-brand-600"
          disabled={atoms.disabled}
          checked={atoms.on}
          onChange={(e) => atoms.set(e.target.checked)}
        />
        Side-chain atoms{atoms.some && !atoms.on ? " (some)" : ""}
      </label>
      {toggles.map((t) => (
        <label key={t.key} className="flex cursor-pointer items-center gap-1.5" htmlFor={`pm-show-${t.key}`}>
          <input
            id={`pm-show-${t.key}`}
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
  buildTo,
  measure,
  onPick,
}: {
  selected: number | null;
  shown: Set<number>;
  focus: { start: number; end: number } | null;
  buildTo: number | null;
  measure: number[];
  onPick: (n: number) => void;
}) {
  const rows = [RESIDUES.slice(0, 50), RESIDUES.slice(50)];
  return (
    <div className="card space-y-2 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="text-sm font-semibold">
          Sequence · chain A {FIRST}–{LAST}
        </h2>
        <span className="text-xs text-zinc-500">Tap a residue · bar = helix / strand · dot = side chain on your model</span>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[560px] space-y-2">
          {rows.map((row, ri) => (
            <div key={ri} className="grid grid-cols-[repeat(50,minmax(0,1fr))] gap-px">
              {row.map((r) => {
                const aa = aminoAcid(r.aa);
                const p = PROPERTY_INFO[aa.property];
                const dim = (focus && (r.n < focus.start || r.n > focus.end)) || (buildTo != null && r.n > buildTo);
                const isSel = selected === r.n || measure.includes(r.n);
                return (
                  <button
                    key={r.n}
                    onClick={() => onPick(r.n)}
                    aria-label={`${resLabel3(r.n)}, ${p.label}, ${SS_INFO[r.ss].label}, mark at ${tooberCm(r.n)} centimeters`}
                    aria-pressed={selected === r.n}
                    title={`${resLabel3(r.n)} · ${p.label} · ${SS_INFO[r.ss].label} · mark at ${tooberCm(r.n)} cm`}
                    className={`flex flex-col items-center ${dim ? "opacity-35" : ""}`}
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
                    <span className="h-3 text-[8px] leading-3 text-zinc-500">{r.n % 10 === 0 ? r.n : shown.has(r.n) ? "●" : ""}</span>
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
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-4" style={{ background: SS_INFO.L.hex }} /> loop
      </span>
      {(["salt-bridge", "h-bond", "hydrophobic"] as const).map((t) => (
        <span key={t} className="flex items-center gap-1.5">
          <span
            className="h-1 w-5 rounded-full"
            style={{ background: `repeating-linear-gradient(90deg, ${INTERACTION_INFO[t].hex} 0 5px, transparent 5px 8px)` }}
          />
          {INTERACTION_INFO[t].label}
        </span>
      ))}
      <span className="basis-full text-zinc-500">
        Bonds you add are labeled with the distance between their two marks on your model: the length of the connector.
      </span>
    </div>
  );
}

