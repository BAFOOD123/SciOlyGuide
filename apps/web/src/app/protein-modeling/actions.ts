"use server";

import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { designSchema } from "@/lib/protein/design";

/** Autosave the student's digital model design (validated; one design per account). */
export async function saveProteinDesign(input: unknown): Promise<{ ok: boolean; savedAt?: number; error?: string }> {
  const user = await requireUser();
  const parsed = designSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That design couldn't be read." };
  const data = JSON.stringify(parsed.data);
  if (data.length > 200_000) return { ok: false, error: "That design is too large to save." };
  const now = new Date();
  await db
    .insert(schema.proteinDesigns)
    .values({ userId: user.id, data, updatedAt: now })
    .onConflictDoUpdate({ target: schema.proteinDesigns.userId, set: { data, updatedAt: now } });
  return { ok: true, savedAt: now.getTime() };
}
