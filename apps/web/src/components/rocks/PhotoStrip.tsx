"use client";

import { useState } from "react";
import type { Photo } from "@sciolyguide/rocks-minerals";
import { photoSrc } from "@/lib/rocks-types";
import { Credit } from "./PhotoDrill";

/** A specimen's photos: one large, the rest as thumbnails, with credit. */
export function PhotoStrip({ photos, name }: { photos: Photo[]; name: string }) {
  const [i, setI] = useState(0);
  const p = photos[i];
  if (!p) return null;
  return (
    <figure className="space-y-2">
      <div className="overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoSrc(p.key)}
          alt={`${name} specimen`}
          width={p.width}
          height={p.height}
          loading="lazy"
          className="mx-auto max-h-80 w-auto max-w-full object-contain"
        />
      </div>
      {photos.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((ph, j) => (
            <button
              key={ph.key}
              type="button"
              onClick={() => setI(j)}
              aria-label={`${name} photo ${j + 1}`}
              aria-pressed={j === i}
              className={`overflow-hidden rounded-lg border-2 ${j === i ? "border-brand-500" : "border-transparent"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoSrc(ph.key)} alt="" loading="lazy" className="h-14 w-16 object-cover" />
            </button>
          ))}
        </div>
      )}
      <figcaption>
        {p.caption && <p className="text-xs text-zinc-600 dark:text-zinc-400">{p.caption}</p>}
        <Credit photo={p} />
      </figcaption>
    </figure>
  );
}
