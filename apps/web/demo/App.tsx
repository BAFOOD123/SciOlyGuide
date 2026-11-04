import { useEffect, useSyncExternalStore } from "react";
import { CIPHERS, EVENT_DESCRIPTION, SCORING, cipherInfo, generate, grade, isCipherType, specialBonus, timedBonus, type CipherType } from "@sciolyguide/codebusters";
import type { AttemptState } from "@/lib/codebusters-types";
import { PracticeClient } from "@/components/codebusters/PracticeClient";
import { TimedClient } from "@/components/codebusters/TimedClient";
import { TestClient, TestReview } from "@/components/codebusters/TestClient";
import { ConfirmButton } from "@/components/codebusters/common";
import { LearnContent } from "@/components/codebusters/LearnContent";
import { HomeView } from "@/components/home/HomeView";
import { RmHub } from "@/components/rocks/RmHub";
import { QuizReview, QuizRunner } from "@/components/rocks/QuizRunner";
import { Flashcards } from "@/components/rocks/Flashcards";
import { SpecimenGallery } from "@/components/rocks/SpecimenGallery";
import { ReferenceTables } from "@/components/rocks/ReferenceTables";
import { BUILD_BLOCK, DIV_C_EVENTS, eventBySlug } from "@/lib/events";
import { buildDeck, buildSessionView } from "@/lib/rocks-core";
import { masteryOf } from "@/lib/rocks-types";
import { SPECIMENS, specimensFor, type Focus } from "@sciolyguide/rocks-minerals";
import { demoRmStats, finishRm } from "./rocks-actions";
import { createPracticeAttempt, createTest, startTimed, submitTest, testQuestions } from "./actions";
import { computeStats, revealOf, toPublic } from "./helpers";
import { navigate, store, type DemoAttempt } from "./store";

const fmt = (ms: number | null) => {
  if (ms === null) return "—";
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const FAMILY_COLOR: Record<string, string> = {
  Substitution: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  Polybius: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
  Transposition: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  Polyalphabetic: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200",
  Other: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
};

function attemptState(a: DemoAttempt): AttemptState {
  const notes = a.notes as Record<string, unknown> & { _hinted?: number[] };
  return {
    id: a.id,
    status: a.status,
    response: a.response,
    notes,
    elapsedMs: a.elapsedMs,
    checks: a.checks,
    hints: a.hints,
    hinted: notes._hinted ?? [],
    score: a.score,
    errors: a.errors,
  };
}

function Crumb({ children }: { children: React.ReactNode }) {
  return (
    <nav className="text-sm text-zinc-500">
      <a href="#codebusters" className="hover:underline">
        Codebusters
      </a>{" "}
      / <span className="text-zinc-800 dark:text-zinc-200">{children}</span>
    </nav>
  );
}

/* ------------------------------------ Hub ------------------------------------ */

function HubView() {
  const stats = computeStats(store.attempts());
  const rec = stats.recommended ? cipherInfo(stats.recommended) : null;
  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-brand-600 dark:text-brand-300">Division C · 2026–27</p>
          <h1 className="text-3xl font-bold tracking-tight [text-wrap:balance]">Codebusters</h1>
          <blockquote className="max-w-2xl text-zinc-700 dark:text-zinc-300">
            “{EVENT_DESCRIPTION.text}”{" "}
            <a className="text-xs text-zinc-500 underline" href={EVENT_DESCRIPTION.source.url} target="_blank" rel="noreferrer">
              {EVENT_DESCRIPTION.source.label}
            </a>
          </blockquote>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Unlimited generated puzzles for every 2027 cipher, scored by tournament rules ({SCORING.freeErrors} free errors, then −
            {SCORING.penaltyPerError} each).
          </p>
        </div>
        <dl className="flex gap-6 text-sm">
          {[
            ["Solved", String(stats.totalSolved)],
            ["Streak", `${stats.streakDays}d`],
            ["Best timed", fmt(stats.bestTimedMs)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-zinc-500">{k}</dt>
              <dd className="text-2xl font-bold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <form action={startTimed} className="card flex flex-col gap-3 p-5">
          <h2 className="font-semibold">Timed question</h2>
          <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
            The test opener: an Aristocrat against the clock. Solve it in under 10 minutes for {SCORING.timedBonusPerSecond} bonus points per
            second left.
          </p>
          <button className="btn btn-primary self-start">Start the clock</button>
        </form>
        <div className="card flex flex-col gap-3 p-5">
          <h2 className="font-semibold">Full mock test</h2>
          <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
            {SCORING.testMinutes} minutes with a tournament question mix, a timed question and three special bonus questions.
          </p>
          <div className="flex flex-wrap gap-2">
            <form action={createTest.bind(null, "regional")}>
              <button className="btn btn-primary">Regional</button>
            </form>
            <form action={createTest.bind(null, "state")}>
              <button className="btn btn-secondary">State / Nationals</button>
            </form>
            <a href="#tests" className="btn btn-ghost">
              Past tests
            </a>
          </div>
        </div>
        <div className="card flex flex-col gap-3 p-5">
          <h2 className="font-semibold">Recommended next</h2>
          {rec && (
            <>
              <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                <b className="text-zinc-900 dark:text-zinc-100">{rec.name}</b>:{" "}
                {stats.byType[rec.type].attempts === 0
                  ? "you haven't tried this one yet."
                  : `your weakest cipher (${Math.round((stats.byType[rec.type].accuracy ?? 0) * 100)}% solved).`}
              </p>
              <a href={`#practice-${rec.type}`} className="btn btn-primary self-start">
                Practice {rec.name}
              </a>
            </>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Ciphers</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CIPHERS.map((c) => {
            const s = stats.byType[c.type];
            const pct = s.accuracy === null ? 0 : Math.round(s.accuracy * 100);
            return (
              <div key={c.type} className="card flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  <span className={`chip ${FAMILY_COLOR[c.family]}`}>{c.family}</span>
                </div>
                <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">{c.blurb}</p>
                <div className="space-y-1.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="flex justify-between gap-2 text-xs text-zinc-500">
                    <span>{s.attempts ? `${s.solved}/${s.attempts} solved` : "Not started"}</span>
                    <span className="tabular-nums">
                      median {fmt(s.medianMs)} · best {fmt(s.bestMs)}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href={`#practice-${c.type}`} className="btn btn-primary flex-1">
                    Practice
                  </a>
                  <a href={`#learn-${c.type}`} className="btn btn-secondary">
                    Learn
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {stats.recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Recent activity</h2>
          <div className="card divide-y divide-zinc-100 dark:divide-zinc-800">
            {stats.recent.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <span className="w-40 font-medium">{isCipherType(a.cipherType) ? cipherInfo(a.cipherType).name : a.cipherType}</span>
                <span className="chip bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{a.kind}</span>
                <span className={a.status === "solved" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>{a.status}</span>
                <span className="ml-auto tabular-nums text-zinc-500">
                  {a.score ?? 0}/{a.points} pts{a.kind !== "test" && ` · ${fmt(a.elapsedMs)}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* --------------------------------- Practice ---------------------------------- */

function PracticeView({ type }: { type: CipherType }) {
  const info = cipherInfo(type);
  const mine = store
    .attempts()
    .filter((a) => a.kind === "practice" && a.cipherType === type)
    .sort((a, b) => b.startedAt - a.startedAt);
  const attempt = mine.find((a) => a.status === "active") ?? createPracticeAttempt(type, mine[0]?.spec.options ?? info.defaults);
  const puzzle = generate(attempt.spec);
  return (
    <div className="space-y-4">
      <Crumb>{info.name}</Crumb>
      <PracticeClient
        key={attempt.id}
        puzzle={toPublic(puzzle)}
        attempt={attemptState(attempt)}
        info={info}
        options={{ ...info.defaults, ...attempt.spec.options }}
      />
    </div>
  );
}

/* ----------------------------------- Learn ----------------------------------- */

function LearnView({ type }: { type: CipherType }) {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Crumb>Learn {cipherInfo(type).name}</Crumb>
      <LearnContent type={type} practiceHref={`#practice-${type}`} />
    </article>
  );
}

/* ----------------------------------- Timed ----------------------------------- */

function TimedView() {
  const all = store.attempts().filter((a) => a.kind === "timed");
  const active = all.filter((a) => a.status === "active").sort((a, b) => b.startedAt - a.startedAt)[0];
  if (active) {
    return (
      <div className="space-y-4">
        <Crumb>Timed question</Crumb>
        <TimedClient key={active.id} puzzle={toPublic(generate(active.spec))} startedAt={active.startedAt} attempt={{ ...attemptState(active), elapsedMs: 0 }} />
      </div>
    );
  }
  const history = all.filter((a) => a.status === "solved").sort((a, b) => b.finishedAt! - a.finishedAt!).slice(0, 10);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card space-y-4 p-6 text-center">
        <h1 className="text-2xl font-bold">Timed question</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Every Codebusters test opens with a timed Aristocrat. The clock stops when your answer has at most {SCORING.freeErrors} errors. Each
          second under {SCORING.timedLimitSeconds / 60} minutes is worth {SCORING.timedBonusPerSecond} bonus points.
        </p>
        <form action={startTimed}>
          <button className="btn btn-primary px-6 py-3 text-base">Start the clock</button>
        </form>
      </div>
      {history.length > 0 && (
        <div className="card p-5">
          <h2 className="mb-3 font-semibold">Your recent solves</h2>
          <ul className="space-y-1 text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex justify-between tabular-nums">
                <span>{new Date(h.finishedAt!).toLocaleDateString()}</span>
                <span>
                  {fmt(h.elapsedMs)} · bonus {timedBonus(h.elapsedMs / 1000)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- Tests ----------------------------------- */

function TestsView() {
  const tests = Object.values(store.get().tests).sort((a, b) => b.startedAt - a.startedAt);
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Crumb>Mock tests</Crumb>
        <h1 className="text-3xl font-bold tracking-tight">Mock tests</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          A full {SCORING.testMinutes}-minute Division C test. Question 1 is the timed Aristocrat, three questions are marked ★ special bonus, and
          the mix follows what the 2027 rules allow at each level. The test submits itself when time runs out.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {(["regional", "state"] as const).map((lvl) => (
          <form key={lvl} action={createTest.bind(null, lvl)} className="card space-y-3 p-5">
            <h2 className="font-semibold">{lvl === "regional" ? "Regional / Invitational" : "State / Nationals"}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {lvl === "regional"
                ? "About 14–15 questions. Porta and Nihilist are decode-only, and Homophonic is cryptanalysis."
                : "About 19–20 questions, with more Xenocrypts and cryptanalysis versions of Porta, Nihilist and Checkerboard."}
            </p>
            <button className="btn btn-primary">Start {lvl === "regional" ? "Regional" : "State"} test</button>
          </form>
        ))}
      </div>
      {tests.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Your tests</h2>
          <div className="card divide-y divide-zinc-100 dark:divide-zinc-800">
            {tests.map((t) => (
              <a key={t.id} href={`#test-${t.id}`} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <span className="w-44">{new Date(t.startedAt).toLocaleString()}</span>
                <span className="chip bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{t.level}</span>
                <span className="ml-auto font-semibold tabular-nums">{t.finishedAt ? `${t.score} pts` : "In progress →"}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TestView({ id }: { id: string }) {
  const test = store.get().tests[id];
  const expired = !!test && !test.finishedAt && Date.now() > test.endsAt + 30_000;
  useEffect(() => {
    if (expired) void submitTest(id);
  }, [expired, id]);
  if (!test) return <NotFound />;
  const rows = testQuestions(id);
  const specials = new Set(test.specials);
  const level = test.level === "state" ? "State / Nationals" : "Regional";

  if (!test.finishedAt) {
    if (expired) return <p className="text-zinc-500">Time is up. Grading…</p>;
    return (
      <div className="space-y-4">
        <Crumb>Mock test ({level})</Crumb>
        <TestClient
          key={id}
          testId={id}
          endsAt={test.endsAt}
          questions={rows.map((a) => ({
            attemptId: a.id,
            puzzle: toPublic(generate(a.spec)),
            response: a.response,
            notes: a.notes,
            special: specials.has(a.questionIndex!),
          }))}
          timed={test.timedSeconds !== null ? { seconds: test.timedSeconds, bonus: timedBonus(test.timedSeconds) } : null}
        />
      </div>
    );
  }

  const review = rows.map((a) => {
    const puzzle = generate(a.spec);
    const g = grade(puzzle, a.response);
    return {
      puzzle: toPublic(puzzle),
      response: a.response,
      reveal: revealOf(puzzle, g.wrong),
      score: g.score,
      errors: g.errors,
      special: specials.has(a.questionIndex!),
      penaltyFree: g.solved && g.penalty === 0,
    };
  });
  const base = review.reduce((s, q) => s + q.score, 0);
  const tBonus = test.timedSeconds !== null ? timedBonus(test.timedSeconds) : 0;
  const sBonus = specialBonus(review.filter((q) => q.special && q.penaltyFree).length);
  const solved = review.filter((q) => q.errors <= q.puzzle.answer.freeErrors).length;
  return (
    <div className="space-y-6">
      <Crumb>Mock test results</Crumb>
      <div className="card grid gap-6 p-6 sm:grid-cols-[auto_1fr]">
        <div>
          <p className="text-sm text-zinc-500">{level} mock test</p>
          <p className="text-5xl font-bold tabular-nums">{test.score}</p>
          <p className="text-sm text-zinc-500">points</p>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            ["Questions", `${base} / ${test.maxScore}`],
            ["Timed bonus", `+${tBonus}`],
            ["Special bonus", `+${sBonus}`],
            ["Solved", `${solved}/${review.length}`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-zinc-500">{k}</dt>
              <dd className="text-xl font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <TestReview questions={review} />
      <div className="flex flex-wrap gap-2">
        <a href="#tests" className="btn btn-primary">
          Take another test
        </a>
        <a href="#codebusters" className="btn btn-secondary">
          Back to Codebusters
        </a>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-zinc-600 dark:text-zinc-400">That page doesn&apos;t exist in this demo.</p>
      <a href="#home" className="btn btn-primary">
        Go home
      </a>
    </div>
  );
}

/* ------------------------------- Home and events ------------------------------ */

function HomeDemo() {
  const cb = computeStats(store.attempts());
  const rm = demoRmStats();
  const progress: Record<string, string> = {
    codebusters: cb.totalAttempts ? `${cb.totalSolved} puzzles solved · ${cb.streakDays}-day streak` : "11 cipher types, timed questions and mock tests.",
    "rocks-and-minerals": rm.answered
      ? `${rm.mastered}/92 specimens mastered · ${Math.round((rm.accuracy ?? 0) * 100)}% correct${rm.dueCards ? ` · ${rm.dueCards} cards due` : ""}`
      : "92 official specimens: ID drills, station tests and flashcards.",
  };
  return <HomeView displayName="Demo student" chosen={store.get().events} progress={progress} />;
}

function EventDemo({ slug }: { slug: string }) {
  const e = eventBySlug(slug);
  if (!e) return <NotFound />;
  const sameBlock = e.block === BUILD_BLOCK ? [] : DIV_C_EVENTS.filter((o) => o.block === e.block && o.slug !== e.slug);
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <nav className="text-sm text-zinc-500">
        <a href="#home" className="hover:underline">Home</a> / <span className="text-zinc-800 dark:text-zinc-200">{e.name}</span>
      </nav>
      <header className="space-y-2">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-300">{e.category}</p>
        <h1 className="text-3xl font-bold tracking-tight">{e.name}</h1>
        <blockquote className="text-lg text-zinc-700 dark:text-zinc-300">“{e.description}”</blockquote>
        <p className="text-xs text-zinc-500">Official short description, soinc.org</p>
      </header>
      <div className="card space-y-3 p-5">
        <p className="font-semibold">Study tools for {e.name} are coming soon.</p>
        <div className="flex flex-wrap gap-2">
          <a className="btn btn-primary" href={e.officialUrl} target="_blank" rel="noreferrer">Official event page and resources ↗</a>
          <a className="btn btn-secondary" href="#home">Back to home</a>
        </div>
      </div>
      <dl className="grid gap-4 text-sm sm:grid-cols-2">
        <div className="card p-4">
          <dt className="text-zinc-500">2027 national conflict block</dt>
          <dd className="text-lg font-semibold">{e.block === BUILD_BLOCK ? "Block 7 (build events)" : `Block ${e.block}`}</dd>
          {sameBlock.length > 0 && <dd className="mt-1 text-zinc-600 dark:text-zinc-400">Same block as {sameBlock.map((o) => o.name).join(", ")}.</dd>}
        </div>
        <div className="card p-4">
          <dt className="text-zinc-500">Format</dt>
          <dd className="text-lg font-semibold">{e.build ? "Built before the tournament" : "Competed on site"}</dd>
        </div>
      </dl>
    </article>
  );
}

/* ----------------------------- Rocks and Minerals ----------------------------- */

function RmCrumb({ children }: { children: React.ReactNode }) {
  return (
    <nav className="text-sm text-zinc-500">
      <a href="#rocks" className="hover:underline">Rocks and Minerals</a> / <span className="text-zinc-800 dark:text-zinc-200">{children}</span>
    </nav>
  );
}

function RmQuizDemo({ id }: { id: string }) {
  const sess = store.get().rmSessions[id];
  const expired = !!sess && !sess.finishedAt && !!sess.endsAt && Date.now() > sess.endsAt + 15_000;
  useEffect(() => {
    if (expired) void finishRm(id);
  }, [expired, id]);
  if (!sess) return <NotFound />;
  const view = buildSessionView(sess);
  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-3xl">
        <RmCrumb>{view.mode === "stations" ? "Station test" : "Practice"}</RmCrumb>
      </div>
      {view.finished ? <QuizReview view={view} score={sess.score ?? 0} /> : <QuizRunner key={id} view={view} />}
    </div>
  );
}

const FOCI: Focus[] = ["all", "minerals", "rocks", "igneous", "sedimentary", "metamorphic"];
function RmCardsDemo({ arg }: { arg: string }) {
  const front = arg.endsWith("-name") ? "name" : "clues";
  const deckName = arg.replace(/-(name|clues)$/, "");
  const focus = FOCI.includes(deckName as Focus) ? (deckName as Focus) : "all";
  const rows = Object.entries(store.get().cards).map(([cardId, c]) => ({ cardId, ...c }));
  const deck = buildDeck(rows, specimensFor(focus).map((s) => s.id));
  return (
    <div className="space-y-4">
      <div className="mx-auto max-w-2xl">
        <RmCrumb>Flashcards</RmCrumb>
      </div>
      <Flashcards key={arg} deck={deck} direction={front} />
    </div>
  );
}

function RmSpecimensDemo() {
  const stats = demoRmStats();
  const mastery = Object.fromEntries(SPECIMENS.map((s) => [s.id, masteryOf(stats.bySpecimen[s.id])]));
  return (
    <div className="space-y-6">
      <RmCrumb>Specimens</RmCrumb>
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Specimen gallery</h1>
        <p className="text-zinc-600 dark:text-zinc-400">The 92 specimens of the official Ward&apos;s kit, numbered as on the kit list. Values are typical; real specimens vary.</p>
      </header>
      <SpecimenGallery mastery={mastery} />
    </div>
  );
}

/* ------------------------------------ Shell ---------------------------------- */

function subscribe(cb: () => void) {
  const off = store.subscribe(cb);
  window.addEventListener("hashchange", cb);
  return () => {
    off();
    window.removeEventListener("hashchange", cb);
  };
}
const snapshot = () => `${location.hash}|${store.version()}`;

function route(view: string) {
  if (!view || view === "home") return <HomeDemo />;
  if (view === "codebusters") return <HubView />;
  if (view === "rocks") return <RmHub stats={demoRmStats()} />;
  if (view === "rocks-specimens") return <RmSpecimensDemo />;
  if (view === "rocks-reference")
    return (
      <div className="space-y-6">
        <RmCrumb>Reference</RmCrumb>
        <h1 className="text-3xl font-bold tracking-tight">Reference tables</h1>
        <ReferenceTables />
      </div>
    );
  if (view.startsWith("rocks-quiz-")) return <RmQuizDemo key={view} id={view.slice(11)} />;
  if (view.startsWith("rocks-cards-")) return <RmCardsDemo arg={view.slice(12)} />;
  if (view.startsWith("event-")) return <EventDemo slug={view.slice(6)} />;
  if (view === "timed") return <TimedView />;
  if (view === "tests") return <TestsView />;
  const [section, ...rest] = view.split("-");
  const arg = rest.join("-");
  if (section === "practice" && isCipherType(arg)) return <PracticeView key={arg} type={arg} />;
  if (section === "learn" && isCipherType(arg)) return <LearnView type={arg} />;
  if (section === "test" && arg) return <TestView key={arg} id={arg} />;
  return <NotFound />;
}

export function App() {
  useSyncExternalStore(subscribe, snapshot, snapshot);
  const view = location.hash.slice(1);
  const chosen = store.get().events;
  const live = DIV_C_EVENTS.filter((e) => e.href).map((e) => e.slug);
  const navEvents = chosen.length ? live.filter((s) => chosen.includes(s)) : live;
  const navItem = (href: string, label: string, active: boolean) => (
    <a href={`#${href}`} className={`btn btn-ghost px-2 sm:px-3 ${active ? "text-zinc-900 dark:text-zinc-100" : ""}`} aria-current={active ? "page" : undefined}>
      {label}
    </a>
  );
  return (
    <>
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="gutter mx-auto flex h-14 max-w-6xl items-center gap-2">
          <a href="#home" className="mr-1 flex items-center gap-2 font-bold tracking-tight">
            <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-brand-600 font-mono text-sm text-white">
              S
            </span>
            <span className="hidden min-[440px]:inline">SciOlyGuide</span>
            <span className="chip hidden bg-brand-100 text-brand-800 md:inline-flex dark:bg-brand-900/60 dark:text-brand-200">Div C · 2027</span>
          </a>
          <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto text-sm" aria-label="Main">
            {navItem("home", "Home", !view || view === "home" || view.startsWith("event-"))}
            {navEvents.includes("rocks-and-minerals") &&
              navItem("rocks", "Rocks", view.startsWith("rocks"))}
            {navEvents.includes("codebusters") &&
              navItem("codebusters", "Codebusters", ["codebusters", "timed", "tests"].includes(view) || /^(practice|learn|test)-/.test(view))}
          </nav>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="chip hidden bg-amber-100 text-amber-900 sm:inline-flex dark:bg-amber-900/40 dark:text-amber-200">Demo student</span>
            <ConfirmButton
              className="btn btn-secondary whitespace-nowrap px-3 py-1.5"
              confirmLabel="Click to erase"
              onConfirm={() => {
                store.reset();
                navigate("home");
              }}
            >
              Reset
            </ConfirmButton>
          </div>
        </div>
      </header>
      <div className="border-b border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="gutter mx-auto max-w-6xl py-2 text-xs sm:text-sm">
          <b>Demo.</b> This runs entirely in your browser, and progress saves on this device. The real app saves it to each student&apos;s account.
        </p>
      </div>
      <main id="main" className="gutter mx-auto max-w-6xl py-8">
        {route(view)}
      </main>
      <footer className="gutter mx-auto max-w-6xl pb-10 text-xs text-zinc-500">
        SciOlyGuide is a free, student-made study tool. Not affiliated with or endorsed by Science Olympiad, Inc. Official rules are at{" "}
        <a className="underline" href="https://www.soinc.org" target="_blank" rel="noreferrer">
          soinc.org
        </a>
        .
      </footer>
    </>
  );
}
