"use client";

import { useState } from "react";
import { PRINTS_DIRECTLY } from "@/components/protein/platform";
import { PROPERTY_INFO, type Property } from "@/lib/protein/analysis";

export const pairKey = (type: string | undefined, residues: number[]) => `${type}:${[...residues].sort((a, b) => a - b).join("-")}`;

export function PropDot({ property, className = "size-3" }: { property: Property; className?: string }) {
  return <span className={`inline-block shrink-0 rounded-full border border-zinc-400 ${className}`} style={{ background: PROPERTY_INFO[property].hex }} />;
}

export function Field({
  id,
  label,
  value,
  onChange,
  max,
  multiline,
  warn,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  multiline?: boolean;
  warn?: string;
  placeholder?: string;
}) {
  const cls = `input py-1.5 ${warn ? "border-amber-400 dark:border-amber-600" : ""}`;
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-0.5 block text-xs font-medium text-zinc-500">
        {label}
        {warn && <span className="ml-1 text-amber-700 dark:text-amber-400">· {warn}</span>}
      </span>
      {multiline ? (
        <textarea id={id} className={cls} rows={2} maxLength={max} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} className={cls} maxLength={max} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

/** Prints in the app; on the standalone page, saves a print-ready HTML file instead. */
export function PrintButton({ className, label, run }: { className: string; label: string; run: () => Promise<string | null> }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-1">
      <button
        className={className}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            setMsg(await run());
          } finally {
            setBusy(false);
          }
        }}
      >
        {PRINTS_DIRECTLY ? `Print ${label}` : `Save ${label} to print`}
      </button>
      {!PRINTS_DIRECTLY && !msg && <p className="text-xs text-zinc-500">Saves a page that opens your print dialog when you open it.</p>}
      {msg && (
        <p role="status" className="text-xs text-zinc-600 dark:text-zinc-400">
          {msg}
        </p>
      )}
    </div>
  );
}

export function Disclosure({ title, meta, defaultOpen = false, children }: { title: string; meta?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800">
      <button
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`text-xs text-zinc-400 transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
        <span className="flex-1">{title}</span>
        {meta && <span className="text-xs font-normal text-zinc-500">{meta}</span>}
      </button>
      {open && <div className="space-y-3 border-t border-zinc-200 p-3 dark:border-zinc-800">{children}</div>}
    </div>
  );
}

/** A residue name that selects it. */
export function ResButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="font-medium text-brand-600 hover:underline dark:text-brand-300" onClick={onClick}>
      {label}
    </button>
  );
}
