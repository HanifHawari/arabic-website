// Setelan tampilan per perangkat: toggle harakat & Mode Kelas (F10).

export interface Settings {
  showHarakat: boolean;
  classMode: boolean;
}

export const defaultSettings: Settings = { showHarakat: true, classMode: false };

export function parseSettings(raw: unknown): Settings {
  if (typeof raw !== 'object' || raw === null) return defaultSettings;
  const o = raw as Record<string, unknown>;
  return {
    showHarakat: typeof o.showHarakat === 'boolean' ? o.showHarakat : defaultSettings.showHarakat,
    classMode: typeof o.classMode === 'boolean' ? o.classMode : defaultSettings.classMode,
  };
}
