import { GUIDES, OFFICIAL, cipherInfo, type CipherType } from "@sciolyguide/codebusters";

const MODE_LABEL = { decode: "Decode", cryptanalysis: "Cryptanalysis", keyword: "Keyword" } as const;

/** The "How to solve" page body, shared by the app and the demo build. */
export function LearnContent({ type, practiceHref }: { type: CipherType; practiceHref: string }) {
  const info = cipherInfo(type);
  const guide = GUIDES[type];
  const official = OFFICIAL[type];
  return (
    <>
      <header className="space-y-2">
        <p className="text-sm font-medium text-brand-600 dark:text-brand-300">{info.family}</p>
        <h1 className="text-3xl font-bold tracking-tight [text-wrap:balance]">How to solve {info.name}</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{guide.summary}</p>
      </header>

      <section className="card space-y-3 border-l-4 border-l-brand-500 p-5" aria-labelledby="official-def">
        <h2 id="official-def" className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          How Science Olympiad describes it
        </h2>
        <p className="leading-relaxed">{official.definition}</p>
        {official.history && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold">History:</span> {official.history}
          </p>
        )}
        <p className="text-xs text-zinc-500">
          Paraphrased from the{" "}
          <a className="underline hover:text-brand-600" href={official.source.url} target="_blank" rel="noreferrer">
            {official.source.label}
          </a>
          . The official rules manual takes precedence.
        </p>
      </section>

      <div className="card grid gap-4 p-5 sm:grid-cols-2">
        {(["regional", "state"] as const).map((lvl) => (
          <div key={lvl}>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{lvl === "regional" ? "Regional / Invitational" : "State / National"}</p>
            <p className="mt-1 font-medium">{info.levels[lvl].map((m) => MODE_LABEL[m]).join(" · ")}</p>
          </div>
        ))}
        <p className="text-xs text-zinc-500 sm:col-span-2">What this cipher can be asked as in Division C, 2026–27.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Method</h2>
        <ol className="space-y-3">
          {guide.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-800 dark:bg-brand-900/60 dark:text-brand-200">
                {i + 1}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">Tips</h2>
        <ul className="list-disc space-y-2 pl-5">
          {guide.tips.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>
      <a href={practiceHref} className="btn btn-primary">
        Practice {info.name} →
      </a>
    </>
  );
}
