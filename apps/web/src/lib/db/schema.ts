import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    /** Lower-cased, unique. We deliberately collect no email or real name. */
    username: text("username").notNull(),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [uniqueIndex("users_username_idx").on(t.username)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    /** SHA-256 of the session token; the raw token only lives in the cookie. */
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const tests = sqliteTable(
  "tests",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    level: text("level", { enum: ["regional", "state"] }).notNull(),
    seed: integer("seed").notNull(),
    /** JSON: number[] — indices of special-bonus questions. */
    specials: text("specials").notNull(),
    startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }).notNull(),
    finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
    /** Seconds to solve the timed question, if solved within the limit. */
    timedSeconds: integer("timed_seconds"),
    score: integer("score"),
    maxScore: integer("max_score").notNull(),
  },
  (t) => [index("tests_user_idx").on(t.userId, t.startedAt)],
);

export const attempts = sqliteTable(
  "attempts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["practice", "timed", "test"] }).notNull(),
    cipherType: text("cipher_type").notNull(),
    /** JSON PuzzleSpec — the puzzle is regenerated from this on the server. */
    spec: text("spec").notNull(),
    testId: text("test_id").references(() => tests.id, { onDelete: "cascade" }),
    questionIndex: integer("question_index"),
    status: text("status", { enum: ["active", "solved", "unsolved", "revealed", "skipped"] }).notNull(),
    /** JSON Response (answer boxes + final field) — autosaved. */
    response: text("response").notNull(),
    /** JSON: client-side tool state (A/B assignments, trigraph notes, …). */
    notes: text("notes"),
    points: integer("points").notNull(),
    score: integer("score"),
    errors: integer("errors"),
    checks: integer("checks").notNull().default(0),
    hints: integer("hints").notNull().default(0),
    /** Active solving time reported by the client (practice) or wall clock (timed/test). */
    elapsedMs: integer("elapsed_ms").notNull().default(0),
    startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
  },
  (t) => [
    index("attempts_user_type_idx").on(t.userId, t.cipherType, t.status),
    index("attempts_user_finished_idx").on(t.userId, t.finishedAt),
    index("attempts_test_idx").on(t.testId, t.questionIndex),
  ],
);

/** The events a student has chosen to study. */
export const userEvents = sqliteTable(
  "user_events",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventSlug: text("event_slug").notNull(),
    addedAt: integer("added_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.eventSlug] })],
);

/** A run of questions: a practice set or a timed station test (Rocks and Minerals). */
export const quizSessions = sqliteTable(
  "quiz_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    event: text("event").notNull(),
    mode: text("mode", { enum: ["practice", "stations"] }).notNull(),
    /** JSON: practice → QuestionSpec[]; stations → StationTest. */
    plan: text("plan").notNull(),
    /** JSON: QResponse | null per question (flattened order). */
    responses: text("responses").notNull(),
    /** JSON: settings shown back to the student (focus, timing…). */
    config: text("config").notNull(),
    stationSeconds: integer("station_seconds"),
    startedAt: integer("started_at", { mode: "timestamp_ms" }).notNull(),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }),
    finishedAt: integer("finished_at", { mode: "timestamp_ms" }),
    score: integer("score"),
    maxScore: integer("max_score").notNull(),
  },
  (t) => [index("quiz_sessions_user_idx").on(t.userId, t.event, t.startedAt)],
);

/** One answered question, for per-specimen and per-skill mastery. */
export const rmAnswers = sqliteTable(
  "rm_answers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id").references(() => quizSessions.id, { onDelete: "cascade" }),
    specimenId: text("specimen_id"),
    skill: text("skill").notNull(),
    correct: integer("correct", { mode: "boolean" }).notNull(),
    /** Photo ID: the specimen id the student guessed (for mix-up tracking). */
    guess: text("guess"),
    answeredAt: integer("answered_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("rm_answers_user_idx").on(t.userId, t.answeredAt)],
);

/** Leitner-box flashcards (one per specimen per student). */
export const flashcards = sqliteTable(
  "flashcards",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardId: text("card_id").notNull(),
    box: integer("box").notNull(),
    dueAt: integer("due_at", { mode: "timestamp_ms" }).notNull(),
    reviews: integer("reviews").notNull().default(0),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.cardId] })],
);

/** A finished Anatomy & Physiology quiz: a practice set or a timed test. */
export const anatomyRuns = sqliteTable(
  "anatomy_runs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mode: text("mode", { enum: ["practice", "test"] }).notNull(),
    /** JSON: string[] — the topic slugs the run drew from. */
    topics: text("topics").notNull(),
    total: integer("total").notNull(),
    score: integer("score").notNull(),
    finishedAt: integer("finished_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("anatomy_runs_user_idx").on(t.userId, t.finishedAt)],
);

/** One answered Anatomy question, for per-topic and per-system accuracy. */
export const anatomyAnswers = sqliteTable(
  "anatomy_answers",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    runId: text("run_id").references(() => anatomyRuns.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(),
    correct: integer("correct", { mode: "boolean" }).notNull(),
    answeredAt: integer("answered_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("anatomy_answers_user_idx").on(t.userId, t.answeredAt)],
);

export type User = typeof users.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type TestRow = typeof tests.$inferSelect;
export type QuizSession = typeof quizSessions.$inferSelect;
export type AnatomyRun = typeof anatomyRuns.$inferSelect;
