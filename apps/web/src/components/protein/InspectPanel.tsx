"use client";

import {
  aminoAcid,
  bendAngle,
  caDistance,
  composition,
  FIRST,
  INTERACTION_INFO,
  interactions,
  LAST,
  nearbyResidues,
  PROPERTY_INFO,
  receptorContacts,
  RESIDUES,
  resLabel3,
  segmentName,
  segmentOf,
  SUGAR_NAMES,
  tooberCm,
  type Interaction,
  type Property,
} from "@/lib/protein/analysis";
import type { ModelDesign } from "@/lib/protein/design";
import { STRUCTURE } from "@/lib/protein/structure.generated";
import { pairKey, PropDot, ResButton } from "./ui";

function bendWords(deg: number): string {
  if (deg >= 150) return "nearly straight";
  if (deg >= 115) return "gentle bend, like a strand";
  if (deg >= 97) return "firm bend";
  return "tight bend, like a helix turn";
}

export function InspectPanel({
  n,
  design,
  onToggleSideChain,
  onAddInteraction,
  onSelect,
  onMeasure,
}: {
  n: number | null;
  design: ModelDesign;
  onToggleSideChain: (n: number) => void;
  onAddInteraction: (it: Interaction) => void;
  onSelect: (n: number) => void;
  onMeasure: (a: number, b: number) => void;
}) {
  if (n == null) return <Overview onSelect={onSelect} />;

  const r = RESIDUES[n - FIRST]!;
  const aa = aminoAcid(r.aa);
  const prop = PROPERTY_INFO[aa.property];
  const seg = segmentOf(n);
  const angle = bendAngle(n);
  const contact = receptorContacts().find((c) => c.n === n);
  const mine = interactions().filter((it) => it.a === n || it.b === n);
  const added = new Set(design.features.filter((f) => f.kind === "interaction").map((f) => pairKey(f.interaction, f.residues)));
  const hasSideChain = design.features.some((f) => f.kind === "sidechain" && f.residues[0] === n);
  const ss = STRUCTURE.ssbonds.filter((s) => s.residue === n);
  const near = nearbyResidues(n).slice(0, 5);

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-start gap-3">
        <span
          className="grid size-11 shrink-0 place-items-center rounded-full font-mono text-lg font-bold text-zinc-900"
          style={{ background: prop.hex, boxShadow: "inset 0 0 0 1px #a1a1aa" }}
          aria-hidden
        >
          {aa.one}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight">
            {aa.name} {n}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400">
            {aa.three[0]}
            {aa.three.slice(1).toLowerCase()} ({aa.one}) · {prop.label} → <strong>{prop.colorName}</strong>
          </p>
        </div>
        <div className="ml-auto flex shrink-0 gap-1">
          <button className="btn btn-ghost px-2 py-1" disabled={n <= FIRST} onClick={() => onSelect(n - 1)} aria-label="Previous residue" title="Previous residue (←)">
            ‹
          </button>
          <button className="btn btn-ghost px-2 py-1" disabled={n >= LAST} onClick={() => onSelect(n + 1)} aria-label="Next residue" title="Next residue (→)">
            ›
          </button>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
        <dt className="text-zinc-500">Structure</dt>
        <dd>{segmentName(seg)}</dd>
        <dt className="text-zinc-500">Mark</dt>
        <dd>
          <strong>{tooberCm(n)} cm</strong> from the N-terminal end
        </dd>
        <dt className="text-zinc-500">Bend</dt>
        <dd>{angle == null ? "End of the chain" : `${Math.round(angle)}° at this mark (${bendWords(angle)})`}</dd>
        {contact && (
          <>
            <dt className="text-zinc-500">Receptor</dt>
            <dd>
              {contact.hbond ? "Hydrogen-bonds" : "Touches"} the {contact.sugars.map((s) => SUGAR_NAMES[s] ?? s).join(" + ")} ({contact.distance.toFixed(1)} Å
              {contact.sideChain ? ", side chain" : ", backbone only"})
            </dd>
          </>
        )}
        {ss.map((s) => (
          <div key={s.partnerChain} className="contents">
            <dt className="text-zinc-500">Disulfide</dt>
            <dd>
              To Cys{s.partnerResidue} of a <em>neighboring</em> HA1 chain ({s.partnerChain}) in the trimer, so its partner isn’t on your model.
            </dd>
          </div>
        ))}
      </dl>

      <button className={`btn w-full ${hasSideChain ? "btn-secondary" : "btn-primary"}`} onClick={() => onToggleSideChain(n)}>
        {hasSideChain ? "Remove side chain from my model" : `Add a ${prop.colorName} side chain to my model`}
      </button>

      {near.length > 0 && (
        <div>
          <h4 className="mb-1 font-semibold">Close to it on your model</h4>
          <p className="mb-1.5 text-xs text-zinc-500">Parts of the chain the fold brings next to this mark.</p>
          <ul className="flex flex-wrap gap-1.5">
            {near.map((x) => (
              <li key={x.n}>
                <button
                  className="chip gap-1 bg-zinc-100 py-1 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  onClick={() => onMeasure(n, x.n)}
                  title="Show this distance in 3D"
                >
                  {resLabel3(x.n)} <span className="font-mono text-zinc-500">{x.cm.toFixed(1)} cm</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="mb-1.5 font-semibold">Side-chain interactions ({mine.length})</h4>
        {mine.length === 0 && <p className="text-zinc-500">None with other residues in 153–252.</p>}
        <ul className="space-y-1.5">
          {mine.map((it) => {
            const other = it.a === n ? it.b : it.a;
            const info = INTERACTION_INFO[it.type];
            const isAdded = added.has(pairKey(it.type, [it.a, it.b]));
            return (
              <li key={`${it.type}-${it.a}-${it.b}`} className="flex items-center gap-2 rounded-lg border border-zinc-200 px-2 py-1.5 dark:border-zinc-800">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: info.hex }} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{info.label}</span> with <ResButton label={resLabel3(other)} onClick={() => onSelect(other)} />
                  <span className="block text-xs text-zinc-500">
                    {it.atomA}…{it.atomB} {it.distance.toFixed(1)} Å · marks {caDistance(it.a, it.b).cm.toFixed(1)} cm apart
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

function Overview({ onSelect }: { onSelect: (n: number) => void }) {
  const comp = composition();
  return (
    <div className="space-y-4 text-sm">
      <p className="text-zinc-600 dark:text-zinc-400">
        Click the model or a letter in the sequence to inspect a residue: its color, where its mark goes, how sharply to bend there, what it
        sits next to, and its interactions.
      </p>
      <div>
        <h3 className="mb-1 font-semibold">
          Residues {FIRST}–{LAST} by property
        </h3>
        <ul className="space-y-1">
          {(Object.keys(comp) as Property[]).map((k) => (
            <li key={k} className="flex items-center gap-2">
              <PropDot property={k} />
              <span className="w-28">{PROPERTY_INFO[k].label}</span>
              <span className="font-mono text-xs tabular-nums text-zinc-500">{comp[k].length}</span>
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
              <button key={c.n} className="chip bg-fuchsia-100 py-1 text-fuchsia-800 hover:bg-fuchsia-200 dark:bg-fuchsia-950 dark:text-fuchsia-200" onClick={() => onSelect(c.n)}>
                {resLabel3(c.n)}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
