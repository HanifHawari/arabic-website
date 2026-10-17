// Audio rekaman guru (v1.1): katalog teks yang bisa direkam + indeks teks → file di public/audio.
// Teks yang belum direkam tetap memakai TTS perangkat.

import { buildAudioCatalog } from '@/scripts/audio-catalog.mjs';
import type { Bab3Content } from '@/types/content';

export const AUDIO_GROUPS = [
  { id: 'vocab', label: 'Kosakata' },
  { id: 'warna', label: 'Warna' },
  { id: 'inda', label: 'Kosakata lain' },
  { id: 'nash', label: 'Kalimat nash' },
  { id: 'hiwar', label: 'Baris hiwar' },
] as const;
export type AudioGroup = (typeof AUDIO_GROUPS)[number]['id'];

export interface AudioItem {
  /** Path tanpa ekstensi, relatif ke public/audio, mis. `vocab/haqibah`. */
  key: string;
  group: AudioGroup;
  /** Teks Arab yang dibaca (persis dari JSON). */
  text: string;
  /** Keterangan untuk guru (Bahasa Indonesia). */
  label: string;
}

/** Format rekaman yang diterima, urut dari yang paling disarankan. */
export const AUDIO_FORMATS = [
  { ext: 'mp3', mime: 'audio/mpeg' },
  { ext: 'm4a', mime: 'audio/mp4' },
  { ext: 'webm', mime: 'audio/webm' },
  { ext: 'ogg', mime: 'audio/ogg' },
  { ext: 'wav', mime: 'audio/wav' },
] as const;
export type AudioExt = (typeof AUDIO_FORMATS)[number]['ext'];

export const KEY_PATTERN = /^(vocab|warna|inda|nash|hiwar)\/[a-z0-9_-]+$/;

export const extForMime = (mime: string): AudioExt | null =>
  AUDIO_FORMATS.find((f) => mime.split(';')[0].trim().toLowerCase() === f.mime)?.ext ?? null;

const textKey = (s: string) => s.normalize('NFC').trim();

/** Semua teks Arab yang dibacakan di situs dan bisa diganti rekaman guru. */
export function audioCatalog(c: Bab3Content): AudioItem[] {
  return buildAudioCatalog(c) as AudioItem[];
}

/** Indeks teks → URL rekaman, dibangun dari daftar file di public/audio. */
export class AudioIndex {
  private readonly byText = new Map<string, string>();

  /** @param files path relatif public/audio, mis. `vocab/haqibah.m4a`. */
  constructor(items: readonly AudioItem[], files: readonly string[], basePath = '/audio') {
    const fileByKey = new Map<string, string>();
    for (const f of files) {
      const dot = f.lastIndexOf('.');
      const key = f.slice(0, dot);
      const ext = f.slice(dot + 1) as AudioExt;
      const prev = fileByKey.get(key);
      const rank = (e: string) => AUDIO_FORMATS.findIndex((x) => x.ext === e);
      if (rank(ext) === -1) continue;
      if (!prev || rank(ext) < rank(prev.slice(prev.lastIndexOf('.') + 1))) fileByKey.set(key, f);
    }
    for (const item of items) {
      const file = fileByKey.get(item.key);
      const t = textKey(item.text);
      if (file && !this.byText.has(t)) this.byText.set(t, `${basePath}/${file}`);
    }
  }

  urlFor(text: string): string | null {
    return this.byText.get(textKey(text)) ?? null;
  }

  has(text: string): boolean {
    return this.byText.has(textKey(text));
  }

  get size(): number {
    return this.byText.size;
  }
}

// ---------- pemutar file audio ----------

export interface MediaLike {
  src: string;
  playbackRate: number;
  preload: string;
  play(): Promise<void>;
  pause(): void;
  addEventListener(type: 'ended' | 'error', fn: () => void, opts?: { once?: boolean; signal?: AbortSignal }): void;
}

/**
 * Putar satu file; resolve saat selesai, gagal, ditolak browser, atau stop() dipanggil.
 * Elemen media boleh dipakai ulang (satu elemen bersama supaya Safari/iOS mengizinkan pemutaran berurutan),
 * jadi selesai ditentukan dari event milik pemutaran ini saja: listener dilepas begitu selesai,
 * dan stop() langsung me-resolve (tidak menunggu event "pause" yang bisa datang terlambat).
 */
export function playMedia(create: () => MediaLike, url: string, rate = 1): { done: Promise<void>; stop: () => void } {
  const media = create();
  const listeners = new AbortController();
  let settle!: () => void;
  const done = new Promise<void>((resolve) => {
    settle = () => {
      listeners.abort();
      resolve();
    };
  });
  media.preload = 'auto';
  media.src = url;
  media.playbackRate = rate;
  for (const ev of ['ended', 'error'] as const) media.addEventListener(ev, settle, { once: true, signal: listeners.signal });
  media.play().catch(settle);
  return {
    done,
    stop: () => {
      media.pause();
      settle();
    },
  };
}

// ---------- perekam (halaman /rekam, khusus guru) ----------

/** Kandidat format rekaman: m4a (AAC) diputar di semua browser termasuk iPhone; webm/ogg sebagai cadangan. */
const RECORDING_MIMES = ['audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];

/** Pilih format rekaman pertama yang didukung browser (null kalau tidak ada). */
export function pickRecordingMime(isTypeSupported: (mime: string) => boolean): string | null {
  return RECORDING_MIMES.find((m) => isTypeSupported(m)) ?? null;
}
