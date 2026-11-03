# SciOlyGuide — Framework Design

> Status: draft v0.1 · Season target: 2026–27 (the "2027" season)

## 1. What we're building

SciOlyGuide is one study app that covers every Science Olympiad event. **Each event page
is built for the way that event is actually competed.** A Rocks & Minerals page is mostly
specimen-ID drills, a Codebusters page is a timed cipher trainer, and a Scrambler page is
a build log plus a score calculator. A generic "notes + quiz" template would not fit most
events, so the pages are composed per event.

Three content pillars feed every page:

| Pillar | Source | How we use it |
|---|---|---|
| **Learn** | Scioly.org wiki + our own written notes | Topic tree, study notes, flashcards |
| **Rules** | soinc.org (official) | Event facts, links to the official rules, our own summaries |
| **Practice** | Past tests (with permission) + generated problems | Drills, timed mock tests, analytics |

## 2. Core idea: events are composed from *archetypes* and *modules*

Each event has one or more **archetypes**. An archetype is the kind of skill the event
tests. Each archetype brings a default set of **modules** (UI and study tools). The
event's config can add, remove or reorder modules. This is what lets every page fit its
event without a separate hand-coded page for each of the 32 unique events.

```
Event (season-scoped config)
 ├─ archetypes: [identification, knowledge]
 ├─ topics: tree of learning objectives  ──► linked to wiki pages / notes / questions
 ├─ modules: defaults from archetypes + per-event overrides
 └─ constraints: time limit, allowed resources, calculator class, team size
```

### Archetypes → default modules

| Archetype | What the event tests | Default modules |
|---|---|---|
| `knowledge` | Breadth of content on a written test | Study Guide, Flashcards (SRS), Topic Drills, Mock Test |
| `identification` | Naming specimens or images at stations | Image-ID Drill, Station Rotation (timed), Specimen Gallery |
| `calculation` | Quantitative problem solving | Problem Generator, Formula Sheet, Worked Solutions |
| `lab` | Hands-on tasks at the event | Procedure Walkthroughs, Decision Flowcharts (e.g. qual analysis), Virtual Lab |
| `cipher` | Speed decoding (Codebusters) | Cipher Trainer, Timed Packets, Speed Leaderboard |
| `case-study` | Reading data and scenarios (Disease Detectives) | Case Scenarios, 2×2 / Epi Calculator Drills |
| `design-writeup` | Designing and writing up an experiment | Write-up Coach (rubric-scored), Timed Prompt Practice |
| `communication` | Describing or building with a partner (Write It Do It) | Partner Drill, Description Clarity Feedback |
| `modeling-3d` | 3D reasoning (Protein Modeling, Engineering CAD) | Molecule Viewer / CAD Challenges |
| `build` | A device built before the tournament | Build Log, Trial Data Logger, Score Calculator, Design Calculators, Impound Checklist |

Every event also gets: **Overview** (our summary + link to the official rules),
**Resources** (wiki links, recommended references), **Notes-Sheet / Binder Builder** where
the rules allow one, and **Progress** (topic mastery).

### 2027 event → archetype map

The full machine-readable version is in [`content/seasons/2027/events.yaml`](../content/seasons/2027/events.yaml).
Event list and conflict blocks come from the official SO 2027 Conflict Blocks sheet.

| Event | Div | Archetypes |
|---|---|---|
| Anatomy & Physiology | B, C | knowledge |
| Astronomy | C | knowledge, calculation, identification |
| Boomilever | B, C | build, calculation |
| Botany | B, C | knowledge, identification |
| Chemistry Lab | C | lab, calculation |
| Circuit Lab | B, C | calculation, lab |
| Codebusters | B, C | cipher |
| Crime Busters | B | lab, identification |
| Designer Genes | C | knowledge |
| Disease Detectives | B, C | case-study, calculation |
| Dynamic Planet | B, C | knowledge |
| Electric Vehicle | C | build |
| Elastic Launched Glider | B | build |
| Engineering CAD | C | modeling-3d |
| Experimental Design | B, C | design-writeup, lab |
| Food Science | B | knowledge, lab |
| Forensics | C | lab, identification |
| Heredity | B | knowledge, calculation |
| Hovercraft | B, C | build, calculation |
| Meteorology | B | knowledge, calculation |
| Mission Possible | C | build |
| Ping Pong Parachute | B, C | build |
| Protein Modeling | C | knowledge, modeling-3d |
| Remote Sensing | B, C | knowledge, calculation, identification |
| Rocks and Minerals | B, C | identification, knowledge |
| Roller Coaster | B | build |
| Scrambler | B | build |
| Solar System | B | knowledge |
| Thermodynamics | B, C | calculation, knowledge |
| Water Quality | B, C | knowledge, lab, calculation |
| Wright Stuff | C | build |
| Write It Do It | B | communication |

> ⚠️ The archetype tags are my reading of how these events usually run. Several events
> (Thermodynamics, Water Quality, Protein Modeling, Hovercraft) have had a pre-built
> device or model in some seasons. Confirm each one against the **2027 rules manual**
> before a page ships. The registry has a `rules_verified` flag for this.

## 3. Content sources and legal constraints

This part decides what the app can show, so it has to be settled first.

### 3.1 Scioly.org wiki
- **Don't scrape it.** scioly.org sits behind Anubis bot protection, which blocked my
  automated requests during research. That tells us the operators don't want bulk
  crawling.
- **Ask for access.** Contact the Scioly.org admins, explain the project and ask for an
  export. MediaWiki supports `Special:Export` and full XML dumps. This also opens the door
  to a real partnership.
- **License.** I couldn't confirm the wiki's license (the copyright page was blocked). My
  understanding is that it's a Creative Commons *NonCommercial-ShareAlike* license. If so:
  - Content derived from the wiki must keep the same license and attribution (page title,
    revision link, license link) on every page that uses it.
  - Those pages can't be monetized. This rules out paywalls on wiki-derived content and
    pushes the business model toward free, donation or a paid tier that covers only
    original content.
  - **Design response:** store every content block with a `license` and `provenance`
    field. Keep wiki-derived content in its own namespace so it can be tracked, attributed
    and filtered if the terms change.
- Ingestion stores `page_title`, `revision_id` and `retrieved_at` for each block, so we can
  link back to the exact revision and re-sync on updates.

### 3.2 soinc.org (Science Olympiad, Inc.)
- The rules manual is a copyrighted product that SO sells. **Never reproduce the rules.**
- What we can store: plain facts (event name, division, conflict block, team size), our own
  summaries in our own words, and **deep links** to the official event pages, rules and
  clarifications/FAQ.
- Every event page shows a clear "Official rules are on soinc.org" banner. Students compete
  under the official text, not our summary.
- The app must not use SO's logo or trademarks in a way that suggests an endorsement.

### 3.3 Practice tests (Test Exchange, invitationals)
- Each test belongs to its authors or tournament. Posting a test publicly is **not** a
  license to embed or republish it.
- Tiered approach:
  1. **Index:** store metadata (tournament, year, event, link) and link out. Always allowed.
  2. **Embed with permission:** sign agreements with invitationals or test writers. Many
     will say yes for credit and a backlink. Then digitize tests into the question bank
     with `provenance.source = "licensed"` and the author credited.
  3. **Original bank:** our own written and generated questions. We own these.
- Ask permission at the tournament or test-writer level, not test by test, so it scales.

## 4. Question bank and generation

### 4.1 One question schema for every event
The types are in [`packages/schema/src/question.ts`](../packages/schema/src/question.ts).
Supported question types:

`mcq` · `multi-select` · `numeric` (tolerance + units + sig figs) · `short-answer`
(accepted answers + fuzzy match) · `free-response` (rubric) · `image-id` · `matching` ·
`ordering` · `cipher` · `data-table` (fill-in from a data set)

Each question carries: `topics[]`, `difficulty`, `seasons[]` (which rule years it's valid
for), `provenance`, `review.status` and an optional `solution` (worked steps).

### 4.2 Two generation paths

**A. Deterministic templates: correct by construction.** Use these first.
A template has parameters, a solver and a renderer. Examples:
- Codebusters: aristocrat, patristocrat, xenocrypt, Hill, Baconian, affine and so on,
  generated from a plaintext corpus. Grading is exact and generation is unlimited.
- Circuit Lab: random resistor networks with a solver that checks the answer.
- Astronomy: Kepler's laws, distance modulus, Wien's law, using real object parameters.
- Disease Detectives: 2×2 tables → attack rate, relative risk, odds ratio.
- Heredity: Punnett squares, probability, pedigrees.
- Chemistry Lab / Water Quality: stoichiometry, dilutions, pH.

**B. LLM-generated: grounded and reviewed.** Use this for conceptual and knowledge events.
1. Retrieve from *our* curated content for that topic (RAG over wiki-derived notes and
   original notes, with license filtering).
2. Generate the question, answer, distractors and explanation, citing the source passages.
3. Verify automatically: a second model pass answers the question blind and must agree.
   Numeric answers are recomputed. Duplicates are caught with embeddings.
4. Run a **human review queue** (experienced competitors or coaches) before a question
   counts as "verified."
5. Show the status in the UI: unreviewed AI questions are labeled and are never used in
   mock tests.

### 4.3 Practice engine
- **Topic drills:** adaptive difficulty with per-topic mastery estimates.
- **Spaced repetition:** an FSRS scheduler for flashcards and ID specimens.
- **Mock test:** uses the event's time limit and format, with a tiebreaker section and a
  score report broken down by topic.
- **Station rotation:** timed stations for ID and lab events, the way they run at
  tournaments.
- **Partner mode:** most events are played in pairs. Two students can share a session and
  split the topics.

## 5. Build events (deep dive)

Build events need tools more than reading material:
- **Score calculator:** set up from the season's scoring formula (stored as a typed
  expression, written from our reading of the rules and linked to the rule section).
- **Trial logger:** record each run (date, settings, conditions, result) and chart it.
  This answers "is change X actually better?"
- **Design calculators:** physics helpers for each event (glider wing loading, lever and
  load analysis, motor/gear ratios for vehicles, energy budgets).
- **Build log and impound checklist:** photos, materials, specs to check before you leave
  for the tournament.

## 6. Coaches and teams
- Teams, rosters and event assignments (with conflict-block checks, since two events in
  the same block can't share a student).
- Assign drills or mock tests and see topic mastery for each student.
- Shared team notes per event that carry over to next season's partner.

## 7. Season model
Events rotate and rules change every year. **Season is part of every key.**
- `content/seasons/<year>/events.yaml` is the source of truth for each season.
- Topics and questions carry a `seasons[]` list. Rollover means copying the registry,
  diffing it against the new rules and re-tagging content. Nothing is deleted.
- Retired events stay browsable as an archive.

## 8. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| App | **Next.js (App Router) + TypeScript** | Static pages for SEO, server components, one codebase |
| Offline | **PWA** with cached study packs | Tournament venues often have poor Wi-Fi |
| Mobile | PWA first, Expo later if needed | Avoid splitting the codebase early |
| Content | **Git-versioned YAML + MDX** in this repo | Content goes through PR review like code, with diffs and history |
| DB | **Postgres (Supabase)** with auth and row-level security | Users, progress, teams, question bank, review queue |
| Search / RAG | Postgres full-text search + **pgvector** | One database to run |
| Math / Science UI | KaTeX, 3Dmol.js or Mol* (proteins), Recharts (trial logs) | |
| AI | Claude API: a large model for authoring and verification, a smaller one for bulk work | Batch generation offline, never on the student's request path |

### Repo layout
```
SciOlyGuide/
├─ apps/web/                 # Next.js app (to scaffold)
├─ packages/schema/          # Shared TS types: Event, Module, Question, Provenance  ✅
├─ packages/generators/      # Deterministic problem templates (ciphers, circuits, epi…)
├─ packages/engine/          # SRS, mastery model, mock-test assembly
├─ content/
│  ├─ seasons/2027/events.yaml  # Event registry  ✅
│  ├─ events/<slug>/topics.yaml # Topic tree per event
│  ├─ notes/<slug>/*.mdx        # Original notes
│  └─ wiki/<slug>/*.mdx         # Wiki-derived (license-tagged, attributed)
├─ pipelines/                # Wiki import, test digitization, LLM generation + verify
└─ docs/
```

## 9. Roadmap

**Phase 0: Foundations (now)**
- [x] Event registry for 2027 + archetype map
- [x] Core schema (Event, Module, Question, Provenance)
- [ ] Email Scioly.org admins about a data partnership and confirm the license
- [ ] Contact 3–5 invitationals about licensing their tests

**Phase 1: MVP with four events, one per major archetype**
Choose events that test the module system from different angles:
1. **Codebusters** (cipher): fully generated, so it's a showcase that needs no licensed content
2. **Rocks and Minerals** (identification): image-ID drills plus SRS
3. **Circuit Lab** or **Astronomy** (calculation): template generator plus formula sheet
4. **Anatomy & Physiology** (knowledge): study guide, flashcards, mock test

Also in Phase 1: accounts, progress tracking, mock tests, offline packs.

**Phase 2: Breadth.** Every non-build event gets a study guide and a practice bank. Add the
LLM pipeline and the review queue.

**Phase 3: Build events and teams.** Score calculators, trial loggers, coach dashboards,
conflict-block-aware rosters.

**Phase 4: Community.** Contributor and reviewer roles, question reports and fixes, and
partner tournaments publishing tests directly into the app.

## 10. Open decisions for you
1. **Business model:** free/donation, or freemium on original content only? This depends
   on the wiki license.
2. **Audience:** individual students first, or coach and team tools from day one?
3. **Divisions:** launch with B and C together, or C first?
4. **Platform:** web/PWA first (recommended), or native mobile from the start?
