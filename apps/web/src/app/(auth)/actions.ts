"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, hashPassword, newId, rateLimit, verifyPassword } from "@/lib/auth";
import { db, schema } from "@/lib/db";

export interface AuthState {
  error?: string;
  fields?: { username?: string; displayName?: string };
}

const USERNAME = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_.-]{3,24}$/, "Usernames are 3–24 characters: letters, numbers, _ . -");
const PASSWORD = z.string().min(8, "Passwords need at least 8 characters").max(200);

function safeNext(next: FormDataEntryValue | null): string {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard";
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = z
    .object({
      username: USERNAME,
      displayName: z.string().trim().max(40).optional(),
      password: PASSWORD,
      confirm: z.string(),
    })
    .safeParse(Object.fromEntries(form));
  const fields = { username: String(form.get("username") ?? ""), displayName: String(form.get("displayName") ?? "") };
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, fields };
  const { username, displayName, password, confirm } = parsed.data;
  if (password !== confirm) return { error: "Passwords don't match", fields };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`signup:${ip}`, 20, 60 * 60_000)) return { error: "Too many sign-ups from here. Try again later.", fields };

  const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.username, username));
  if (existing.length) return { error: "That username is taken", fields };

  const id = newId();
  await db.insert(schema.users).values({
    id,
    username,
    displayName: displayName || username,
    passwordHash: await hashPassword(password),
    createdAt: new Date(),
  });
  await createSession(id);
  redirect(safeNext(form.get("next")));
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const fields = { username };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`signin:${ip}:${username}`)) return { error: "Too many attempts. Wait 15 minutes and try again.", fields };

  const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
  // Always run a hash comparison so response time doesn't reveal which usernames exist.
  const ok = await verifyPassword(password, user?.passwordHash ?? "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAA");
  if (!user || !ok) return { error: "Wrong username or password", fields };
  await createSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/");
}
