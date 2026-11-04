"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { SPECIMENS, type Focus, type Photo, type QResponse } from "@sciolyguide/rocks-minerals";
import { photoAnswer, photoFollowUp, photoHintAction, photoRound } from "@/app/rocks-and-minerals/actions";
import { photoSrc, type Feedback, type PhotoRef, type PhotoResult } from "@/lib/rocks-types";
import { QuestionView, hasAnswer } from "./QuestionView";

const NAMES = SPECIMENS.map((s) => s.name).sort();

export const PHOTO_DECKS: { value: Focus; label: string }[] = [
  { value: "all", label: "All 92 specimens" },
  { value: "minerals", label: "Minerals" },
  { value: "rocks", label: "All rocks" },
  { value: "igneous", label: "Igneous" },
  { value: "sedimentary", label: "Sedimentary" },
  { value: "metamorphic", label: "Metamorphic" },
];

function pickWeighted(pool: PhotoRef[], avoid: Set<string>): PhotoRef {
  const choices = pool.filter((p) => !avoid.has(p.key));
  const list = choices.length ? choices : pool;
  const total = list.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of list) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return list.at(-1)!;
}

function loadPrefs(): { typed: boolean; followUp: boolean } {
  try {
    const v = JSON.parse(localStorage.getItem("sog-photo-prefs") ?? "{}");
    return { typed: v.typed ?? true, followUp: v.followUp ?? true };
  } catch {
    return { typed: true, followUp: true };
  }
}

export function Credit({ photo, className = "" }: { photo: Photo; className?: string }) {
  return (
    <p className={`text-[11px] leading-4 text-zinc-500 ${className}`}>
      Photo: {photo.author} ·{" "}
      {photo.licenseUrl ? (
        <a className="underline" href={photo.licenseUrl} target="_blank" rel="noreferrer">
          {photo.license}
        </a>
      ) : (
        photo.license
      )}{" "}
      ·{" "}
      <a className="underline" href={photo.source} target="_blank" rel="noreferrer">
        Wikimedia Commons
      </a>
    </p>
  );
}

export function PhotoDrill({ pool, deck, today }: { pool: PhotoRef[]; deck: Focus; today: { answered: number; correct: number } }) {
  const [prefs, setPrefs] = useState({ typed: true, followUp: true });
  useEffect(() => setPrefs(loadPrefs()), []);
  const savePrefs = (p: typeof prefs) => {
    setPrefs(p);
    try {
      localStorage.setItem("sog-photo-prefs", JSON.stringify(p));
    } catch {}
  };

  const recent = useRef<string[]>([]);
  const [current, setCurrent] = useState<PhotoRef | null>(null);
  const [choices, setChoices] = useState<string[] | null>(null);
  const [guess, setGuess] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [result, setResult] = useState<PhotoResult | null>(null);
  const [viewing, setViewing] = useState<Photo | null>(null);
  const [fuResponse, setFuResponse] = useState<QResponse | null>(null);
  const [fuFeedback, setFuFeedback] = useState<Feedback | null>(null);
  const [zoom, setZoom] = useState(false);
  const [counts, setCounts] = useState({ answered: today.answered, correct: today.correct, streak: 0, best: 0 });
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const next = useCallback(() => {
    if (!pool.length) return;
    const p = pickWeighted(pool, new Set(recent.current));
    recent.current = [p.key, ...recent.current].slice(0, Math.min(8, Math.floor(pool.length / 2)));
    setCurrent(p);
    setGuess("");
    setHints([]);
    setResult(null);
    setViewing(null);
    setFuResponse(null);
    setFuFeedback(null);
    setZoom(false);
    setChoices(null);
    if (!prefs.typed) startTransition(async () => setChoices((await photoRound(p.key)).choices));
    else setTimeout(() => inputRef.current?.focus(), 0);
  }, [pool, prefs.typed]);

  useEffect(() => {
    next();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.typed]);

  const submit = (g: string) => {
    if (!current || result || pending) return;
    startTransition(async () => {
      const r = await photoAnswer(current.key, g, hints.length, prefs.followUp);
      if (!r) return;
      setResult(r);
      setViewing(r.shown);
      setCounts((c) => {
        const streak = r.counted ? c.streak + 1 : 0;
        return { answered: c.answered + 1, correct: c.correct + (r.counted ? 1 : 0), streak, best: Math.max(c.best, streak) };
      });
    });
  };

  const hint = () => {
    if (!current || result || hints.length >= 3) return;
    startTransition(async () => {
      const h = (await photoHintAction(current.key, hints.length + 1)).hint;
      if (h) setHints((hs) => [...hs, h]);
    });
  };

  const checkFollowUp = () => {
    if (!result?.followUp) return;
    const q = result.followUp.question;
    const resp = fuResponse ?? (q.kind === "order" ? { order: q.items!.map((_, i) => i) } : null);
    if (!resp) return;
    startTransition(async () => setFuFeedback(await photoFollowUp(result.followUp!.spec, resp)));
  };

  // Keyboard: Enter = next (after answering), H = hint, 1–4 = choices.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === "INPUT";
      if (e.key === "Enter" && result && (!result.followUp || fuFeedback) && !typing) {
        e.preventDefault();
        next();
      } else if (!typing && !result && (e.key === "h" || e.key === "H")) hint();
      else if (!typing && !result && choices && /^[1-4]$/.test(e.key)) submit(choices[Number(e.key) - 1]!);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const shownPhoto = viewing ?? null;
  const imgKey = shownPhoto?.key ?? current?.key;
  const aspect = useMemo(() => (current ? `${current.width} / ${current.height}` : "4 / 3"), [current]);

  if (!pool.length) return <p className="text-zinc-500">No photos in this deck yet.</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label="Deck" className="flex flex-wrap gap-1.5">
          {PHOTO_DECKS.map((d) => (
            <Link
              key={d.value}
              href={`/rocks-and-minerals/photo-id?deck=${d.value}`}
              aria-current={d.value === deck ? "page" : undefined}
              className={`btn px-3 py-1.5 ${d.value === deck ? "btn-primary" : "btn-secondary"}`}
            >
              {d.label}
            </Link>
          ))}
        </nav>
        <dl className="ml-auto flex gap-5 text-sm tabular-nums" aria-label="Today">
          <div>
            <dt className="text-xs text-zinc-500">Today</dt>
            <dd className="font-semibold">
              {counts.correct}/{counts.answered}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Streak</dt>
            <dd className="font-semibold">{counts.streak}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Best</dt>
            <dd className="font-semibold">{counts.best}</dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="card min-w-0 overflow-hidden p-0">
          <button
            type="button"
            className={`relative block w-full bg-zinc-900 ${zoom ? "" : "max-h-[62vh]"}`}
            onClick={() => setZoom((z) => !z)}
            aria-label={zoom ? "Shrink photo" : "Enlarge photo"}
          >
            {imgKey && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={imgKey}
                src={photoSrc(imgKey)}
                alt="Specimen to identify"
                className={`mx-auto block h-full w-auto max-w-full object-contain ${zoom ? "" : "max-h-[62vh]"}`}
                style={{ aspectRatio: shownPhoto ? `${shownPhoto.width} / ${shownPhoto.height}` : aspect }}
              />
            )}
          </button>
          {result && shownPhoto && (
            <div className="space-y-2 px-4 py-3">
              <Credit photo={shownPhoto} />
              {result.photos.length > 1 && (
                <div className="flex flex-wrap gap-2" aria-label="More photos of this specimen">
                  {result.photos.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setViewing(p)}
                      className={`overflow-hidden rounded-lg border-2 ${p.key === shownPhoto.key ? "border-brand-500" : "border-transparent"}`}
                      aria-label="Show this photo"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoSrc(p.key)} alt="" className="h-16 w-20 object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {!result && <p className="px-4 py-2 text-[11px] text-zinc-500">Photo credit appears after you answer. Click the photo to enlarge it.</p>}
        </div>

        <div className="space-y-4">
          <div className="card space-y-4 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">Name this specimen</h2>
              <div className="flex rounded-lg border border-zinc-200 p-0.5 text-xs dark:border-zinc-700" role="group" aria-label="Answer style">
                <button type="button" onClick={() => savePrefs({ ...prefs, typed: true })} aria-pressed={prefs.typed} className={`rounded-md px-2 py-1 ${prefs.typed ? "bg-brand-600 text-white" : ""}`}>
                  Type
                </button>
                <button type="button" onClick={() => savePrefs({ ...prefs, typed: false })} aria-pressed={!prefs.typed} className={`rounded-md px-2 py-1 ${!prefs.typed ? "bg-brand-600 text-white" : ""}`}>
                  Choices
                </button>
              </div>
            </div>

            {!result &&
              (prefs.typed ? (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (guess.trim()) submit(guess);
                  }}
                >
                  <input
                    id="photo-guess"
                    ref={inputRef}
                    list="photo-names"
                    className="input text-base"
                    placeholder="Your guess"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    autoComplete="off"
                    aria-label="Your guess"
                  />
                  <datalist id="photo-names">
                    {NAMES.map((n) => (
                      <option key={n} value={n} />
                    ))}
                  </datalist>
                  <button className="btn btn-primary" disabled={pending || !guess.trim()}>
                    Answer
                  </button>
                </form>
              ) : (
                <div className="grid gap-2">
                  {(choices ?? []).map((c, i) => (
                    <button key={c} type="button" className="btn btn-secondary justify-start" onClick={() => submit(c)} disabled={pending}>
                      <span className="w-5 text-xs text-zinc-400">{i + 1}</span> {c}
                    </button>
                  ))}
                  {!choices && <p className="text-sm text-zinc-500">Loading choices…</p>}
                </div>
              ))}

            {!result && (
              <div className="space-y-2">
                {hints.map((h, i) => (
                  <p key={i} className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
                    <b>Hint {i + 1}:</b> {h}
                  </p>
                ))}
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-ghost px-3" onClick={hint} disabled={pending || hints.length >= 3}>
                    {hints.length ? `Another hint (${3 - hints.length} left)` : "Hint"} <span className="text-xs text-zinc-400">H</span>
                  </button>
                  <button type="button" className="btn btn-ghost px-3" onClick={() => submit("")} disabled={pending}>
                    I don&apos;t know
                  </button>
                </div>
                {hints.length >= 2 && <p className="text-xs text-zinc-500">With two or more hints, this one won&apos;t count toward mastery.</p>}
              </div>
            )}

            {result && (
              <div
                role="status"
                className={`space-y-2 rounded-xl p-4 ${result.correct ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100" : "bg-red-50 text-red-950 dark:bg-red-950/40 dark:text-red-100"}`}
              >
                <p className="text-lg font-bold">{result.correct ? `✓ ${result.name}` : `It's ${result.name}`}</p>
                {!result.correct && guess && <p className="text-sm">You said “{guess}”.</p>}
                {result.correct && !result.counted && <p className="text-sm">Correct, with hints: practice it again soon.</p>}
                <p className="text-sm">
                  <b>How to recognize it:</b> {result.tip}
                </p>
                {result.guessed && (
                  <p className="text-sm">
                    <b>{result.guessed.name}</b> instead: {result.guessed.tip}
                  </p>
                )}
                <Link href={`/rocks-and-minerals/specimens#${result.specimenId}`} className="inline-block text-sm font-medium underline">
                  Full specimen sheet
                </Link>
              </div>
            )}

            {result && result.followUp && (
              <div className="space-y-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Follow-up</p>
                <QuestionView
                  q={result.followUp.question}
                  index={9000}
                  response={fuResponse}
                  onChange={setFuResponse}
                  disabled={!!fuFeedback || pending}
                  feedback={fuFeedback}
                  showSpecimen={false}
                />
                {!fuFeedback && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={checkFollowUp}
                      disabled={pending || (result.followUp.question.kind !== "order" && !hasAnswer(result.followUp.question, fuResponse))}
                    >
                      Check
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={next}>
                      Skip
                    </button>
                  </div>
                )}
              </div>
            )}

            {result && (!result.followUp || fuFeedback) && (
              <button type="button" className="btn btn-primary w-full" onClick={next} autoFocus>
                Next photo <span className="text-xs opacity-70">↵</span>
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="accent-brand-600" checked={prefs.followUp} onChange={(e) => savePrefs({ ...prefs, followUp: e.target.checked })} />
            Ask a follow-up question about each specimen
          </label>
          <p className="text-xs text-zinc-500">
            {pool.length} photos in this deck. Specimens you miss come up more often, and mix-ups are tracked on the Rocks and Minerals page.
          </p>
        </div>
      </div>
    </div>
  );
}
