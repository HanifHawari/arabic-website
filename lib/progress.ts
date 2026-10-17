// Model progres belajar (F9). Fungsi murni; penyimpanan lewat lib/stores.ts.

export const MODULE_IDS = ['mufradat', 'nushush', 'hiwar', 'tarkib', 'latihan', 'istima', 'produksi'] as const;
export type ModuleId = (typeof MODULE_IDS)[number];
export type ModuleStatus = 'belum' | 'sedang' | 'selesai';

export interface Progress {
  version: 1;
  /** Id item yang sudah hafal: id vocab, `color:<id>`, `inda:<id>`. */
  learned: string[];
  modules: Partial<Record<ModuleId, ModuleStatus>>;
  /** Penanda sub-tugas selesai, mis. `tarkib:dhamir`, `nushush:nash1`, `istima:t2`. */
  done: string[];
  /** Skor terbaik (persen 0–100) per jenis latihan, mis. `latihan:warna`. */
  bestScores: Record<string, number>;
  /** Antrean review: key soal yang pernah salah. */
  review: string[];
  lastModule: ModuleId | null;
}

export const REVIEW_LIMIT = 30;

export const emptyProgress: Progress = {
  version: 1,
  learned: [],
  modules: {},
  done: [],
  bestScores: {},
  review: [],
  lastModule: null,
};

const isModuleId = (v: unknown): v is ModuleId => (MODULE_IDS as readonly unknown[]).includes(v);
const isStatus = (v: unknown): v is ModuleStatus => v === 'belum' || v === 'sedang' || v === 'selesai';
const strings = (v: unknown): string[] =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string'))] : [];

/** Terima data apa pun dari storage; buang yang tidak valid. */
export function parseProgress(raw: unknown): Progress {
  if (typeof raw !== 'object' || raw === null) return emptyProgress;
  const o = raw as Record<string, unknown>;
  const modules: Progress['modules'] = {};
  if (typeof o.modules === 'object' && o.modules !== null) {
    for (const [k, v] of Object.entries(o.modules)) if (isModuleId(k) && isStatus(v)) modules[k] = v;
  }
  const bestScores: Record<string, number> = {};
  if (typeof o.bestScores === 'object' && o.bestScores !== null) {
    for (const [k, v] of Object.entries(o.bestScores)) {
      if (typeof v === 'number' && Number.isFinite(v)) bestScores[k] = Math.max(0, Math.min(100, Math.round(v)));
    }
  }
  return {
    version: 1,
    learned: strings(o.learned),
    modules,
    done: strings(o.done),
    bestScores,
    review: strings(o.review).slice(-REVIEW_LIMIT),
    lastModule: isModuleId(o.lastModule) ? o.lastModule : null,
  };
}

export const moduleStatus = (p: Progress, m: ModuleId): ModuleStatus => p.modules[m] ?? 'belum';

export function setModuleStatus(p: Progress, m: ModuleId, s: ModuleStatus): Progress {
  const cur = moduleStatus(p, m);
  // Jangan turunkan status "selesai".
  if (cur === s || (cur === 'selesai' && s !== 'belum')) return p;
  return { ...p, modules: { ...p.modules, [m]: s } };
}

/** Dipanggil saat modul dibuka: catat modul terakhir + tandai "sedang". */
export function visitModule(p: Progress, m: ModuleId): Progress {
  const next = moduleStatus(p, m) === 'belum' ? setModuleStatus(p, m, 'sedang') : p;
  return next.lastModule === m ? next : { ...next, lastModule: m };
}

export const isLearned = (p: Progress, id: string): boolean => p.learned.includes(id);

export function toggleLearned(p: Progress, id: string): Progress {
  return isLearned(p, id)
    ? { ...p, learned: p.learned.filter((x) => x !== id) }
    : { ...p, learned: [...p.learned, id] };
}

export const isDone = (p: Progress, flag: string): boolean => p.done.includes(flag);

export function markDone(p: Progress, flag: string): Progress {
  return isDone(p, flag) ? p : { ...p, done: [...p.done, flag] };
}

export function recordScore(p: Progress, key: string, percent: number): Progress {
  const v = Math.max(0, Math.min(100, Math.round(percent)));
  if ((p.bestScores[key] ?? -1) >= v) return p;
  return { ...p, bestScores: { ...p.bestScores, [key]: v } };
}

/** Soal salah masuk antrean review; soal review yang dijawab benar keluar. */
export function updateReview(p: Progress, results: { key: string; correct: boolean }[]): Progress {
  let review = [...p.review];
  for (const { key, correct } of results) {
    review = review.filter((k) => k !== key);
    if (!correct) review.push(key);
  }
  review = review.slice(-REVIEW_LIMIT);
  const same = review.length === p.review.length && review.every((k, i) => k === p.review[i]);
  return same ? p : { ...p, review };
}

/** Persentase keseluruhan: selesai = 1, sedang = 0,5 per modul. */
export function overallPercent(p: Progress): number {
  const total = MODULE_IDS.reduce((sum, m) => {
    const s = moduleStatus(p, m);
    return sum + (s === 'selesai' ? 1 : s === 'sedang' ? 0.5 : 0);
  }, 0);
  return Math.round((total / MODULE_IDS.length) * 100);
}
