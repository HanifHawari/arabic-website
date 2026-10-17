'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Settings } from '@/lib/settings';
import { settingsStore } from '@/lib/stores';

export function useSettings() {
  const settings = useSyncExternalStore(settingsStore.subscribe, settingsStore.get, () => settingsStore.initial);
  const update = useCallback((patch: Partial<Settings>) => settingsStore.set((s) => ({ ...s, ...patch })), []);
  return { settings, update };
}
