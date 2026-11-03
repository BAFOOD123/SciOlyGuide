import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

const FEATURES = [
  {
    title: "Every 2027 cipher, unlimited",
    body: "Aristocrats (K1–K3), Patristocrats, Xenocrypts, Baconian, Fractionated Morse, Cryptarithms, Porta, Columnar, Nihilist, Checkerboard, and the new Homophonic. All generated fresh and checked by tests.",
  },
  {
    title: "A real solving workspace",
    body: "Type a letter once and it fills everywhere. You get a live frequency table, conflict warnings, a trigraph decoder, a column arranger and a Polybius builder. Switch to paper mode to practice without them.",
  },
  {
    title: "Scored like the tournament",
    body: "Two free errors, then −100 each. The timed question earns a bonus, special bonus questions count, and the 50-minute mock tests are built for Regionals or States.",
  },
  {
    title: "Your progress, saved",
    body: "Sign in on any device and pick up mid-puzzle. Track accuracy and solve times for each cipher, and get pointed at your weakest one.",
  },
];

export default async function Home() {
  if (await getUser()) redirect("/dashboard");
  return (
    <div className="space-y-16 py-6">
      <section className="mx-auto max-w-3xl space-y-6 text-center">
        <p className="chip mx-auto bg-brand-100 text-brand-800 dark:bg-brand-900/60 dark:text-brand-200">Free · Division C · 2026–27 season</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          The Science Olympiad study guide that <span className="text-brand-600">trains you for the event</span>.
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Each event gets tools built around how it&apos;s actually competed. We&apos;re starting with Codebusters: unlimited practice for every
          cipher on the 2027 list, with your progress saved to your account.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/signup" className="btn btn-primary px-6 py-3 text-base">
            Create a free account
          </Link>
          <Link href="/signin" className="btn btn-secondary px-6 py-3 text-base">
            Sign in
          </Link>
        </div>
      </section>

      <section aria-label="Sample" className="card mx-auto max-w-3xl p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">Aristocrat</p>
        <div className="flex flex-wrap gap-x-5 gap-y-4 font-mono">
          {[
            ["CVP", "THE"],
            ["QRRZ", "GOOD"],
            ["CVLMQ", "THING"],
          ].map(([c, p]) => (
            <div key={c} className="flex gap-1">
              {[...c!].map((ch, i) => (
                <div key={i} className="flex w-8 flex-col items-center gap-1">
                  <span className="text-sm text-zinc-500">{ch}</span>
                  <span className="grid h-8 w-full place-items-center rounded-md border border-brand-300 font-semibold text-brand-700 dark:border-brand-700 dark:text-brand-300">
                    {p![i]}
                  </span>
                </div>
              ))}
            </div>
          ))}
          <span className="self-end pb-1 text-zinc-400">…</span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="card space-y-2 p-6">
            <h2 className="font-semibold">{f.title}</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="text-center text-sm text-zinc-500">
        Coming next: Anatomy & Physiology, Rocks and Minerals, Circuit Lab, Astronomy, and the rest of the Division C events.
      </section>
    </div>
  );
}
