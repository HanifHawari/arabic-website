import { describe, expect, it } from 'vitest';
import {
  emptyProgress,
  markDone,
  MODULE_IDS,
  moduleStatus,
  overallPercent,
  parseProgress,
  recordScore,
  REVIEW_LIMIT,
  setModuleStatus,
  toggleLearned,
  updateReview,
  visitModule,
} from '@/lib/progress';

describe('parseProgress', () => {
  it('data rusak → progres kosong', () => {
    expect(parseProgress(null)).toEqual(emptyProgress);
    expect(parseProgress('x')).toEqual(emptyProgress);
  });

  it('membuang field tidak valid, mempertahankan yang valid', () => {
    const p = parseProgress({
      learned: ['bab', 1, 'bab', 'color:ahmar'],
      modules: { mufradat: 'selesai', bogus: 'selesai', tarkib: 'xx' },
      done: ['tarkib:dhamir'],
      bestScores: { 'latihan:campur': 150, bad: 'x', 'latihan:warna': 42.4 },
      review: ['a', 'b'],
      lastModule: 'hiwar',
    });
    expect(p.learned).toEqual(['bab', 'color:ahmar']);
    expect(p.modules).toEqual({ mufradat: 'selesai' });
    expect(p.bestScores).toEqual({ 'latihan:campur': 100, 'latihan:warna': 42 });
    expect(p.lastModule).toBe('hiwar');
    expect(p.review).toEqual(['a', 'b']);
  });

  it('lastModule tidak dikenal → null', () => {
    expect(parseProgress({ lastModule: 'admin' }).lastModule).toBeNull();
  });
});

describe('status modul', () => {
  it('visitModule: belum → sedang + catat modul terakhir', () => {
    const p = visitModule(emptyProgress, 'tarkib');
    expect(moduleStatus(p, 'tarkib')).toBe('sedang');
    expect(p.lastModule).toBe('tarkib');
  });

  it('status selesai tidak turun jadi sedang', () => {
    let p = setModuleStatus(emptyProgress, 'hiwar', 'selesai');
    p = visitModule(p, 'hiwar');
    expect(moduleStatus(p, 'hiwar')).toBe('selesai');
    expect(setModuleStatus(p, 'hiwar', 'sedang')).toBe(p);
  });

  it('overallPercent: selesai = 1, sedang = 0,5', () => {
    expect(overallPercent(emptyProgress)).toBe(0);
    let p = emptyProgress;
    for (const m of MODULE_IDS) p = setModuleStatus(p, m, 'selesai');
    expect(overallPercent(p)).toBe(100);
    const half = setModuleStatus(emptyProgress, 'mufradat', 'sedang');
    expect(overallPercent(half)).toBe(Math.round((0.5 / MODULE_IDS.length) * 100));
  });
});

describe('hafalan, penanda, skor', () => {
  it('toggleLearned bolak-balik', () => {
    const a = toggleLearned(emptyProgress, 'bab');
    expect(a.learned).toEqual(['bab']);
    expect(toggleLearned(a, 'bab').learned).toEqual([]);
  });

  it('markDone idempoten', () => {
    const a = markDone(emptyProgress, 'x');
    expect(markDone(a, 'x')).toBe(a);
  });

  it('recordScore menyimpan skor terbaik saja', () => {
    let p = recordScore(emptyProgress, 'k', 60);
    p = recordScore(p, 'k', 40);
    expect(p.bestScores.k).toBe(60);
    p = recordScore(p, 'k', 90);
    expect(p.bestScores.k).toBe(90);
  });
});

describe('updateReview (spaced repetition sederhana)', () => {
  it('salah masuk antrean, benar keluar', () => {
    let p = updateReview(emptyProgress, [
      { key: 'a', correct: false },
      { key: 'b', correct: true },
      { key: 'c', correct: false },
    ]);
    expect(p.review).toEqual(['a', 'c']);
    p = updateReview(p, [{ key: 'a', correct: true }]);
    expect(p.review).toEqual(['c']);
  });

  it('tidak duplikat dan dibatasi REVIEW_LIMIT', () => {
    let p = updateReview(emptyProgress, [{ key: 'a', correct: false }]);
    p = updateReview(p, [{ key: 'a', correct: false }]);
    expect(p.review).toEqual(['a']);
    const many = Array.from({ length: REVIEW_LIMIT + 5 }, (_, i) => ({ key: `k${i}`, correct: false }));
    expect(updateReview(emptyProgress, many).review).toHaveLength(REVIEW_LIMIT);
  });

  it('tanpa perubahan → objek yang sama', () => {
    const p = updateReview(emptyProgress, [{ key: 'z', correct: true }]);
    expect(p).toBe(emptyProgress);
  });
});
