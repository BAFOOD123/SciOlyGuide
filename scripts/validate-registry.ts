/**
 * Validate a season event registry against the schema and basic invariants.
 * Usage: node scripts/validate-registry.ts content/seasons/2027/events.yaml
 */
import { readFileSync } from "node:fs";
import { parse } from "yaml";
import {
  ARCHETYPE_MODULES,
  resolveModules,
  type Archetype,
  type EventConfig,
} from "../packages/schema/src/index.ts";

const path = process.argv[2];
if (!path) {
  console.error("usage: validate-registry.ts <events.yaml>");
  process.exit(2);
}

const doc = parse(readFileSync(path, "utf8")) as {
  season: number;
  events: Omit<EventConfig, "season">[];
};
const archetypes = new Set(Object.keys(ARCHETYPE_MODULES) as Archetype[]);
const errors: string[] = [];
const slugs = new Set<string>();
const perDivision: Record<string, number> = { B: 0, C: 0 };

const events: EventConfig[] = doc.events.map((e) => ({ ...e, season: doc.season }));

for (const e of events) {
  const where = `${e.slug ?? "<missing slug>"}`;
  if (!e.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug)) errors.push(`${where}: bad slug`);
  if (slugs.has(e.slug)) errors.push(`${where}: duplicate slug`);
  slugs.add(e.slug);
  if (!e.name) errors.push(`${where}: missing name`);
  if (!e.offerings?.length) errors.push(`${where}: no division offerings`);
  for (const o of e.offerings ?? []) {
    if (o.division !== "B" && o.division !== "C") errors.push(`${where}: bad division ${o.division}`);
    if (!Number.isInteger(o.conflictBlock) || o.conflictBlock < 1) {
      errors.push(`${where}: bad conflict block ${o.conflictBlock}`);
    }
    perDivision[o.division] = (perDivision[o.division] ?? 0) + 1;
  }
  if (!e.archetypes?.length) errors.push(`${where}: no archetypes`);
  for (const a of e.archetypes ?? []) {
    if (!archetypes.has(a)) errors.push(`${where}: unknown archetype "${a}"`);
  }
  if (typeof e.rulesVerified !== "boolean") errors.push(`${where}: rulesVerified must be boolean`);
}

for (const d of ["B", "C"]) {
  if (perDivision[d] !== 23) errors.push(`Division ${d} has ${perDivision[d]} events (expected 23)`);
}

if (errors.length) {
  console.error(`✗ ${path}: ${errors.length} problem(s)`);
  for (const err of errors) console.error("  - " + err);
  process.exit(1);
}

const unverified = events.filter((e) => !e.rulesVerified).length;
console.log(
  `✓ ${path}: season ${doc.season}, ${events.length} unique events ` +
    `(B: ${perDivision.B}, C: ${perDivision.C}); ${unverified} awaiting rules verification`,
);
if (process.argv.includes("--modules")) {
  for (const e of events) console.log(`  ${e.slug.padEnd(26)} ${resolveModules(e).join(", ")}`);
}
