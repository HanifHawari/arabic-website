import { describe, expect, it, vi } from 'vitest';
import {
  audioCatalog,
  AudioIndex,
  extForMime,
  KEY_PATTERN,
  pickRecordingMime,
  playMedia,
  type MediaLike,
} from '@/lib/audio';
import { content } from '@/lib/content';
import { audioIndex } from '@/lib/audio-files';
import { blankableSentences } from '@/lib/istima';
import { speechTexts, itemsForTab } from '@/lib/mufradat';
import { splitSentences } from '@/lib/text';

const catalog = audioCatalog(content);

describe('audioCatalog', () => {
  it('97 teks: 45 kosakata + 24 warna + 6 عِنْدَ + 11 kalimat nash + 11 baris hiwar', () => {
    const count = (g: string) => catalog.filter((i) => i.group === g).length;
    expect(count('vocab')).toBe(45);
    expect(count('warna')).toBe(24);
    expect(count('inda')).toBe(6);
    expect(count('nash')).toBe(content.texts.nash.reduce((n, x) => n + splitSentences(x.ar).length, 0));
    expect(count('hiwar')).toBe(content.texts.hiwar.reduce((n, h) => n + h.lines.length, 0));
    expect(catalog).toHaveLength(97);
  });

  it('key unik dan aman sebagai path', () => {
    const keys = catalog.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const k of keys) expect(k, k).toMatch(KEY_PATTERN);
  });

  it('mencakup semua teks yang dibacakan di Mufradat & Istima tadrib 1, 2, 4', () => {
    const idx = new AudioIndex(catalog, catalog.map((i) => `${i.key}.m4a`));
    for (const tab of ['sekolah', 'kelas', 'warna', 'lain'] as const) {
      for (const item of itemsForTab(content, tab)) for (const t of speechTexts(item)) expect(idx.has(t), t).toBe(true);
    }
    for (const b of blankableSentences(content)) expect(idx.has(b.sentence), b.sentence).toBe(true);
    for (const h of content.texts.hiwar) for (const l of h.lines) expect(idx.has(l.ar)).toBe(true);
  });
});

describe('AudioIndex', () => {
  const haqibah = catalog.find((i) => i.key === 'vocab/haqibah')!;

  it('teks → URL, hanya untuk file yang ada', () => {
    const idx = new AudioIndex(catalog, ['vocab/haqibah.m4a']);
    expect(idx.urlFor(haqibah.text)).toBe('/audio/vocab/haqibah.m4a');
    expect(idx.has(catalog.find((i) => i.key === 'vocab/qalam')!.text)).toBe(false);
    expect(idx.size).toBe(1);
  });

  it('mencocokkan walau urutan harakat beda (NFC)', () => {
    const kursi = catalog.find((i) => i.key === 'vocab/kursi')!;
    const idx = new AudioIndex(catalog, ['vocab/kursi.mp3']);
    expect(idx.has(kursi.text.normalize('NFD'))).toBe(true);
  });

  it('kalau ada beberapa format, utamakan mp3 > m4a > webm; ekstensi asing diabaikan', () => {
    expect(new AudioIndex(catalog, ['vocab/haqibah.webm', 'vocab/haqibah.mp3']).urlFor(haqibah.text)).toBe(
      '/audio/vocab/haqibah.mp3',
    );
    expect(new AudioIndex(catalog, ['vocab/haqibah.exe']).has(haqibah.text)).toBe(false);
  });

  it('indeks build saat ini bisa dibuat dari manifest', () => {
    expect(audioIndex.size).toBeGreaterThanOrEqual(0);
  });
});

describe('format', () => {
  it('extForMime', () => {
    expect(extForMime('audio/mp4')).toBe('m4a');
    expect(extForMime('audio/webm;codecs=opus')).toBe('webm');
    expect(extForMime('audio/mpeg')).toBe('mp3');
    expect(extForMime('video/mp4')).toBeNull();
    expect(extForMime('')).toBeNull();
  });

  it('pickRecordingMime mengutamakan m4a, lalu webm', () => {
    expect(pickRecordingMime(() => true)).toBe('audio/mp4;codecs=mp4a.40.2');
    expect(pickRecordingMime((m) => m.startsWith('audio/webm'))).toBe('audio/webm;codecs=opus');
    expect(pickRecordingMime(() => false)).toBeNull();
  });
});

describe('playMedia', () => {
  /** Media palsu yang meniru addEventListener dengan opsi once + signal. */
  function fakeMedia() {
    const listeners: { type: string; fn: () => void; once?: boolean; signal?: AbortSignal }[] = [];
    const media: MediaLike = {
      src: '',
      playbackRate: 1,
      preload: '',
      play: vi.fn(() => Promise.resolve()),
      pause: vi.fn(),
      addEventListener: (type, fn, opts) => {
        listeners.push({ type, fn, ...opts });
      },
    };
    const fire = (type: 'ended' | 'error') => {
      for (const l of [...listeners]) {
        if (l.type !== type || l.signal?.aborted) continue;
        if (l.once) listeners.splice(listeners.indexOf(l), 1);
        l.fn();
      }
    };
    const active = () => listeners.filter((l) => !l.signal?.aborted).length;
    return { media, fire, active };
  }

  it('memutar dengan kecepatan yang diminta dan selesai saat ended', async () => {
    const { media, fire, active } = fakeMedia();
    const p = playMedia(() => media, '/audio/x.m4a', 0.75);
    expect(media.src).toBe('/audio/x.m4a');
    expect(media.playbackRate).toBe(0.75);
    fire('ended');
    await expect(p.done).resolves.toBeUndefined();
    expect(active()).toBe(0); // listener dilepas
  });

  it('stop() langsung me-resolve tanpa menunggu event', async () => {
    const { media, active } = fakeMedia();
    const p = playMedia(() => media, '/audio/x.m4a');
    p.stop();
    await p.done;
    expect(media.pause).toHaveBeenCalled();
    expect(active()).toBe(0);
  });

  it('elemen bersama: pemutaran lama yang dihentikan tidak mengganggu pemutaran baru', async () => {
    const { media, fire } = fakeMedia();
    const first = playMedia(() => media, '/audio/a.mp3');
    first.stop();
    await first.done;
    const second = playMedia(() => media, '/audio/b.mp3');
    let secondDone = false;
    void second.done.then(() => (secondDone = true));
    await Promise.resolve();
    expect(secondDone).toBe(false); // belum selesai walau elemen yang sama pernah di-pause
    expect(media.src).toBe('/audio/b.mp3');
    fire('ended');
    await second.done;
    expect(secondDone).toBe(true);
  });

  it('play() ditolak (mis. autoplay diblok) tetap resolve', async () => {
    const { media } = fakeMedia();
    media.play = () => Promise.reject(new Error('NotAllowedError'));
    await expect(playMedia(() => media, '/audio/x.m4a').done).resolves.toBeUndefined();
  });
});
