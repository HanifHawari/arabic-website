import { describe, expect, it } from 'vitest';
import { attachDhamir, isAttachable, sameArabic } from '@/lib/arabic';
import { allVocab, content } from '@/lib/content';
import { blankableSentences, makeRounds, TADRIB } from '@/lib/istima';
import { annotate, candidates, Lexicon, tokenize } from '@/lib/lookup';
import { createRng } from '@/lib/rng';
import { Substituter } from '@/lib/substitution';
import type { AttachableVocab } from '@/types/content';

const lex = new Lexicon(content);
const vocab = (id: string) => allVocab.find((v) => v.id === id)! as AttachableVocab;
const color = (id: string) => content.colors.find((c) => c.id === id)!;
const same = (a: string, b: string) => expect(sameArabic(a, b), `${a} ≠ ${b}`).toBe(true);

describe('tokenize & candidates', () => {
  it('memisahkan tanda baca Arab', () => {
    expect(tokenize('اِسْمِي أَحْمَدُ، أَنَا')).toEqual([
      { word: 'اِسْمِي', trailing: '' },
      { word: 'أَحْمَدُ', trailing: '،' },
      { word: 'أَنَا', trailing: '' },
    ]);
    expect(tokenize('حَقِيْبَتِكَ؟')[0]).toEqual({ word: 'حَقِيْبَتِكَ', trailing: '؟' });
  });

  it('kandidat: و + ال + akhiran + ت→ة', () => {
    expect(candidates('وَالسَّبُّوْرَةُ')).toContain('سبورة');
    expect(candidates('حَقِيْبَتِي')).toContain('حقيبة');
  });
});

describe('Lexicon.lookup (popover arti)', () => {
  const meaning = (w: string) => lex.lookup(w)?.meaning;
  it.each([
    ['حَقِيْبَتِي', 'tas'],
    ['حَقِيْبَتِكَ', 'tas'],
    ['وَالسَّبُّوْرَةُ', 'papan tulis'],
    ['الْمَقْلَمَةِ', 'kotak pensil'],
    ['فَصْلُنَا', 'kelas'],
    ['الْفَصْلِ', 'kelas'],
    ['وَمِقَصٌّ', 'gunting'],
    ['قَلَمِي', 'pena / pulpen'],
    ['كُرْسِيٌّ', 'kursi'],
    ['رَفٌّ', 'rak'],
    ['وَتَقْوِيْمٌ', 'kalender'],
    ['بَابٌ', 'pintu'],
    ['عِنْدِي', 'saya punya'],
    ['عِنْدَهَا', 'dia (pr) punya'],
    ['أَنَا', 'saya'],
    ['وَهَذِهِ', 'ini (pr)'],
  ])('%s → %s', (w, m) => expect(meaning(w)).toBe(m));

  it('warna & لَوْنٌ', () => {
    expect(lex.lookup('أَزْرَقُ')?.kind).toBe('color');
    expect(lex.lookup('وَرْدِيٌّ')?.meaning).toBe('merah muda (mudzakkar)');
    expect(lex.lookup('لَوْنُهَا')?.kind).toBe('lawn');
  });

  it('kata yang tidak ada di data → null (tidak mengarang arti)', () => {
    for (const w of ['كَرَاسِيُّ', 'اِسْمِي', 'صَدِيْقَتِي', 'فِي', 'فِيْهَا', 'عَلَيْهِ', 'تِلْمِيْذٌ', 'أَحْمَدُ', 'نَظِيْفٌ']) {
      expect(lex.lookup(w), w).toBeNull();
    }
  });

  it('frasa 2 kata: سَاعَةٌ حَائِطِيَّةٌ', () => {
    const toks = annotate(lex, content.texts.nash[1].ar);
    const i = toks.findIndex((t) => t.word === 'سَاعَةٌ');
    expect(toks[i].entry?.meaning).toBe('jam dinding');
    expect(toks[i + 1].entry?.meaning).toBe('jam dinding');
  });

  it('setiap kosakata attachable dikenali dalam bentuk ber-ال dan ber-dhamir', () => {
    for (const v of allVocab.filter(isAttachable)) {
      for (const p of content.pronouns) expect(lex.lookup(attachDhamir(v.stem, p))?.ar, v.id).toBe(v.ar);
    }
  });
});

describe('Substituter (latihan substitusi hiwar)', () => {
  const sub = new Substituter(content);
  const lines = content.texts.hiwar[0].lines;

  it('baris yang bisa disubstitusi = baris dengan satu jenis benda', () => {
    const subs = sub.substitutable(lines).map((l) => l.ar);
    expect(subs).toContain('هَلْ هَذَا قَلَمُكَ؟');
    expect(subs).toContain('لَوْنُ حَقِيْبَتِي أَزْرَقُ.');
    expect(subs).not.toContain('فِيْهَا كِتَابٌ وَدَفْتَرٌ وَمَقْلَمَةٌ.');
    expect(subs).not.toContain('السَّلَامُ عَلَيْكُمْ يَا عُمَرُ.');
  });

  it("benda mudzakkar → mu'annats: isyarah, dhamir, لَوْنُهَا ikut berubah", () => {
    same(sub.substitute('هَلْ هَذَا قَلَمُكَ؟', vocab('haqibah'), color('azraq')), 'هَلْ هَذِهِ حَقِيْبَتُكَ؟');
    same(
      sub.substitute('لَا، قَلَمِي لَوْنُهُ أَسْوَدُ. هَذَا قَلَمُ أَحْمَدَ.', vocab('haqibah'), color('azraq')),
      'لَا، حَقِيْبَتِيْ لَوْنُهَا أَزْرَقُ. هَذِهِ حَقِيْبَةُ أَحْمَدَ.',
    );
  });

  it("mu'annats → mudzakkar, warna tetap mudzakkar setelah لَوْنُ", () => {
    same(sub.substitute('لَوْنُ حَقِيْبَتِي أَزْرَقُ.', vocab('kitab'), color('ahmar')), 'لَوْنُ كِتَابِيْ أَحْمَرُ.');
    same(
      sub.substitute('حَقِيْبَتِي لَوْنُهَا بُنِّيٌّ. وَأَنْتَ، مَا لَوْنُ حَقِيْبَتِكَ؟', vocab('kursi'), color('akhdhar')),
      'كُرْسِيِّيْ لَوْنُهُ أَخْضَرُ. وَأَنْتَ، مَا لَوْنُ كُرْسِيِّكَ؟',
    );
  });

  it('terjemahan ikut diganti', () => {
    const line = lines.find((l) => l.ar.startsWith('لَا'))!;
    const from = { noun: sub.nounsIn(line.ar)[0], colors: sub.colorsIn(line.ar) };
    expect(sub.substituteTranslation(line.translation, from, vocab('haqibah'), color('azraq'))).toBe(
      'Bukan, tasku warnanya biru. Ini tas Ahmad.',
    );
  });
});

describe('istima', () => {
  it('ada kalimat nash berwarna untuk tadrib 4', () => {
    expect(blankableSentences(content).length).toBeGreaterThanOrEqual(3);
  });

  for (const t of TADRIB) {
    it(`${t.id}: 5 ronde, jawaban ada di opsi, opsi unik, teks dibacakan tidak kosong`, () => {
      const rounds = makeRounds(content, t.id, createRng(9));
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        const values = r.options.map((o) => o.value);
        expect(values).toContain(r.answer);
        expect(new Set(values).size).toBe(values.length);
        expect(r.speak.length).toBeGreaterThan(0);
        if (t.id === 't4') {
          expect(r.prompt).toContain('...');
          expect(r.speak).toContain(r.answer);
        }
      }
    });
  }
});

describe('soal pemahaman (comprehension) di JSON', () => {
  it('5 soal per nash, jawaban ada di opsi', () => {
    for (const n of content.texts.nash) {
      const qs = content.comprehension[n.id];
      expect(Array.isArray(qs) ? qs.length : 0, n.id).toBe(5);
    }
  });
});
