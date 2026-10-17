'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  markDone,
  recordScore,
  setModuleStatus,
  toggleLearned,
  updateReview,
  visitModule,
  type ModuleId,
  type ModuleStatus,
  type Progress,
} from '@/lib/progress';
import { progressStore } from '@/lib/stores';

export function useProgress() {
  const progress = useSyncExternalStore(progressStore.subscribe, progressStore.get, () => progressStore.initial);
  const update = useCallback((fn: (p: Progress) => Progress) => progressStore.set(fn), []);

  return {
    progress,
    toggleLearned: useCallback((id: string) => update((p) => toggleLearned(p, id)), [update]),
    setModuleStatus: useCallback((m: ModuleId, s: ModuleStatus) => update((p) => setModuleStatus(p, m, s)), [update]),
    markDone: useCallback((flag: string) => update((p) => markDone(p, flag)), [update]),
    recordScore: useCallback((key: string, pct: number) => update((p) => recordScore(p, key, pct)), [update]),
    updateReview: useCallback(
      (results: { key: string; correct: boolean }[]) => update((p) => updateReview(p, results)),
      [update],
    ),
    reset: useCallback(() => progressStore.reset(), []),
  };
}

/** Tandai modul sedang dibuka (status "sedang" + modul terakhir). */
export function useModuleVisit(m: ModuleId) {
  useEffect(() => {
    progressStore.set((p) => visitModule(p, m));
  }, [m]);
}
