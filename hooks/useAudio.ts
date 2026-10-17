'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { playMedia, type MediaLike } from '@/lib/audio';
import { audioIndex } from '@/lib/audio-files';
import { browserSpeech, loadVoices, pickArabicVoice, speakOnce, type TtsStatus, type VoiceLike } from '@/lib/tts';

// Pemutar audio bersama untuk semua komponen:
// file rekaman (public/audio) kalau ada, kalau tidak suara TTS perangkat.

let ttsStatus: TtsStatus = 'checking';
let voice: VoiceLike | null = null;
let started = false;
/** Naik tiap ada pemutaran baru / stop, supaya urutan lama berhenti. */
let generation = 0;
let stopCurrent: (() => void) | null = null;
const listeners = new Set<() => void>();

const setStatus = (s: TtsStatus) => {
  ttsStatus = s;
  listeners.forEach((l) => l());
};

function init() {
  if (started) return;
  started = true;
  const speech = browserSpeech();
  if (!speech) return setStatus('unavailable');
  const refresh = (voices: VoiceLike[]) => {
    voice = pickArabicVoice(voices);
    setStatus(voice ? 'ready' : 'unavailable');
  };
  loadVoices(speech).then(refresh, () => setStatus('unavailable'));
  // Beberapa browser menambah suara belakangan.
  speech.addEventListener?.('voiceschanged', () => refresh(speech.getVoices()));
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// Satu elemen audio bersama: Safari/iOS hanya mengizinkan play() tanpa ketukan baru pada elemen
// yang sudah pernah diputar dari ketukan user, jadi pemutaran berurutan (kalimat demi kalimat) memakai elemen yang sama.
let sharedAudio: HTMLAudioElement | null = null;
const createAudio = () => (sharedAudio ??= new Audio()) as unknown as MediaLike;

function halt() {
  generation++;
  stopCurrent?.();
  stopCurrent = null;
  browserSpeech()?.cancel();
}

/** Putar satu teks: file rekaman, atau TTS. */
async function playOne(text: string, rate: number): Promise<void> {
  const url = audioIndex.urlFor(text);
  if (url) {
    const p = playMedia(createAudio, url, rate);
    stopCurrent = p.stop;
    await p.done;
    return;
  }
  const speech = browserSpeech();
  if (speech && voice) await speakOnce(speech, voice, text, { rate });
}

/** Bisa diputar = ada rekamannya, atau TTS Arab tersedia. */
const playable = (text: string) => audioIndex.has(text) || ttsStatus === 'ready';

const noopSubscribe = () => () => {};

export function useAudio() {
  const status = useSyncExternalStore(subscribe, () => ttsStatus, () => 'checking' as TtsStatus);
  // Ketersediaan audio hanya dihitung di browser setelah hydration: HTML server selalu "belum bisa",
  // jadi tidak ada hydration mismatch walau daftar rekaman berubah (mis. server dev memegang manifest lama).
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  useEffect(init, []);

  const canPlay = useCallback(
    (texts: string | readonly string[]) =>
      hydrated && (typeof texts === 'string' ? [texts] : texts).every((t) => audioIndex.has(t) || status === 'ready'),
    [status, hydrated],
  );

  const stop = useCallback(() => halt(), []);

  /** Putar beberapa teks berurutan; onIndex dipanggil sebelum tiap teks. */
  const playAll = useCallback(async (texts: readonly string[], opts: { rate?: number; onIndex?: (i: number) => void } = {}) => {
    halt();
    const mine = generation;
    for (let i = 0; i < texts.length; i++) {
      if (generation !== mine) return;
      if (!playable(texts[i])) continue;
      opts.onIndex?.(i);
      await playOne(texts[i], opts.rate ?? 1);
    }
  }, []);

  const play = useCallback((text: string | readonly string[], rate = 1) => playAll(typeof text === 'string' ? [text] : text, { rate }), [playAll]);

  return {
    /** Status TTS perangkat (file rekaman tidak bergantung pada ini). */
    ttsStatus: status,
    /** Jumlah teks yang sudah punya file rekaman (0 sebelum hydration). */
    recordedCount: hydrated ? audioIndex.size : 0,
    canPlay,
    play,
    playAll,
    stop,
  };
}
