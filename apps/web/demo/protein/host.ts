/**
 * The hosting page's runtime (claude.ai Artifacts): `window.claude.use(name)`
 * resolves a capability, or null when this view can't run it.
 */
declare global {
  interface Window {
    claude?: { use(name: string): Promise<unknown> };
  }
}

const cache = new Map<string, Promise<unknown>>();

/** Resolve a capability (memoized); null when absent, refused, or no host answers within 10 s. */
export function use<T = any>(name: string): Promise<T | null> {
  if (!cache.has(name)) {
    const p = (async () => {
      if (!window.claude?.use) return null;
      try {
        return await Promise.race([window.claude.use(name), new Promise((r) => setTimeout(() => r(null), 10_000))]);
      } catch {
        return null;
      }
    })();
    cache.set(name, p);
  }
  return cache.get(name) as Promise<T | null>;
}
