import { describe, expect, it, vi } from 'vitest';
import {
  loadVoices,
  pickArabicVoice,
  speakOnce,
  type SpeechLike,
  type UtteranceLike,
  type VoiceLike,
} from '@/lib/tts';

const v = (lang: string, name = lang, localService = false): VoiceLike => ({ lang, name, localService });

describe('pickArabicVoice', () => {
  it('null kalau tidak ada suara Arab', () => {
    expect(pickArabicVoice([v('id-ID'), v('en-US')])).toBeNull();
    expect(pickArabicVoice([])).toBeNull();
  });

  it('utamakan ar-SA, lalu suara lokal', () => {
    expect(pickArabicVoice([v('ar-EG'), v('ar-SA', 'saudi')])?.name).toBe('saudi');
    expect(pickArabicVoice([v('ar-EG', 'remote'), v('ar-EG', 'local', true)])?.name).toBe('local');
    expect(pickArabicVoice([v('ar_SA', 'android')])?.name).toBe('android');
  });
});

const fakeUtterance = (text: string): UtteranceLike => ({
  text,
  lang: '',
  rate: 1,
  voice: null,
  onend: null,
  onerror: null,
});

function fakeSpeech(voices: VoiceLike[] = [v('ar-SA')]) {
  const spoken: UtteranceLike[] = [];
  const speech: SpeechLike = {
    getVoices: () => voices,
    speak: (u) => {
      spoken.push(u);
      queueMicrotask(() => u.onend?.());
    },
    cancel: vi.fn(),
  };
  return { speech, spoken };
}

describe('speakOnce', () => {
  it('mengatur lang, voice, rate', async () => {
    const { speech, spoken } = fakeSpeech();
    await speakOnce(speech, v('ar-SA'), 'كِتَابٌ', { rate: 0.75, createUtterance: fakeUtterance });
    expect(spoken[0]).toMatchObject({ text: 'كِتَابٌ', lang: 'ar-SA', rate: 0.75 });
  });

  it('error saat bicara tetap resolve', async () => {
    const speech: SpeechLike = {
      getVoices: () => [],
      speak: (u) => queueMicrotask(() => u.onerror?.({ error: 'synthesis-failed' })),
      cancel: () => {},
    };
    await expect(speakOnce(speech, v('ar-SA'), 'x', { createUtterance: fakeUtterance })).resolves.toBeUndefined();
  });
});

describe('loadVoices', () => {
  it('langsung resolve kalau suara sudah ada', async () => {
    const { speech } = fakeSpeech([v('ar-SA')]);
    expect(await loadVoices(speech)).toHaveLength(1);
  });

  it('menunggu voiceschanged, atau timeout', async () => {
    let voices: VoiceLike[] = [];
    let handler: (() => void) | null = null;
    const speech: SpeechLike = {
      getVoices: () => voices,
      speak: () => {},
      cancel: () => {},
      addEventListener: (_t, fn) => {
        handler = fn;
      },
      removeEventListener: () => {},
    };
    const p = loadVoices(speech, 1000);
    voices = [v('ar-SA')];
    handler!();
    expect(await p).toHaveLength(1);

    voices = [];
    expect(await loadVoices(speech, 10)).toEqual([]);
  });
});
