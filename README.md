# SciOlyGuide

A **free** Science Olympiad study app for **Division C** students. Every event page is built
around how that event is actually competed. **Codebusters is live**; the other Div C events are next.

## What's in Codebusters

- **All 11 Division C cipher types for 2026–27**, generated fresh every time: Aristocrat
  (random/K1/K2/K3 + keyword questions), Patristocrat, Xenocrypt (Spanish, with Ñ), Baconian,
  Fractionated Morse, Cryptarithm, Porta, Complete Columnar, Nihilist, Checkerboard, and the new
  Homophonic. The 2027 removals (Hill, Affine, Atbash and Caesar for Div C) are not included.
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
