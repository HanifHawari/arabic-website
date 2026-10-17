import { describe, expect, it } from 'vitest';
import {
  attachDhamir,
  isAttachable,
  makeDefinite,
  normalizeForCompare,
  removeAl,
  sameArabic,
  stripHarakat,
} from '@/lib/arabic';
import { allVocab, content } from '@/lib/content';
import type { DhamirGrammar, Pronoun } from '@/types/content';

const pronoun = (id: string): Pronoun => {
  const p = content.pronouns.find((x) => x.id === id);
  if (!p) throw new Error(`pronoun ${id} tidak ada di JSON`);
  return p;
};

const expectSame = (actual: string, expected: string) => {
  expect(
    sameArabic(actual, expected),
    `${actual} [${[...actual].map((c) => c.codePointAt(0)!.toString(16)).join(' ')}] ≠ ${expected}`,
  ).toBe(true);
};

const dhamirGrammar = content.grammar.find((g): g is DhamirGrammar => g.id === 'dhamir_muttashil')!;

describe('sameArabic', () => {
  it('menganggap sama walau urutan syaddah/harakat beda', () => {
    // يّ + dhammah vs يُ + syaddah
    expect(sameArabic('يُّ', 'يُّ')).toBe(true);
  });

  it('membedakan harakat yang beda', () => {
    expect(sameArabic('بَابُكَ', 'بَابُكِ')).toBe(false);
  });
});

describe('stripHarakat & normalizeForCompare', () => {
  it('membuang semua harakat, tanwin, dan syaddah', () => {
    expect(stripHarakat('حَقِيْبَةٌ')).toBe('حقيبة');
    expect(stripHarakat('كُرْسِيٌّ')).toBe('كرسي');
    expect(stripHarakat('السَّبُّوْرَةُ')).toBe('السبورة');
  });

  it('menyamakan bentuk hamzah di alif dan alif maqshurah', () => {
    expect(normalizeForCompare('أَنَا')).toBe('انا');
    expect(normalizeForCompare(' إِلَى ')).toBe('الي');
  });

  it('tidak mengubah teks tanpa harakat', () => {
    expect(stripHarakat('كتاب')).toBe('كتاب');
  });
});

describe('attachDhamir — test case wajib SKILL.md', () => {
  const cases: [string, string, string][] = [
    ['بَاب', 'huwa', 'بَابُهُ'],
    ['بَاب', 'ana', 'بَابِيْ'],
    ['بَاب', 'nahnu', 'بَابُنَا'],
    ['صُوْرَة', 'anta', 'صُوْرَتُكَ'],
    ['سَبُّوْرَة', 'anti', 'سَبُّوْرَتُكِ'],
    ['خَرِيْطَة', 'ana', 'خَرِيْطَتِيْ'],
    ['كُرْسِيّ', 'huwa', 'كُرْسِيُّهُ'],
    ['كُرْسِيّ', 'ana', 'كُرْسِيِّيْ'],
    ['حِبْر', 'ana', 'حِبْرِيْ'],
  ];

  it.each(cases)('%s + %s → %s', (stem, pid, expected) => {
    expectSame(attachDhamir(stem, pronoun(pid)), expected);
  });
});

describe('attachDhamir — kriteria PRD', () => {
  it('semua 6 dhamir pada بَاب sesuai tabel grammar di JSON', () => {
    const base = dhamirGrammar.table_example_base;
    expect(dhamirGrammar.rows).toHaveLength(6);
    for (const row of dhamirGrammar.rows) {
      const p = content.pronouns.find((x) => x.ar === row.pronoun);
      expect(p, `pronoun ${row.pronoun}`).toBeDefined();
      expectSame(attachDhamir(base, p!), row.result);
    }
  });

  it.each([
    ['رَفّ', 'huwa', 'رَفُّهُ'],
    ['رَفّ', 'ana', 'رَفِّيْ'],
    ['مِقَصّ', 'anta', 'مِقَصُّكَ'],
    ['مِقَصّ', 'ana', 'مِقَصِّيْ'],
    ['كُرْسِيّ', 'hiya', 'كُرْسِيُّهَا'],
  ])('syaddah akhir: %s + %s → %s', (stem, pid, expected) => {
    expectSame(attachDhamir(stem, pronoun(pid)), expected);
  });

  it('ta marbuthah berubah jadi ta untuk semua dhamir', () => {
    for (const p of content.pronouns) {
      const out = attachDhamir('صُوْرَة', p);
      expect(out).not.toContain('ة');
      expect(stripHarakat(out).startsWith('صورت')).toBe(true);
    }
  });

  it('semua vocab attachable × 6 dhamir: tanpa ال, tanpa tanwin, tanpa ة, suffix menempel', () => {
    const attachable = allVocab.filter(isAttachable);
    expect(attachable.length).toBeGreaterThan(0);
    for (const v of attachable) {
      for (const p of content.pronouns) {
        const out = attachDhamir(v.stem, p);
        expect(out).not.toMatch(/[ً-ٍ]/);
        expect(out).not.toContain('ة');
        expect(stripHarakat(out).startsWith('ال')).toBe(stripHarakat(v.stem).startsWith('ال'));
        expect(stripHarakat(out).endsWith(stripHarakat(p.suffix))).toBe(true);
      }
    }
  });
});

describe('makeDefinite', () => {
  it('qamariyah → الْ', () => {
    expectSame(makeDefinite('كِتَاب'), 'الْكِتَاب');
    expectSame(makeDefinite('قَلَم') + 'ُ', 'الْقَلَمُ');
  });

  it('syamsiyah → syaddah di huruf pertama', () => {
    expectSame(makeDefinite('سَبُّوْرَة') + 'ِ', 'السَّبُّوْرَةِ');
    expectSame(makeDefinite('رَفّ') + 'ِ', 'الرَّفِّ');
    expectSame(makeDefinite('صُوْرَة'), 'الصُّوْرَة');
  });

  it('cocok dengan bentuk ber-ال di quiz_bank', () => {
    const stemOf = (id: string) => allVocab.find((v) => v.id === id)!.stem!;
    const qs = [...content.quiz_bank.lawn_pronoun, ...content.quiz_bank.lawn_color_form].map((q) =>
      q.q.normalize('NFC'),
    );
    const has = (s: string) => qs.some((q) => q.includes(s.normalize('NFC')));
    expect(has(makeDefinite(stemOf('qalam')) + 'ُ')).toBe(true);
    expect(has(makeDefinite(stemOf('haqibah')) + 'ُ')).toBe(true);
    expect(has(makeDefinite(stemOf('mujam')) + 'ُ')).toBe(true);
    expect(has(makeDefinite(stemOf('misthorah')) + 'ُ')).toBe(true);
    expect(has(makeDefinite(stemOf('khorithoh')) + 'ُ')).toBe(true);
    expect(has(makeDefinite(stemOf('mimsahah')) + 'ِ')).toBe(true);
  });
});

describe('removeAl', () => {
  it('membuang الْ qamariyah', () => {
    expectSame(removeAl('الْكِتَابُكَ'), 'كِتَابُكَ');
    expectSame(removeAl('الْكُرْسِيُّهُ'), 'كُرْسِيُّهُ');
  });

  it('membuang ال syamsiyah beserta syaddah-nya', () => {
    expectSame(removeAl('الصُّوْرَتُكَ'), 'صُوْرَتُكَ');
    expectSame(removeAl('الدَّفْتَرِيْ'), 'دَفْتَرِيْ');
    expectSame(removeAl('السَّبُّوْرَتُكِ'), 'سَبُّوْرَتُكِ');
  });

  it('tidak menyentuh syaddah asli di huruf lain', () => {
    expectSame(removeAl('السَّبُّوْرَةُ'), 'سَبُّوْرَةُ');
    expectSame(removeAl('الرَّفُّ'), 'رَفُّ');
  });

  it('teks tanpa harakat', () => {
    expect(removeAl('الكتاب')).toBe('كتاب');
    expect(removeAl('السبورة')).toBe('سبورة');
  });

  it('kata tanpa ال dikembalikan apa adanya', () => {
    expect(removeAl('كِتَابٌ')).toBe('كِتَابٌ');
    expect(removeAl('أَلْوَانٌ')).toBe('أَلْوَانٌ');
    expect(removeAl('اِسْمِي')).toBe('اِسْمِي');
    expect(removeAl('')).toBe('');
  });

  it('round-trip removeAl(makeDefinite(stem)) = stem untuk semua vocab attachable', () => {
    for (const v of allVocab.filter(isAttachable)) expectSame(removeAl(makeDefinite(v.stem)), v.stem);
  });

  it('memperbaiki semua pasangan salah→benar di grammar.wrong_right dan quiz_bank.fix_al', () => {
    const pairs = [
      ...dhamirGrammar.wrong_right,
      ...content.quiz_bank.fix_al.map((q) => [q.wrong, q.right] as [string, string]),
    ];
    expect(pairs.length).toBeGreaterThan(0);
    for (const [wrong, right] of pairs) expectSame(removeAl(wrong), right);
  });
});

describe('konsistensi data dhamir di JSON', () => {
  const attachable = allVocab.filter(isAttachable);
  const producible = (s: string) =>
    attachable.some((v) => content.pronouns.some((p) => sameArabic(attachDhamir(v.stem, p), s)));

  it('jawaban benar di wrong_right / fix_al bisa dibentuk dari vocab + dhamir', () => {
    const rights = [...dhamirGrammar.wrong_right.map(([, r]) => r), ...content.quiz_bank.fix_al.map((q) => q.right)];
    for (const r of rights) expect(producible(r), r).toBe(true);
  });

  it('jawaban dhamir_choose = attachDhamir(stem, dhamir soal), opsi lain dari stem yang sama', () => {
    for (const q of content.quiz_bank.dhamir_choose) {
      const p = content.pronouns.find((x) => sameArabic(x.ar, q.q));
      expect(p, q.q).toBeDefined();
      const v = attachable.find((x) => sameArabic(attachDhamir(x.stem, p!), q.answer));
      expect(v, q.answer).toBeDefined();
      for (const opt of q.options) {
        const ok = content.pronouns.some((pp) => sameArabic(attachDhamir(v!.stem, pp), opt));
        expect(ok, opt).toBe(true);
      }
    }
  });
});
