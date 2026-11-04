"use client";

import { useEffect, useRef, useState } from "react";
import type { Response } from "@sciolyguide/codebusters";
import type { PublicPuzzle, Reveal, ToolNotes } from "@/lib/codebusters-types";
import { REFERENCE_TOOLS, Tool, toolTitle, type ToolCtx } from "./tools";

export function formatMs(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

export function PuzzleHeader({ puzzle, index, special }: { puzzle: PublicPuzzle; index?: number; special?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {index !== undefined && <span className="chip bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">Q{index + 1}</span>}
        <h2 className="text-lg font-bold">{puzzle.title}</h2>
        <span className="chip bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200">{puzzle.points} pts</span>
        {special && <span className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">★ Special bonus</span>}
      </div>
      <p className="text-zinc-700 dark:text-zinc-300">{puzzle.prompt}</p>
      {puzzle.display.given.length > 0 && (
        <dl className="flex flex-wrap gap-2 text-sm">
          {puzzle.display.given.map((g) => (
            <div key={g.label} className="rounded-lg bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
              <dt className="inline font-medium text-zinc-500">{g.label}: </dt>
              <dd className="inline font-mono">{g.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function ToolsPanel({ ctx, assist }: { ctx: ToolCtx; assist: boolean }) {
  const tools = ctx.puzzle.display.tools.filter((t) => assist || REFERENCE_TOOLS.has(t));
  const [open, setOpen] = useState<Record<string, boolean>>({});
  if (!tools.length) return null;
  return (
    <div className="space-y-2">
      {tools.map((id, i) => {
        const isOpen = open[id] ?? i === 0;
        return (
          <section key={id} className="rounded-xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setOpen((o) => ({ ...o, [id]: !isOpen }))}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm font-semibold"
              aria-expanded={isOpen}
            >
              {toolTitle(id)}
              <span className="text-zinc-400">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <Tool id={id} ctx={ctx} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function RevealPanel({ reveal }: { reveal: Reveal }) {
  return (
    <div className="space-y-2 rounded-xl bg-zinc-100 p-4 text-sm dark:bg-zinc-800/60">
      <p className="text-base">
        “{reveal.plaintext}”{reveal.attribution && <span className="text-zinc-500"> — {reveal.attribution}</span>}
      </p>
      <dl className="grid gap-1">
        {reveal.solution.map((s) => (
          <div key={s.label} className="flex flex-wrap gap-2">
            <dt className="font-medium text-zinc-500">{s.label}:</dt>
            <dd className="break-all font-mono">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Persist the assist-mode preference per browser. */
export function useAssistPref(): [boolean, (v: boolean) => void] {
  const [assist, setAssist] = useState(true);
  useEffect(() => {
    try {
      const v = localStorage.getItem("sog-assist");
      if (v !== null) setAssist(v === "1");
    } catch {}
  }, []);
  return [
    assist,
    (v: boolean) => {
      setAssist(v);
      try {
        localStorage.setItem("sog-assist", v ? "1" : "0");
      } catch {}
    },
  ];
}

export type SaveStatus = "saved" | "saving" | "dirty" | "offline";

/**
 * Debounced autosave. Retries on failure (shows "offline") and flushes when the tab is hidden.
 * Status only changes on real transitions, never once per keystroke.
 */
export function useAutosave(
  save: (r: Response, notes: ToolNotes) => Promise<{ ok: boolean }>,
  response: Response,
  notes: ToolNotes,
  enabled: boolean,
): { status: SaveStatus; flush: () => Promise<void> } {
  const [status, setStatusState] = useState<SaveStatus>("saved");
  const statusRef = useRef<SaveStatus>("saved");
  const setStatus = (s: SaveStatus) => {
    if (statusRef.current !== s) {
      statusRef.current = s;
      setStatusState(s);
    }
  };
  const latest = useRef({ response, notes, save });
  latest.current = { response, notes, save };
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prev = useRef({ response, notes });

  const flush = async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!dirty.current || !enabled) return;
    dirty.current = false;
    setStatus("saving");
    try {
      await latest.current.save(latest.current.response, latest.current.notes);
      setStatus(dirty.current ? "dirty" : "saved");
    } catch {
      dirty.current = true;
      setStatus("offline");
    }
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  // Detect edits by identity (cheap) and (re)arm the debounce timer. No state update here
  // unless the status actually changes.
  if (enabled && (prev.current.response !== response || prev.current.notes !== notes)) {
    prev.current = { response, notes };
    dirty.current = true;
  }
  useEffect(() => {
    if (!enabled || !dirty.current) return;
    if (statusRef.current !== "offline") setStatus("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flushRef.current(), 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response, notes, enabled]);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") void flushRef.current();
    };
    const retry = setInterval(() => {
      if (dirty.current && !timer.current) void flushRef.current();
    }, 10_000);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      clearInterval(retry);
      document.removeEventListener("visibilitychange", onHide);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { status, flush };
}

export function SaveIndicator({ status }: { status: SaveStatus }) {
  const label = { saved: "Saved", saving: "Saving…", dirty: "Unsaved changes", offline: "Offline. Will retry" }[status];
  const color = {
    saved: "bg-emerald-500",
    saving: "bg-amber-400 animate-pulse",
    dirty: "bg-zinc-400",
    offline: "bg-red-500",
  }[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500" aria-live="polite">
      <span className={`size-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

/** Counts active (tab-visible) time, starting from `startMs`. Remount (key) for a new attempt. */
export function useActiveTimer(startMs: number, running: boolean): number {
  const [ms, setMs] = useState(startMs);
  const acc = useRef(startMs);
  const since = useRef<number | null>(null);
  useEffect(() => {
    if (!running) return;
    const resume = () => {
      if (since.current === null) since.current = Date.now();
    };
    const pause = () => {
      if (since.current !== null) {
        acc.current += Date.now() - since.current;
        since.current = null;
      }
    };
    if (document.visibilityState === "visible") resume();
    const id = setInterval(() => setMs(acc.current + (since.current !== null ? Date.now() - since.current : 0)), 500);
    const onVis = () => (document.visibilityState === "visible" ? resume() : pause());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      pause();
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [running]);
  return ms;
}

/**
 * Two-step button: the first click asks, the second confirms. Used instead of
 * window.confirm(), which some embedded browsers (and the demo viewer) block.
 */
export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel,
  className,
  disabled,
}: {
  onConfirm: () => void;
  children: React.ReactNode;
  confirmLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      className={`${className ?? ""} ${armed ? "ring-2 ring-amber-500" : ""}`}
      disabled={disabled}
      aria-live="polite"
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}
