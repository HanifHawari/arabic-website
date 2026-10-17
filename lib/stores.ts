// Instance store yang dipakai app (singleton per tab).

import { createPersistentStore } from '@/lib/persistent-store';
import { emptyProgress, parseProgress, type Progress } from '@/lib/progress';
import { emptyDraft, parseDraft, type Draft } from '@/lib/produksi';
import { defaultSettings, parseSettings, type Settings } from '@/lib/settings';

export const progressStore = createPersistentStore<Progress>({
  key: 'bab3:progress:v1',
  initial: emptyProgress,
  parse: parseProgress,
});

export const settingsStore = createPersistentStore<Settings>({
  key: 'bab3:settings:v1',
  initial: defaultSettings,
  parse: parseSettings,
});

export const draftStore = createPersistentStore<Draft>({
  key: 'bab3:draft:v1',
  initial: emptyDraft,
  parse: parseDraft,
});
