import "server-only";
import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db, schema } from "./db";

/** The student's chosen events, oldest first. Cached per request. */
export const getMyEvents = cache(async (userId: string): Promise<string[]> => {
  const rows = await db
    .select({ slug: schema.userEvents.eventSlug })
    .from(schema.userEvents)
    .where(eq(schema.userEvents.userId, userId))
    .orderBy(asc(schema.userEvents.addedAt));
  return rows.map((r) => r.slug);
});
