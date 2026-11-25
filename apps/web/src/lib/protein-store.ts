import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { parseDesign, type ModelDesign } from "./protein/design";

/** The student's saved Protein Modeling design, or a fresh one. */
export async function getProteinDesign(userId: string): Promise<{ design: ModelDesign; updatedAt: number | null }> {
  const [row] = await db
    .select({ data: schema.proteinDesigns.data, updatedAt: schema.proteinDesigns.updatedAt })
    .from(schema.proteinDesigns)
    .where(eq(schema.proteinDesigns.userId, userId))
    .limit(1);
  if (!row) return { design: parseDesign(null), updatedAt: null };
  let raw: unknown = null;
  try {
    raw = JSON.parse(row.data);
  } catch {
    raw = null;
  }
  return { design: parseDesign(raw), updatedAt: row.updatedAt.getTime() };
}
