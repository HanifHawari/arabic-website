import { describe, expect, it, vi } from 'vitest';
import { createPersistentStore, type StorageLike } from '@/lib/persistent-store';
import { parseSettings, defaultSettings } from '@/lib/settings';

const memoryStorage = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};

const throwingStorage: StorageLike = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

const make = (storage: StorageLike | null) =>
  createPersistentStore({ key: 'k', initial: defaultSettings, parse: parseSettings, storage: () => storage });

describe('createPersistentStore', () => {
  it('membaca & menyimpan ke storage', () => {
    const s = memoryStorage();
    s.setItem('k', JSON.stringify({ showHarakat: false, classMode: false }));
    const store = make(s);
    expect(store.get().showHarakat).toBe(false);
    store.set((p) => ({ ...p, classMode: true }));
    expect(JSON.parse(s.data.get('k')!)).toEqual({ showHarakat: false, classMode: true });
  });

  it('memberi tahu subscriber saat berubah', () => {
    const store = make(memoryStorage());
    const fn = vi.fn();
    const unsub = store.subscribe(fn);
    store.set({ showHarakat: false, classMode: false });
    expect(fn).toHaveBeenCalledTimes(1);
    unsub();
    store.set({ showHarakat: true, classMode: false });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('tetap jalan kalau localStorage melempar error (diblok)', () => {
    const store = make(throwingStorage);
    expect(store.get()).toEqual(defaultSettings);
    expect(() => store.set({ showHarakat: false, classMode: true })).not.toThrow();
    expect(store.get()).toEqual({ showHarakat: false, classMode: true });
    expect(() => store.reset()).not.toThrow();
    expect(store.get()).toEqual(defaultSettings);
  });

  it('tetap jalan tanpa storage sama sekali (SSR)', () => {
    const store = make(null);
    store.set({ showHarakat: false, classMode: false });
    expect(store.get().showHarakat).toBe(false);
  });

  it('JSON rusak di storage → nilai awal', () => {
    const s = memoryStorage();
    s.setItem('k', '{rusak');
    expect(make(s).get()).toEqual(defaultSettings);
  });

  it('reset menghapus data tersimpan', () => {
    const s = memoryStorage();
    const store = make(s);
    store.set({ showHarakat: false, classMode: false });
    store.reset();
    expect(s.data.has('k')).toBe(false);
    expect(store.get()).toEqual(defaultSettings);
  });
});

describe('parseSettings', () => {
  it('mengisi default untuk field yang hilang/salah tipe', () => {
    expect(parseSettings({ showHarakat: 'ya' })).toEqual(defaultSettings);
    expect(parseSettings({ classMode: true })).toEqual({ showHarakat: true, classMode: true });
  });
});
