# SciOlyGuide

A **free** Science Olympiad study app for **Division C** students. Every event page is built
around how that event is actually competed. **Codebusters and Rocks and Minerals are live**; the
other Div C events are next.

## Home: choose your events

Students pick the events they compete in from all 23 Division C events. The list is grouped by the
official 2027 categories and shows Science Olympiad's own short descriptions. Choices save to the
account and drive the header navigation. If two chosen events share a 2027 national conflict block,
the home page warns that one student can't compete in both. Events still in progress get an info
page with the official description and a link to soinc.org.

## What's in Rocks and Minerals

- **All 92 specimens** from the official Ward's kit list linked on soinc.org (52 minerals, 12 igneous,
  18 sedimentary, 10 metamorphic). Each has hardness, specific gravity, streak, luster, color, crystal
  system, cleavage/fracture, special tests, formation, uses and an ID tip (`packages/rocks-minerals`).
- **Question generators** for 21 skills: identifying specimens from their properties (every
  distractor is ruled out by at least one clue), hardness, streak, luster, cleavage, crystal system,
  formulas, ores, special tests, ordering by hardness, rock classification, igneous texture and
  composition, intrusive/extrusive pairs, parent rocks, metamorphic grade, depositional energy, plus
  hand-written geology concept questions.
- **Photo ID**, like scioly.rocks: 243 real specimen photos from Wikimedia Commons cover all 92
  specimens, with two or three per specimen so you learn the variety, not one picture. You can
  type the name or choose from look-alikes. There are three hints (category, key property, first
  letter), and a follow-up property question after each photo, like a tournament station.
  Weak specimens come up more often. Your mix-ups ("Topaz mistaken for Ulexite") are tracked,
  and photo files have hashed names so the answer can't be read from the image URL.
- **Specimen sheets with photos and a Wikipedia summary**. Every photo is credited to its author
  and license (CC BY, CC BY-SA, CC0 or public domain), and there's a full
  [credits page](apps/web/src/app/rocks-and-minerals/credits). The photo pipeline lives in
  `packages/rocks-minerals/scripts/`.
- **Practice sets** with instant feedback and the specimen sheet. Weak specimens come up more often.
- **Station tests** in tournament format: one specimen per station, timed rotation you can't go
  back from (or untimed), and multiple choice or written names.
- **Flashcards** with Leitner spaced repetition (1, 3, 7, 21 days): photo → name, properties → name,
  or name → properties.
- **Specimen gallery** (search and filter, mastery dots) and **reference tables**: Mohs scale,
  igneous texture × composition, sedimentary and metamorphic classification, Bowen's series and the
  Wentworth grain-size scale.

## What's in Codebusters

- **All 11 Division C cipher types for 2026–27**, generated fresh every time: Aristocrat
  (random/K1/K2/K3 + keyword questions), Patristocrat, Xenocrypt (Spanish, with Ñ), Baconian,
  Fractionated Morse, Cryptarithm, Porta, Complete Columnar, Nihilist, Checkerboard, and the new
  Homophonic. The 2027 removals (Hill, Affine, Atbash and Caesar for Div C) are not included.
- **Official descriptions.** Each cipher's learn page explains it the way Science Olympiad's
  Codebusters Overview (soinc.org) does, paraphrased with history notes and a source link.
- **Solving workspace.** Type a letter once and it fills everywhere. Conflicts get flagged and
  matching letters highlight. Assist tools: frequency table, plain→cipher alphabet, Baconian A/B
  sorter, trigraph notes with live Morse decode, Polybius and Homophonic table builders, column
  arranger, cryptarithm digit tracker. **Paper mode** turns off everything except the
  resource-sheet references.
- **Tournament scoring.** Two free errors, then −100 per error. Keyword and cryptarithm answers
  must be exact. The timed question earns 2 points for each second under 10 minutes, and special
  bonus questions earn 150/400/750. The constants live in one place:
  `packages/codebusters/src/scoring.ts`.
- **Timed question** mode and **50-minute mock tests** (Regional or State mix). Tests autosave and
  auto-submit when time runs out, then show a full review.
- **Accounts that save everything.** Username + password only (no email collected). Puzzles in
  progress autosave and resume on any device. Each cipher tracks accuracy, median and best solve
  time, and streaks, and the app recommends your weakest cipher.

## Layout

```
apps/web/                  Next.js 16 app (App Router, Tailwind 4, Drizzle + libSQL/SQLite)
packages/codebusters/      Pure-TS cipher engine: seeded generators, graders, scoring, guides (+ tests)
packages/rocks-minerals/   Specimen data, seeded question generators, station tests, reference tables (+ tests)
packages/schema/           Shared event/question types
content/seasons/2027/      Event registry for the season
docs/DESIGN.md             Overall framework design
```

Puzzles are generated deterministically from `(type, options, seed)`. The browser never gets the
answer: the server regenerates the puzzle from the stored seed to grade it.

## Develop

Requires Node ≥ 22.18.

```bash
npm install
npm run check                   # typecheck + registry validation + engine tests
npm run dev -w @sciolyguide/web # migrates local.db, then http://localhost:3000
```

## Demo build

`npm run demo:build -w @sciolyguide/web` bundles the real Codebusters components into a single
self-contained HTML file (`apps/web/demo/dist/sciolyguide-demo.html`). It has no server and no
accounts; progress is kept in the browser. It's useful for showing the app without hosting it.

## Deploy (free)

1. Create a free [Turso](https://turso.tech) database and an auth token.
2. On [Vercel](https://vercel.com), import the repo with **Root Directory = `apps/web`**.
3. Set `DATABASE_URL=libsql://…` and `DATABASE_AUTH_TOKEN=…`.
4. Apply migrations once (and after schema changes):
   `DATABASE_URL=… DATABASE_AUTH_TOKEN=… npm run db:migrate -w @sciolyguide/web`

Official rules are at [soinc.org](https://www.soinc.org). This project is not affiliated with
Science Olympiad, Inc. or Scioly.org.
