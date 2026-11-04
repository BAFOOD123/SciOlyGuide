/**
 * Demo-only persistence: an in-browser stand-in for the database, so the real
 * Codebusters components can run as a single static page. Saves to localStorage
 * on this device (falls back to memory when storage is blocked).
 */
import type { PuzzleSpec } from "@sciolyguide/codebusters";

export type Status = "active" | "solved" | "unsolved" | "revealed" | "skipped";

export interface DemoAttempt {
  id: string;
  kind: "practice" | "timed" | "test";
  cipherType: string;
  spec: PuzzleSpec;
  testId?: string;
  questionIndex?: number;
  status: Status;
  response: { plain: string[]; final?: string };
  notes: Record<string, unknown>;
  points: number;
  score: number | null;
  errors: number | null;
  checks: number;
  hints: number;
  elapsedMs: number;
  startedAt: number;
  updatedAt: number;
  finishedAt: number | null;
}

export interface DemoTest {
  id: string;
  level: "regional" | "state";
  seed: number;
  specials: number[];
  startedAt: number;
  endsAt: number;
  finishedAt: number | null;
  timedSeconds: number | null;
  score: number | null;
  maxScore: number;
}

export interface DemoRmSession {
  id: string;
  mode: "practice" | "stations";
  plan: string;
  responses: string;
  stationSeconds: number | null;
  startedAt: number;
  endsAt: number | null;
  finishedAt: number | null;
  score: number | null;
  maxScore: number;
}

interface State {
  attempts: Record<string, DemoAttempt>;
  tests: Record<string, DemoTest>;
  events: string[];
  rmSessions: Record<string, DemoRmSession>;
  /** Newest first. */
  rmAnswers: { specimenId: string | null; skill: string; correct: boolean; guess?: string | null; at: number }[];
  cards: Record<string, { box: number; dueAt: number }>;
}

const EMPTY = (): State => ({ attempts: {}, tests: {}, events: [], rmSessions: {}, rmAnswers: [], cards: {} });

const KEY = "sog-demo-v1";
let state: State = EMPTY();
try {
  const raw = localStorage.getItem(KEY);
  if (raw) state = { ...EMPTY(), ...(JSON.parse(raw) as Partial<State>) };
} catch {}

const listeners = new Set<() => void>();
let version = 0;

function persist() {
  version++;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  for (const l of listeners) l();
}

export const store = {
  get: () => state,
  version: () => version,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  putAttempt(a: DemoAttempt, quiet = false) {
    state.attempts[a.id] = a;
    if (quiet) {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {}
    } else persist();
  },
  patchAttempt(id: string, patch: Partial<DemoAttempt>, quiet = false) {
    const a = state.attempts[id];
    if (!a) return;
    state.attempts[id] = { ...a, ...patch };
    if (quiet) {
      // Autosaves don't need to re-render the page.
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {}
    } else persist();
  },
  putTest(t: DemoTest) {
    state.tests[t.id] = t;
    persist();
  },
  patchTest(id: string, patch: Partial<DemoTest>, quiet = false) {
    const t = state.tests[id];
    if (t) state.tests[id] = { ...t, ...patch };
    if (quiet) {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {}
    } else persist();
  },
  attempts: () => Object.values(state.attempts),
  /** Mutate state directly, then save (quiet = don't re-render). */
  update(fn: (s: State) => void, quiet = false) {
    fn(state);
    if (quiet) {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
      } catch {}
    } else persist();
  },
  reset() {
    state = EMPTY();
    persist();
  },
};

export function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

/* ----------------------------- Hash navigation ----------------------------- */

export function navigate(view: string) {
  if (location.hash.slice(1) === view) {
    version++; // same view, new content: change the snapshot so React re-renders
    for (const l of listeners) l();
  } else {
    location.hash = view;
  }
  window.scrollTo({ top: 0 });
}
