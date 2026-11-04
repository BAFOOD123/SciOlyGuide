/** Demo stand-in for src/app/home-actions.ts. */
import { isEventSlug } from "@/lib/events";
import { store } from "./store";

export async function toggleEvent(slug: string): Promise<string[]> {
  if (isEventSlug(slug)) {
    store.update((s) => {
      s.events = s.events.includes(slug) ? s.events.filter((e) => e !== slug) : [...s.events, slug];
    });
  }
  return store.get().events;
}
