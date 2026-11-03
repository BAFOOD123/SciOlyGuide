/** Apply Drizzle migrations: `npm run db:migrate` (reads DATABASE_URL / DATABASE_AUTH_TOKEN). */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const url = process.env.DATABASE_URL ?? "file:local.db";
const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
await migrate(drizzle(client), { migrationsFolder: new URL("../drizzle", import.meta.url).pathname });
console.log(`✓ migrations applied to ${url.startsWith("file:") ? url : url.replace(/\/\/.*@/, "//")}`);
client.close();
