// Store kecil berbasis localStorage. Semua akses storage di dalam try/catch:
// kalau localStorage diblok / penuh / tidak ada (SSR), store tetap jalan di memori.

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** localStorage kalau bisa dipakai, selain itu null. */
export function browserStorage(): StorageLike | null {
  try {
    const s = window.localStorage;
    const probe = '__bab3_probe__';
    s.setItem(probe, probe);
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export interface PersistentStore<T> {
  get(): T;
  set(next: T | ((prev: T) => T)): void;
  subscribe(listener: () => void): () => void;
  reset(): void;
  /** Nilai awal (dipakai sebagai server snapshot). */
  readonly initial: T;
}

interface Options<T> {
  key: string;
  initial: T;
  /** Ubah data mentah (hasil JSON.parse) jadi T yang valid. */
  parse: (raw: unknown) => T;
  storage?: () => StorageLike | null;
}

export function createPersistentStore<T>({ key, initial, parse, storage = browserStorage }: Options<T>): PersistentStore<T> {
  let value = initial;
  let loaded = false;
  const listeners = new Set<() => void>();

  const read = (): T => {
    try {
      const raw = storage()?.getItem(key);
      return raw == null ? initial : parse(JSON.parse(raw));
    } catch {
      return initial;
    }
  };

  const write = (v: T) => {
    try {
      storage()?.setItem(key, JSON.stringify(v));
    } catch {
      // Gagal simpan (diblok/penuh): app tetap jalan tanpa simpan.
    }
  };

  const emit = () => listeners.forEach((l) => l());

  const onStorage = (e: StorageEvent) => {
    if (e.key !== key) return;
    value = read();
    emit();
  };

  const get = (): T => {
    if (!loaded) {
      loaded = true;
      value = read();
    }
    return value;
  };

  return {
    initial,
    get,
    set(next) {
      const prev = get();
      const v = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      if (Object.is(v, prev)) return;
      value = v;
      write(v);
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && typeof window !== 'undefined') window.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
      };
    },
    reset() {
      value = initial;
      loaded = true;
      try {
        storage()?.removeItem(key);
      } catch {
        // abaikan
      }
      emit();
    },
  };
}
