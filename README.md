# SciOlyGuide

A Science Olympiad study guide covering every event. Each event page is built from study
modules chosen for how that event is competed: ID drills for Rocks & Minerals, a cipher
trainer for Codebusters, a trial logger and score calculator for build events, and so on.

- **Design:** [`docs/DESIGN.md`](docs/DESIGN.md): architecture, content sources and licensing, question generation, roadmap
- **Event registry:** [`content/seasons/2027/events.yaml`](content/seasons/2027/events.yaml), with all 2027 events, divisions, conflict blocks and archetypes
- **Schema:** [`packages/schema`](packages/schema/src), with shared types for events, modules and questions

## Develop

Requires Node ≥ 22.18 (runs `.ts` files natively).

```bash
npm install
npm run check          # typecheck + validate the event registry
node scripts/validate-registry.ts content/seasons/2027/events.yaml --modules   # show each event's resolved page modules
```

Official rules live on [soinc.org](https://www.soinc.org). This project is not affiliated
with Science Olympiad, Inc. or Scioly.org.
