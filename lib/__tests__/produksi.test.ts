import { describe, expect, it } from 'vitest';
import { content } from '@/lib/content';
import { backspaceAt, HARAKAT_KEYS, insertAt, LETTER_ROWS } from '@/lib/keyboard';
import { TextChecker } from '@/lib/produksi';

const checker = new TextChecker(content);

describe('TextChecker', () => {
  it('mendeteksi ال + dhamir (semua contoh salah di JSON)', () => {
    for (const w of [...content.quiz_bank.fix_al.map((q) => q.wrong), 'الْكُرْسِيُّهُ', 'الصُّوْرَتُكَ', 'وَالْكِتَابُكَ']) {
      expect(checker.isAlWithDhamir(w), w).toBe(true);
    }
  });

  it('tidak menandai kata ber-ال biasa atau ber-dhamir yang benar', () => {
    for (const w of ['الْكُرْسِيُّ', 'الْكِتَابُ', 'السَّبُّوْرَةُ', 'كِتَابُكَ', 'الْفَصْلِ', 'السَّلَامُ', 'الْجِدَارِ']) {
      expect(checker.isAlWithDhamir(w), w).toBe(false);
    }
  });

  it('teks nash orisinal tidak memicu saran apa pun', () => {
    for (const n of content.texts.nash) {
      const r = checker.check(n.ar);
      expect(r.alWithDhamir, n.id).toEqual([]);
      expect(r.lawnFeminine, n.id).toEqual([]);
      expect(r.vocabUsed.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("mendeteksi لَوْنُ + warna mu'annats", () => {
    const r = checker.check('لَوْنُ الْحَقِيْبَةِ حَمْرَاءُ. السَّبُّوْرَةُ لَوْنُهَا سَوْدَاءُ.');
    expect(r.lawnFeminine).toHaveLength(2);
    expect(checker.check('لَوْنُ الْحَقِيْبَةِ أَحْمَرُ. هَذِهِ سَبُّوْرَةٌ سَوْدَاءُ.').lawnFeminine).toEqual([]);
  });

  it('menghitung mufradat unik', () => {
    const r = checker.check('هَذَا كِتَابٌ. كِتَابِي جَدِيْدٌ. عِنْدِي قَلَمٌ وَمِسْطَرَةٌ.');
    expect(r.vocabUsed).toHaveLength(3);
    expect(r.wordCount).toBe(7);
  });
});

describe('keyboard', () => {
  it('28+ huruf, 8 harakat', () => {
    expect(LETTER_ROWS.flat().length).toBeGreaterThanOrEqual(28);
    expect(HARAKAT_KEYS).toHaveLength(8);
  });

  it('insertAt menyisipkan di kursor / mengganti seleksi', () => {
    expect(insertAt('بب', 1, 1, 'ا')).toEqual({ text: 'باب', caret: 2 });
    expect(insertAt('abc', 0, 3, 'x')).toEqual({ text: 'x', caret: 1 });
  });

  it('backspaceAt menghapus satu karakter (termasuk harakat)', () => {
    expect(backspaceAt('بَ', 2, 2)).toEqual({ text: 'ب', caret: 1 });
    expect(backspaceAt('abc', 0, 0)).toEqual({ text: 'abc', caret: 0 });
    expect(backspaceAt('abc', 1, 3)).toEqual({ text: 'a', caret: 1 });
  });
});
