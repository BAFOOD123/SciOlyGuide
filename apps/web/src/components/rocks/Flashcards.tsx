"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { hardnessText, specimenById, type Specimen } from "@sciolyguide/rocks-minerals";
import { reviewCard } from "@/app/rocks-and-minerals/actions";
import { SpecimenCard, TYPE_STYLE, typeLabel, typeOf } from "./SpecimenCard";

export interface DeckCard {
  id: string;
  box: number;
  isNew: boolean;
}

function frontClues(s: Specimen): string[] {
  if (s.kind === "mineral") {
    return [`Color: ${s.colors.slice(0, 2).join(", ")}`, `Luster: ${s.lusterDesc}`, `Hardness: ${hardnessText(s.hardness)}`, `Streak: ${s.streak}`, `Breakage: ${s.breakage}`];
  }
  return [`Texture: ${s.texture}`, `Made of: ${s.minerals.join(", ")}`, `Forms in: ${s.environment}`];
}

export function Flashcards({ deck, direction }: { deck: DeckCard[]; direction: "name" | "clues" }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ knew: 0, missed: 0 });
  const [requeue, setRequeue] = useState<DeckCard[]>([]);
  const [, startTransition] = useTransition();
  const cards = [...deck, ...requeue];
  const card = cards[i];

  if (!deck.length) {
    return (
      <div className="card mx-auto max-w-xl space-y-3 p-6 text-center">
        <p className="text-lg font-semibold">Nothing due right now.</p>
        <p className="text-zinc-600 dark:text-zinc-400">Cards come back on a schedule: 1, 3, 7 and 21 days after you get them right.</p>
        <Link href="/rocks-and-minerals" className="btn btn-primary">
          Back to Rocks and Minerals
        </Link>
      </div>
    );
  }
  if (!card) {
    return (
      <div className="card mx-auto max-w-xl space-y-3 p-6 text-center">
        <p className="text-lg font-semibold">Session done</p>
        <p className="text-zinc-600 dark:text-zinc-400">
          {tally.knew} known · {tally.missed} to review again soon.
        </p>
        <div className="flex justify-center gap-2">
          <a href="" className="btn btn-primary">
            Study more
          </a>
          <Link href="/rocks-and-minerals" className="btn btn-secondary">
            Back
          </Link>
        </div>
      </div>
    );
  }
  const s = specimenById(card.id)!;
  const grade = (knew: boolean) => {
    startTransition(async () => {
      await reviewCard(card.id, knew);
    });
    setTally((t) => (knew ? { ...t, knew: t.knew + 1 } : { ...t, missed: t.missed + 1 }));
    // Missed cards come back at the end of this session too.
    if (!knew && i < deck.length) setRequeue((r) => [...r, { ...card, box: 1, isNew: false }]);
    setFlipped(false);
    setI((x) => x + 1);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          Card {i + 1} of {cards.length}
        </span>
        <span>{card.isNew ? "New card" : `Box ${card.box} of 5`}</span>
      </div>
      <div className="card min-h-72 space-y-4 p-6">
        {direction === "name" ? (
          <div className="space-y-2 text-center">
            <span className={`chip ${TYPE_STYLE[typeOf(s)]}`}>{typeLabel(s)}</span>
            <p className="text-3xl font-bold">{s.name}</p>
            {!flipped && <p className="text-sm text-zinc-500">Recall its key properties, then flip.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-500">Which specimen is this?</p>
            <ul className="space-y-1.5 text-sm">
              {frontClues(s).map((c) => (
                <li key={c}>▸ {c}</li>
              ))}
            </ul>
          </div>
        )}
        {flipped && (
          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            {direction === "clues" && <p className="mb-3 text-2xl font-bold">{s.name}</p>}
            <SpecimenCard s={s} compact={direction === "name"} />
          </div>
        )}
      </div>
      <div className="flex justify-center gap-3">
        {!flipped ? (
          <button className="btn btn-primary px-8" onClick={() => setFlipped(true)} autoFocus>
            Flip card
          </button>
        ) : (
          <>
            <button className="btn btn-secondary px-6" onClick={() => grade(false)}>
              Missed it
            </button>
            <button className="btn btn-primary px-6" onClick={() => grade(true)}>
              Knew it
            </button>
          </>
        )}
      </div>
    </div>
  );
}
