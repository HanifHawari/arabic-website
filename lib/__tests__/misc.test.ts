import { describe, expect, it } from 'vitest';
import { allVocab, content } from '@/lib/content';
import { hasIllustration } from '@/lib/illustrations';
import { adjacentModule, MODULES } from '@/lib/modules';
import { allMufradatKeys, indaExample, itemsForTab, MUFRADAT_TABS, speechTexts } from '@/lib/mufradat';
import { MODULE_IDS } from '@/lib/progress';
import { createRng, sample, shuffle } from '@/lib/rng';
import { shortMeaning, splitArabicRuns, splitSentences } from '@/lib/text';

describe('rng', () => {
  it('deterministik untuk seed yang sama', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('shuffle mempertahankan isi, tidak mengubah input', () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, createRng(1));
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(sample(input, 3, createRng(2))).size).toBe(3);
  });
});

describe('text', () => {
  it('splitArabicRuns memisahkan potongan Arab', () => {
    expect(splitArabicRuns('Setelah لَوْنُ, warna mudzakkar')).toEqual([
      { text: 'Setelah ', ar: false },
      { text: 'لَوْنُ', ar: true },
      { text: ', warna mudzakkar', ar: false },
    ]);
    expect(splitArabicRuns('Salah: الْكُرْسِيُّهُ — Benar: كُرْسِيُّهُ.').filter((r) => r.ar)).toHaveLength(2);
    expect(splitArabicRuns('عَلَى الْجِدَارِ ... خَرِيْطَةٌ')).toEqual([{ text: 'عَلَى الْجِدَارِ ... خَرِيْطَةٌ', ar: true }]);
  });

  it('splitSentences memecah setelah . dan ؟', () => {
    expect(splitSentences('هَذَا فَصْلُنَا. مَا لَوْنُ حَقِيْبَتِكَ؟ عَفْوًا.')).toEqual([
      'هَذَا فَصْلُنَا.',
      'مَا لَوْنُ حَقِيْبَتِكَ؟',
      'عَفْوًا.',
    ]);
  });

  it('jumlah kalimat Arab = jumlah kalimat terjemahan di tiap nash', () => {
    for (const n of content.texts.nash) {
      expect(splitSentences(n.ar).length, n.id).toBe(splitSentences(n.translation).length);
    }
  });

  it('shortMeaning', () => {
    expect(shortMeaning('meja (kerja/guru)')).toBe('meja');
    expect(shortMeaning('pena / pulpen')).toBe('pena');
    expect(shortMeaning('AC (pendingin ruangan)')).toBe('AC');
    expect(shortMeaning('tas')).toBe('tas');
  });
});

describe('mufradat', () => {
  it('63 item: 45 kosakata + 12 warna + 6 عِنْدَ, key unik', () => {
    const keys = allMufradatKeys(content);
    expect(keys).toHaveLength(45 + 12 + 6);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('tiap tab berisi data dari JSON', () => {
    expect(itemsForTab(content, 'sekolah')).toHaveLength(15);
    expect(itemsForTab(content, 'kelas')).toHaveLength(30);
    expect(itemsForTab(content, 'warna')).toHaveLength(12);
    expect(itemsForTab(content, 'lain')).toHaveLength(6);
    expect(MUFRADAT_TABS).toHaveLength(4);
  });

  it('teks audio warna berisi bentuk mudzakkar & mu\'annats', () => {
    const [first] = itemsForTab(content, 'warna');
    if (first.kind !== 'color') throw new Error('bukan warna');
    expect(speechTexts(first)).toEqual([first.color.m, first.color.f]);
  });

  it('contoh عِنْدَ = inda + benda indefinit', () => {
    const ana = content.pronouns.find((p) => p.id === 'ana')!;
    const firjar = allVocab.find((v) => v.id === 'firjar')!;
    expect(indaExample(ana, firjar)).toBe(`${ana.inda} ${firjar.ar}`);
  });
});

describe('ilustrasi & modul', () => {
  it('setiap kosakata punya ilustrasi', () => {
    for (const v of allVocab) expect(hasIllustration(v.id), v.id).toBe(true);
  });

  it('MODULES mencakup semua ModuleId', () => {
    expect(MODULES.map((m) => m.id).sort()).toEqual([...MODULE_IDS].sort());
  });

  it('adjacentModule', () => {
    expect(adjacentModule('/', 1)?.href).toBe('/mufradat');
    expect(adjacentModule('/mufradat', -1)).toBeNull();
    expect(adjacentModule('/produksi', 1)).toBeNull();
    expect(adjacentModule('/tidak-ada', 1)).toBeNull();
  });
});
