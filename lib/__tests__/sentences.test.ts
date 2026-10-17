import { describe, expect, it } from 'vitest';
import { isAttachable, sameArabic } from '@/lib/arabic';
import { allVocab, content } from '@/lib/content';
import {
  colorFormFor,
  colorSentence,
  demonstrative,
  dhamirSteps,
  lawnForms,
  possessiveMeaning,
} from '@/lib/sentences';
import type { AttachableVocab } from '@/types/content';

const vocab = (id: string) => {
  const v = allVocab.find((x) => x.id === id);
  if (!v || !isAttachable(v)) throw new Error(id);
  return v as AttachableVocab;
};
const color = (id: string) => content.colors.find((c) => c.id === id)!;
const pronoun = (id: string) => content.pronouns.find((p) => p.id === id)!;
const same = (a: string, b: string) => expect(sameArabic(a, b), `${a} ≠ ${b}`).toBe(true);

describe('lawnForms', () => {
  it('لَوْنُ, لَوْنُهُ, لَوْنُهَا cocok dengan quiz_bank', () => {
    const l = lawnForms(content);
    same(l.mudhaf, 'لَوْنُ');
    same(l.hu, content.quiz_bank.lawn_pronoun[0].options[0]);
    same(l.ha, content.quiz_bank.lawn_pronoun[0].options[1]);
  });
});

describe('colorSentence — kriteria PRD simulator warna', () => {
  it('pola 1, benda mudzakkar: لَوْنُ الْكِتَابِ أَصْفَرُ (sama dengan contoh JSON)', () => {
    const s = colorSentence(content, vocab('kitab'), color('ashfar'), 1);
    same(s.ar, 'لَوْنُ الْكِتَابِ أَصْفَرُ');
    expect(s.form).toBe('m');
  });

  it("pola 1, benda mu'annats: warna TETAP mudzakkar", () => {
    const s = colorSentence(content, vocab('mimsahah'), color('abyadh'), 1);
    same(s.ar, 'لَوْنُ الْمِمْسَحَةِ أَبْيَضُ');
    expect(s.form).toBe('m');
    expect(s.explanation).toContain("mu'annats");
  });

  it('pola 1, syamsiyah: لَوْنُ السَّبُّوْرَةِ أَسْوَدُ', () => {
    same(colorSentence(content, vocab('sabburah'), color('aswad'), 1).ar, 'لَوْنُ السَّبُّوْرَةِ أَسْوَدُ');
  });

  it('pola 2: الْكِتَابُ لَوْنُهُ أَصْفَرُ (contoh JSON) dan benda mu\'annats → لَوْنُهَا + warna mudzakkar', () => {
    same(colorSentence(content, vocab('kitab'), color('ashfar'), 2).ar, 'الْكِتَابُ لَوْنُهُ أَصْفَرُ');
    const s = colorSentence(content, vocab('khorithoh'), color('ashfar'), 2);
    same(s.ar, 'الْخَرِيْطَةُ لَوْنُهَا أَصْفَرُ');
    expect(s.form).toBe('m');
  });

  it("pola 3: warna ikut gender benda (هَذِهِ سَبُّوْرَةٌ سَوْدَاءُ / هَذَا رَفٌّ أَبْيَضُ)", () => {
    const f = colorSentence(content, vocab('sabburah'), color('aswad'), 3);
    same(f.ar, 'هَذِهِ سَبُّوْرَةٌ سَوْدَاءُ');
    expect(f.form).toBe('f');
    const m = colorSentence(content, vocab('raff'), color('abyadh'), 3);
    same(m.ar, 'هَذَا رَفٌّ أَبْيَضُ');
    expect(m.form).toBe('m');
  });

  it('pola 3 jauh memakai ذَلِكَ / تِلْكَ', () => {
    same(colorSentence(content, vocab('mujam'), color('akhdhar'), 3, 'jauh').ar.split(' ')[0], demonstrative(content, 'm', 'jauh').ar);
    same(colorSentence(content, vocab('misthorah'), color('bunni'), 3, 'jauh').ar.split(' ')[0], demonstrative(content, 'f', 'jauh').ar);
  });

  it('semua kombinasi benda × warna × pola: bentuk warna sesuai kaidah', () => {
    for (const n of allVocab.filter(isAttachable)) {
      for (const c of content.colors) {
        for (const p of [1, 2, 3] as const) {
          const s = colorSentence(content, n, c, p);
          const expected = p === 3 ? n.gender : 'm';
          expect(s.form).toBe(expected);
          expect(s.ar.endsWith(expected === 'm' ? c.m : c.f)).toBe(true);
          expect(colorFormFor(p, n.gender)).toBe(expected);
        }
      }
    }
  });

  it('terjemahan Indonesia', () => {
    expect(colorSentence(content, vocab('haqibah'), color('ahmar'), 1).translation).toBe('Warna tas itu merah.');
    expect(colorSentence(content, vocab('haqibah'), color('ahmar'), 2).translation).toBe('Tas itu warnanya merah.');
    expect(colorSentence(content, vocab('qalam'), color('ahmar'), 3).translation).toBe('Ini pena merah.');
  });
});

describe('possessiveMeaning & dhamirSteps', () => {
  it('menurunkan arti dari tabel بَاب di JSON', () => {
    expect(possessiveMeaning(content, 'tas', pronoun('ana'))).toBe('tasku');
    expect(possessiveMeaning(content, 'tas', pronoun('huwa'))).toBe('tasnya (lk)');
    expect(possessiveMeaning(content, 'meja (kerja/guru)', pronoun('anta'))).toBe('mejamu (lk)');
  });

  it('langkah ta marbuthah muncul hanya untuk kata berakhiran ة', () => {
    const withTa = dhamirSteps(vocab('shurah'), pronoun('anta'));
    expect(withTa.map((s) => s.label)).toContain('Ta marbuthah ة berubah jadi ت');
    same(withTa[withTa.length - 1].ar, 'صُوْرَتُكَ');
    const noTa = dhamirSteps(vocab('kursi'), pronoun('ana'));
    expect(noTa).toHaveLength(3);
    same(noTa[2].ar, 'كُرْسِيِّيْ');
    expect(noTa[2].label).toContain('kasrah');
  });
});
