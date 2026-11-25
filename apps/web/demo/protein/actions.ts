/** Standalone stand-in for the app's server action: saves through the page's backend. */
import { designSchema } from "@/lib/protein/design";
import { save } from "./backend";

export async function saveProteinDesign(input: unknown): Promise<{ ok: boolean; savedAt?: number; error?: string }> {
  const parsed = designSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That design couldn't be read." };
  try {
    await save(parsed.data);
    return { ok: true, savedAt: Date.now() };
  } catch {
    return { ok: false, error: "Couldn't save." };
  }
}
