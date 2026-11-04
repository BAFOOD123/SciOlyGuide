"use client";

import { useEffect, useMemo, useState } from "react";
import { SPECIMENS, TEST_LABEL, hardnessText, photosFor, type Specimen } from "@sciolyguide/rocks-minerals";
import { photoSrc } from "@/lib/rocks-types";
import { SpecimenCard, TYPE_STYLE, typeLabel, typeOf } from "./SpecimenCard";

type Filter = "all" | "mineral" | "igneous" | "sedimentary" | "metamorphic";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All 92" },
  { value: "mineral", label: "Minerals" },
  { value: "igneous", label: "Igneous" },
  { value: "sedimentary", label: "Sedimentary" },
  { value: "metamorphic", label: "Metamorphic" },
];

const MASTERY_DOT = {
  new: "bg-zinc-300 dark:bg-zinc-600",
  learning: "bg-amber-400",
  mastered: "bg-emerald-500",
} as const;

function summary(s: Specimen) {
  return s.kind === "mineral" ? `H ${hardnessText(s.hardness)} · ${s.streak} streak · ${s.lusterDesc}` : `${s.subtype} · ${s.texture}`;
}

function haystack(s: Specimen) {
  return [
    s.name,
    ...(s.aliases ?? []),
    typeLabel(s),
    summary(s),
    s.tip,
    ...(s.tests ?? []).map((t) => TEST_LABEL[t]),
    ...(s.kind === "mineral" ? [...s.colors, s.formula, s.chemClass, s.ore ?? ""] : [...s.minerals, s.environment, s.composition]),
  ]
    .join(" ")
    .toLowerCase();
}

export function SpecimenGallery({ mastery }: { mastery: Record<string, "new" | "learning" | "mastered"> }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const id = location.hash.slice(1);
    if (SPECIMENS.some((s) => s.id === id)) {
      setOpen(id);
      setTimeout(() => document.getElementById(`sp-${id}`)?.scrollIntoView({ block: "center" }), 50);
    }
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SPECIMENS.filter((s) => (filter === "all" || typeOf(s) === filter) && (!q || haystack(s).includes(q)));
  }, [filter, query]);
  const counts = { mastered: 0, learning: 0, new: 0 };
  for (const s of SPECIMENS) counts[mastery[s.id] ?? "new"]++;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`btn px-3 py-1.5 ${filter === f.value ? "btn-primary" : "btn-secondary"}`}
          >
            {f.label}
          </button>
        ))}
        <input
          id="specimen-search"
          type="search"
          className="input ml-auto w-full sm:w-64"
          placeholder="Search name, color, mineral…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search specimens"
        />
      </div>
      <p className="flex flex-wrap gap-4 text-xs text-zinc-500">
        {(["mastered", "learning", "new"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${MASTERY_DOT[k]}`} />
            {counts[k]} {k === "new" ? "not practiced yet" : k}
          </span>
        ))}
      </p>
      <ul className="grid gap-3 md:grid-cols-2">
        {list.map((s) => {
          const isOpen = open === s.id;
          return (
            <li key={s.id} id={`sp-${s.id}`} className={`card overflow-hidden ${isOpen ? "md:col-span-2" : ""}`}>
              <button
                type="button"
                className="flex w-full items-start gap-3 px-4 py-3 text-left"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : s.id)}
              >
                {photosFor(s.id)[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoSrc(photosFor(s.id)[0]!.key)} alt="" loading="lazy" className="size-12 shrink-0 rounded-lg object-cover" />
                ) : (
                  <span className="size-12 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-zinc-500">#{String(s.n).padStart(2, "0")}</span>
                    <span className="font-semibold">{s.name}</span>
                    <span className={`chip ${TYPE_STYLE[typeOf(s)]}`}>{typeOf(s) === "mineral" ? "Mineral" : typeLabel(s).replace(" rock", "")}</span>
                    <span className={`size-2 rounded-full ${MASTERY_DOT[mastery[s.id] ?? "new"]}`} title={mastery[s.id] ?? "new"} />
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-zinc-500">{summary(s)}</span>
                </span>
                <span className="text-zinc-400" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-zinc-100 px-4 py-4 dark:border-zinc-800">
                  <SpecimenCard s={s} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {list.length === 0 && <p className="text-sm text-zinc-500">No specimens match “{query}”.</p>}
    </div>
  );
}
