/**
 * Event registry types. An event page is composed from its archetypes'
 * default modules plus per-event overrides — see docs/DESIGN.md §2.
 */

export type Division = "B" | "C";

export type Archetype =
  | "knowledge"
  | "identification"
  | "calculation"
  | "lab"
  | "cipher"
  | "case-study"
  | "design-writeup"
  | "communication"
  | "modeling-3d"
  | "build";

export type ModuleId =
  // universal
  | "overview"
  | "resources"
  | "progress"
  | "notes-sheet-builder"
  // knowledge
  | "study-guide"
  | "flashcards"
  | "topic-drills"
  | "mock-test"
  // identification
  | "image-id-drill"
  | "station-rotation"
  | "specimen-gallery"
  // calculation
  | "problem-generator"
  | "formula-sheet"
  | "worked-solutions"
  // lab
  | "procedure-walkthroughs"
  | "decision-flowcharts"
  | "virtual-lab"
  // cipher
  | "cipher-trainer"
  | "timed-packets"
  | "speed-leaderboard"
  // case-study
  | "case-scenarios"
  | "epi-calculator-drills"
  // design-writeup
  | "writeup-coach"
  | "timed-prompt-practice"
  // communication
  | "partner-drill"
  | "description-feedback"
  // modeling-3d
  | "molecule-viewer"
  | "cad-challenges"
  // build
  | "build-log"
  | "trial-logger"
  | "score-calculator"
  | "design-calculators"
  | "impound-checklist";

export const UNIVERSAL_MODULES: readonly ModuleId[] = [
  "overview",
  "resources",
  "progress",
];

export const ARCHETYPE_MODULES: Readonly<Record<Archetype, readonly ModuleId[]>> = {
  knowledge: ["study-guide", "flashcards", "topic-drills", "mock-test"],
  identification: ["image-id-drill", "station-rotation", "specimen-gallery"],
  calculation: ["problem-generator", "formula-sheet", "worked-solutions"],
  lab: ["procedure-walkthroughs", "decision-flowcharts", "virtual-lab"],
  cipher: ["cipher-trainer", "timed-packets", "speed-leaderboard"],
  "case-study": ["case-scenarios", "epi-calculator-drills"],
  "design-writeup": ["writeup-coach", "timed-prompt-practice"],
  communication: ["partner-drill", "description-feedback"],
  "modeling-3d": ["molecule-viewer", "cad-challenges"],
  build: [
    "build-log",
    "trial-logger",
    "score-calculator",
    "design-calculators",
    "impound-checklist",
  ],
};

/** What competitors may bring — always confirm against the season's rules. */
export type AllowedResource =
  | { kind: "none" }
  | { kind: "notes-sheet"; sheets: number; sides: 1 | 2 }
  | { kind: "binder" }
  | { kind: "other"; description: string };

export type CalculatorClass = "none" | "four-function" | "scientific" | "graphing" | "any";

export interface DivisionOffering {
  division: Division;
  conflictBlock: number;
}

export interface ModuleOverrides {
  add?: ModuleId[];
  remove?: ModuleId[];
  /** Explicit tab order; modules not listed keep their default relative order. */
  order?: ModuleId[];
}

export interface EventConfig {
  slug: string;
  name: string;
  season: number;
  offerings: DivisionOffering[];
  archetypes: Archetype[];
  modules?: ModuleOverrides;
  /** Null until someone checks the season's rules manual. */
  allowedResources?: AllowedResource[] | null;
  calculator?: CalculatorClass | null;
  timeLimitMinutes?: number | null;
  /** True only after a human has checked this entry against the official rules. */
  rulesVerified: boolean;
  links: {
    /** Official event page on soinc.org (link out; never reproduce rules). */
    official?: string;
    /** Scioly.org wiki page for the event. */
    wiki?: string;
  };
  notes?: string;
}

/**
 * Resolve the ordered module list for an event page:
 * universal modules, then archetype defaults (deduped, in archetype order),
 * then overrides, with the notes-sheet builder added when resources allow one.
 */
export function resolveModules(event: EventConfig): ModuleId[] {
  const seen = new Set<ModuleId>();
  const out: ModuleId[] = [];
  const push = (m: ModuleId) => {
    if (!seen.has(m)) {
      seen.add(m);
      out.push(m);
    }
  };

  push("overview");
  for (const a of event.archetypes) ARCHETYPE_MODULES[a].forEach(push);
  if (event.allowedResources?.some((r) => r.kind === "notes-sheet" || r.kind === "binder")) {
    push("notes-sheet-builder");
  }
  event.modules?.add?.forEach(push);
  push("resources");
  push("progress");

  const removed = new Set(event.modules?.remove ?? []);
  let result = out.filter((m) => !removed.has(m));

  const order = event.modules?.order;
  if (order?.length) {
    const rank = new Map(order.map((m, i) => [m, i]));
    const ordered = result.filter((m) => rank.has(m)).sort((a, b) => rank.get(a)! - rank.get(b)!);
    const rest = result.filter((m) => !rank.has(m));
    result = [...ordered, ...rest];
  }
  return result;
}
