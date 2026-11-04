import { TEST_LABEL, hardnessText, sgText, type Specimen } from "@sciolyguide/rocks-minerals";

export const TYPE_STYLE: Record<string, string> = {
  mineral: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  igneous: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
  sedimentary: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  metamorphic: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
};

export function typeOf(s: Specimen): string {
  return s.kind === "mineral" ? "mineral" : s.rockType;
}

export function typeLabel(s: Specimen): string {
  return s.kind === "mineral" ? (s.varietyOf ? `Mineral · variety of ${s.varietyOf}` : "Mineral") : `${s.rockType[0]!.toUpperCase()}${s.rockType.slice(1)} rock`;
}

/** Full property sheet for one specimen. */
export function SpecimenCard({ s, compact }: { s: Specimen; compact?: boolean }) {
  const rows: [string, string][] =
    s.kind === "mineral"
      ? [
          ["Formula", s.formula],
          ["Class", `${s.chemClass}${s.group ? ` · ${s.group}` : ""}`],
          ["Hardness", hardnessText(s.hardness)],
          ["Specific gravity", sgText(s.sg)],
          ["Streak", s.streak],
          ["Luster", `${s.lusterDesc}${s.luster !== "metallic" ? ` (${s.luster})` : ""}`],
          ["Color", s.colors.join(", ")],
          ["Crystal system", s.system],
          ["Breakage", s.breakage],
          ...(s.tests.length ? ([["Tests", s.tests.map((t) => TEST_LABEL[t]).join("; ")]] as [string, string][]) : []),
          ...(s.ore ? ([["Ore of", s.ore]] as [string, string][]) : []),
          ["Uses", s.uses.join("; ")],
        ]
      : [
          ["Type", `${s.rockType} · ${s.subtype}`],
          ["Texture", s.texture],
          ["Composition", s.composition],
          ["Minerals", s.minerals.join(", ")],
          ...(s.parent ? ([["Parent rock", s.parent]] as [string, string][]) : []),
          ...(s.grade ? ([["Metamorphic grade", s.grade]] as [string, string][]) : []),
          ["Forms in", s.environment],
          ...(s.tests?.length ? ([["Tests", s.tests.map((t) => TEST_LABEL[t]).join("; ")]] as [string, string][]) : []),
          ["Uses", s.uses.join("; ")],
        ];
  return (
    <div className="space-y-3">
      {!compact && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-zinc-500">#{String(s.n).padStart(2, "0")}</span>
          <h3 className="text-lg font-semibold">{s.name}</h3>
          <span className={`chip ${TYPE_STYLE[typeOf(s)]}`}>{typeLabel(s)}</span>
        </div>
      )}
      <dl className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[9rem_1fr]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-zinc-500">{k}</dt>
            <dd className="min-w-0 [overflow-wrap:anywhere]">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-900 dark:bg-brand-950/50 dark:text-brand-100">
        <b>ID tip:</b> {s.tip}
      </p>
    </div>
  );
}
