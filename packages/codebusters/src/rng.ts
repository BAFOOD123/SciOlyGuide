/**
 * Small deterministic PRNG. Puzzles are generated from (spec, seed), so the
 * server can regenerate and grade any puzzle a client was shown.
 * Never use Math.random() inside the engine.
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0 || 0x9e3779b9;
  }

  /** mulberry32 — returns a float in [0, 1). */
  next(): number {
    let t = (this.state = (this.state + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [0, n). */
  int(n: number): number {
    return Math.floor(this.next() * n);
  }

  /** Integer in [lo, hi] inclusive. */
  range(lo: number, hi: number): number {
    return lo + this.int(hi - lo + 1);
  }

  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error("pick from empty array");
    return arr[this.int(arr.length)]!;
  }

  shuffle<T>(arr: readonly T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  }

  /** Derive an independent child RNG (e.g. one per test question). */
  fork(salt: number): Rng {
    return new Rng((this.int(0xffffffff) ^ Math.imul(salt + 1, 0x85ebca6b)) >>> 0);
  }
}

export function randomSeed(): number {
  // Only used by callers (UI/server) to pick a fresh seed — not by generators.
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
