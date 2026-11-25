import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ProteinStudio } from "@/components/protein/ProteinStudio";
import { receptorContacts, resLabel3 } from "@/lib/protein/analysis";
import { connect, type Loaded } from "./backend";

type State = { phase: "loading" } | ({ phase: "ready"; kind: "account" | "browser" } & Loaded);

function App() {
  const [state, setState] = useState<State>({ phase: "loading" });
  useEffect(() => {
    connect().then((r) => setState({ phase: "ready", ...r }));
  }, []);
  const rbs = receptorContacts().filter((c) => c.sideChain);
  return (
    <div className="gutter mx-auto max-w-6xl space-y-4 py-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-brand-600 dark:text-brand-300">Science Olympiad · Protein Modeling · Division C · 2026–27</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Protein Model Studio</h1>
          <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
            Plan the pre-build in 3D: PDB 3UBE, chain A, residues 153–252 of the 2009 H1N1 hemagglutinin, at 2 cm per amino acid. The
            sialic acid receptor sits in the binding site, touched by {rbs.map((c) => resLabel3(c.n)).join(", ")}. Drag to rotate, scroll or
            pinch to zoom, right-drag to pan.
          </p>
        </div>
        <a className="btn btn-secondary" href="https://www.soinc.org/protein-modeling-c" target="_blank" rel="noreferrer">
          Official rules ↗
        </a>
      </header>
      {state.phase === "loading" ? (
        <div className="grid h-[58vh] min-h-[360px] place-items-center rounded-2xl bg-[#0b1020] text-sm text-slate-300">Loading your model…</div>
      ) : (
        <>
          {state.kind === "browser" && (
            <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Your design is saving in this browser only. Use <strong>Legend → Export file</strong> to keep a copy or move it to another
              device.
            </p>
          )}
          <ProteinStudio
            initial={state.design}
            savedAt={state.updatedAt}
            savedText={state.kind === "account" ? "Saved to your claude.ai account" : "Saved in this browser"}
          />
        </>
      )}
      <footer className="pt-4 text-xs text-zinc-500">
        Structure data from the RCSB Protein Data Bank (3UBE; Xu et al., J. Virol. 2012). Part of SciOlyGuide, a free student-made study
        tool, not affiliated with Science Olympiad, Inc. Check residue numbers against the event’s modified 3UBE file and JUDE.
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
