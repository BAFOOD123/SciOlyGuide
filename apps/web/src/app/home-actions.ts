"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { isEventSlug } from "@/lib/events";

/** Add or remove an event from the student's list. Returns the new list. */
export async function toggleEvent(slug: string): Promise<string[]> {
  const user = await requireUser();
  if (!isEventSlug(slug)) return myEvents(user.id);
  const where = and(eq(schema.userEvents.userId, user.id), eq(schema.userEvents.eventSlug, slug));
  const [existing] = await db.select().from(schema.userEvents).where(where);
  if (existing) await db.delete(schema.userEvents).where(where);
  else await db.insert(schema.userEvents).values({ userId: user.id, eventSlug: slug, addedAt: new Date() });
  revalidatePath("/", "layout");
  return myEvents(user.id);
}

async function myEvents(userId: string): Promise<string[]> {
  const rows = await db.select({ slug: schema.userEvents.eventSlug }).from(schema.userEvents).where(eq(schema.userEvents.userId, userId));
  return rows.map((r) => r.slug);
}
