/**
 * Where the standalone studio keeps a student's design: privately in their
 * claude.ai account when the page can (the `db` capability, under the viewer's
 * own `data/users/<id>/` space), otherwise in this browser. Visitors who can
 * only view the page (for example through a public link) can't write to the
 * account store, so they get browser storage, and a refused write falls back
 * to it too.
 */
import { parseDesign, type ModelDesign } from "@/lib/protein/design";
import { use } from "./host";

const LOCAL_KEY = "sog-protein-design-v1";

export type StorageKind = "account" | "browser";

export interface Loaded {
  design: ModelDesign;
  updatedAt: number | null;
}

interface Backend {
  kind: StorageKind;
  load(): Promise<Loaded>;
  save(d: ModelDesign): Promise<void>;
}

function parseStored(obj: unknown): Loaded {
  const o = (obj ?? {}) as { design?: unknown; updatedAt?: unknown };
  return { design: parseDesign(o.design), updatedAt: typeof o.updatedAt === "number" ? o.updatedAt : null };
}

function browserBackend(): Backend {
  let memory: string | null = null;
  return {
    kind: "browser",
    async load() {
      let raw: string | null = memory;
      try {
        raw = localStorage.getItem(LOCAL_KEY) ?? raw;
      } catch {
        /* storage blocked */
      }
      if (!raw) return { design: parseDesign(null), updatedAt: null };
      try {
        return parseStored(JSON.parse(raw));
      } catch {
        return { design: parseDesign(null), updatedAt: null };
      }
    },
    async save(d) {
      memory = JSON.stringify({ design: d, updatedAt: Date.now() });
      try {
        localStorage.setItem(LOCAL_KEY, memory);
      } catch {
        /* kept in memory for this visit */
      }
    },
  };
}

interface DocRef {
  get(): Promise<{ exists: boolean; data(): Record<string, unknown> | undefined }>;
  set(data: Record<string, unknown>): Promise<void>;
}

async function accountBackend(): Promise<Backend | null> {
  const [db, user] = await Promise.all([use<any>("db"), use<any>("user")]);
  if (!db || !user) return null;
  // can("data.write") === false: this viewer can only view the page, so writes would be refused.
  const canWrite: boolean | null = await user.can?.("data.write").catch(() => null);
  if (canWrite === false) return null;
  const id: string | null = await user.id().catch(() => null);
  if (!id) return null;
  const ref: DocRef = db.collection(`data/users/${id}`).doc("protein-design");
  let chain: Promise<void> = Promise.resolve();
  return {
    kind: "account",
    async load() {
      const snap = await ref.get();
      return snap.exists ? parseStored(snap.data()) : { design: parseDesign(null), updatedAt: null };
    },
    save(d) {
      // One write at a time per document; retry once on a transient failure.
      const write = async () => {
        try {
          await ref.set({ design: d, updatedAt: Date.now() });
        } catch (e) {
          if ((e as { code?: string })?.code !== "unavailable") throw e;
          await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
          await ref.set({ design: d, updatedAt: Date.now() });
        }
      };
      chain = chain.catch(() => {}).then(write);
      return chain;
    },
  };
}

let active: Backend | null = null;
const listeners = new Set<(k: StorageKind) => void>();

/** Hear when saving moves from the account to this browser. */
export function onStorageChange(fn: (k: StorageKind) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Pick the storage and load the design. */
export async function connect(): Promise<Loaded & { kind: StorageKind }> {
  const acct = await accountBackend().catch(() => null);
  if (acct) {
    try {
      const loaded = await acct.load();
      active = acct;
      return { ...loaded, kind: "account" };
    } catch {
      /* fall through to the browser */
    }
  }
  active = browserBackend();
  return { ...(await active.load()), kind: "browser" };
}

export async function save(d: ModelDesign): Promise<void> {
  if (!active) throw new Error("not connected");
  try {
    await active.save(d);
  } catch (e) {
    const code = (e as { code?: string })?.code;
    // A refused write (no permission) or a lost grant: keep working in this browser.
    if (active.kind === "account" && code !== "unavailable" && code !== "resource_exhausted") {
      active = browserBackend();
      await active.save(d);
      listeners.forEach((fn) => fn("browser"));
      return;
    }
    throw e;
  }
}
