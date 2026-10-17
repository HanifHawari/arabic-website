// RNG yang bisa di-seed (mulberry32) supaya generator soal bisa dites deterministik.

export type Rng = () => number;

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randomSeed = (): number => Math.floor(Math.random() * 2 ** 32);

export const randomInt = (rng: Rng, n: number): number => Math.floor(rng() * n);

export function pick<T>(items: readonly T[], rng: Rng): T {
  if (items.length === 0) throw new Error('pick: array kosong');
  return items[randomInt(rng, items.length)];
}

/** Fisher–Yates, mengembalikan salinan. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(rng, i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Ambil n item berbeda secara acak. */
export const sample = <T>(items: readonly T[], n: number, rng: Rng): T[] => shuffle(items, rng).slice(0, n);
