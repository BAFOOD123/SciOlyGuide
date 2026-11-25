/**
 * Where the standalone studio keeps a student's design: privately in their
 * claude.ai account when the page can (the `db` capability, under the viewer's
 * own `data/users/<id>/` space), otherwise in this browser.
 */
import { parseDesign, type ModelDesign } from "@/lib/protein/design";
import { use } from "./host";

const LOCAL_KEY = "sog-protein-design-v1";

export interface Loaded {
  design: ModelDesign;
  updatedAt: number | null;
}

interface Backend {
  kind: "account" | "browser";
  load(): Promise<Loaded>;
  save(d: ModelDesign): Promise<void>;
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
        const obj = JSON.parse(raw);
        return { design: parseDesign(obj.design), updatedAt: typeof obj.updatedAt === "number" ? obj.updatedAt : null };
      } catch {
        return { design: parseDesign(null), updatedAt: null };
      }
    },
    async save(d) {
      memory = JSON.stringify({ design: d, updatedAt: Date.now() });
      try {
        localStorage.setItem(LOCAL_KEY, memory);
      } catch {
        /* keep it in memory for this visit */
      }
    },
  };
}

async function accountBackend(): Promise<Backend | null> {
  const [db, user] = await Promise.all([use<any>("db"), use<any>("user")]);
  if (!db || !user) return null;
  let id: string | null = null;
  try {
    id = await user.id();
  } catch {
    id = null;
  }
  if (!id) return null;
  const ref = db.collection(`data/users/${id}`).doc("protein-design");
  let chain: Promise<void> = Promise.resolve();
  return {
    kind: "account",
    async load() {
      const snap = await ref.get();
      if (!snap.exists) return { design: parseDesign(null), updatedAt: null };
      const data = snap.data() ?? {};
      return { design: parseDesign(data.design), updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : null };
    },
    save(d) {
      // One write at a time per document.
      chain = chain.catch(() => {}).then(() => ref.set({ design: d, updatedAt: Date.now() }));
      return chain;
    },
  };
}

let active: Backend | null = null;

/** Pick the storage and load the design. Falls back to this browser if the account store can't be read or written. */
export async function connect(): Promise<Loaded & { kind: Backend["kind"] }> {
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
  await active.save(d);
}
