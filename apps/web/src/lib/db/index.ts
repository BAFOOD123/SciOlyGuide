import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { __sogDb?: ReturnType<typeof makeDb> };

function makeDb() {
  const client = createClient({
    url: process.env.DATABASE_URL ?? "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  });
  return drizzle(client, { schema });
}

/** One client per process (survives Next dev hot reloads). */
export const db = globalForDb.__sogDb ?? (globalForDb.__sogDb = makeDb());
export { schema };
