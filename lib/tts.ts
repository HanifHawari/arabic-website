// Audio v1: Web Speech API (speechSynthesis). Ketersediaan suara Arab tergantung OS/browser,
// jadi status "unavailable" harus ditangani UI dengan fallback teks (PRD F7).

export interface VoiceLike {
  lang: string;
  name: string;
  localService?: boolean;
}

export interface UtteranceLike {
  text: string;
  lang: string;
  rate: number;
  voice: VoiceLike | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
}

export interface SpeechLike {
  getVoices(): VoiceLike[];
  speak(u: UtteranceLike): void;
  cancel(): void;
  addEventListener?(type: 'voiceschanged', fn: () => void): void;
  removeEventListener?(type: 'voiceschanged', fn: () => void): void;
}

export type TtsStatus = 'checking' | 'ready' | 'unavailable';

export const ARABIC_LANG = 'ar-SA';

/** Pilih suara Arab: ar-SA dulu, lalu ar-* lain; suara lokal lebih diutamakan. */
export function pickArabicVoice<V extends VoiceLike>(voices: readonly V[]): V | null {
  const arabic = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('ar'));
  if (arabic.length === 0) return null;
  const score = (v: V) =>
    (v.lang.toLowerCase().replace('_', '-') === 'ar-sa' ? 2 : 0) + (v.localService ? 1 : 0);
  return [...arabic].sort((a, b) => score(b) - score(a))[0];
}

/** speechSynthesis kalau ada, selain itu null. */
export function browserSpeech(): SpeechLike | null {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    return window.speechSynthesis as unknown as SpeechLike;
  } catch {
    return null;
  }
}

/** Tunggu daftar suara (Chrome mengisinya async). */
export function loadVoices(speech: SpeechLike, timeoutMs = 2000): Promise<VoiceLike[]> {
  const now = speech.getVoices();
  if (now.length > 0 || !speech.addEventListener) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      speech.removeEventListener?.('voiceschanged', done);
      resolve(speech.getVoices());
    };
    const timer = setTimeout(done, timeoutMs);
    speech.addEventListener!('voiceschanged', done);
  });
}

export type UtteranceFactory = (text: string) => UtteranceLike;

const browserUtterance: UtteranceFactory = (text) =>
  new SpeechSynthesisUtterance(text) as unknown as UtteranceLike;

export interface SpeakOptions {
  rate?: number;
  createUtterance?: UtteranceFactory;
}

/** Ucapkan satu teks; resolve saat selesai (atau dibatalkan/gagal). */
export function speakOnce(speech: SpeechLike, voice: VoiceLike, text: string, opts: SpeakOptions = {}): Promise<void> {
  const u = (opts.createUtterance ?? browserUtterance)(text);
  u.lang = voice.lang || ARABIC_LANG;
  u.voice = voice;
  u.rate = opts.rate ?? 1;
  return new Promise((resolve) => {
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speech.speak(u);
  });
}
