import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ProteinStudio } from "@/components/protein/ProteinStudio";
import { connect, onStorageChange, type Loaded, type StorageKind } from "./backend";

type State = { phase: "loading" } | ({ phase: "ready"; kind: StorageKind } & Loaded);

function App() {
  const [state, setState] = useState<State>({ phase: "loading" });
  useEffect(() => {
    connect().then((r) => setState({ phase: "ready", ...r }));
    return onStorageChange((kind) => setState((s) => (s.phase === "ready" ? { ...s, kind } : s)));
  }, []);
  return (
    <div className="gutter mx-auto max-w-6xl space-y-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-brand-600 dark:text-brand-300">Science Olympiad · Protein Modeling (Division C) · 2026–27</p>
          <h1 className="text-2xl font-bold tracking-tight [text-wrap:balance] sm:text-3xl">Protein Model Studio</h1>
          <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
            Plan, fold and check the pre-build in 3D: chain A, residues 153–252 of PDB 3UBE (2009 H1N1 hemagglutinin, sialic acid binding
            site), at 2 cm per amino acid. Drag to rotate, scroll or pinch to zoom, right-drag or two-finger drag to pan.
          </p>
        </div>
      </header>
      {state.phase === "loading" ? (
        <div className="grid h-[46vh] min-h-[300px] place-items-center rounded-2xl bg-[#0b1020] text-sm text-slate-300 sm:h-[58vh]">
          Loading your model…
        </div>
      ) : (
        <>
          {state.kind === "browser" && (
            <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Your design saves in this browser on this device. To keep a copy or continue on another device, use{" "}
              <strong>Legend → Export design</strong>.
            </p>
          )}
          <ProteinStudio
            initial={state.design}
            savedAt={state.updatedAt}
            savedText={state.kind === "account" ? "Saved to your claude.ai account" : "Saved in this browser"}
            compactHeader
          />
        </>
      )}
      <footer className="space-y-1 pt-4 text-xs text-zinc-500">
        <p>
          Structure data: RCSB Protein Data Bank entry 3UBE (Xu et al., J. Virol. 2012). Secondary structure and residue numbers follow that file;
          confirm them against the event’s modified 3UBE file and JUDE before labeling. Interactions and distances are computed from the
          coordinates.
        </p>
        <p>A free study tool from SciOlyGuide. Not affiliated with or endorsed by Science Olympiad, Inc. or 3D Molecular Designs.</p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
