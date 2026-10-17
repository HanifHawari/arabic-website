// Latihan substitusi hiwar (F4): ganti benda & warna di kalimat dialog,
// lalu sesuaikan dhamir, isim isyarah, dan لَوْنُهُ/لَوْنُهَا dengan gender benda baru.

import { attachDhamir, isAttachable, makeDefinite, normalizeForCompare, sameArabic } from '@/lib/arabic';
import { lawnForms } from '@/lib/sentences';
import { shortMeaning } from '@/lib/text';
import { tokenize } from '@/lib/lookup';
import type { AttachableVocab, Bab3Content, Color, HiwarLine, Pronoun } from '@/types/content';

const VOWELS = ['ُ', 'َ', 'ِ'];

/** Pisahkan و (beserta harakatnya) di depan kata: وَهَذِهِ → ['وَ', 'هَذِهِ']. */
function splitWaw(word: string): [string, string] | null {
  const m = word.match(/^و[ً-ْ]*/);
  if (!m || word.length - m[0].length < 2) return null;
  return [m[0], word.slice(m[0].length)];
}

type Match =
  | { kind: 'dhamir'; noun: AttachableVocab; pronoun: Pronoun }
  | { kind: 'definite'; noun: AttachableVocab; vowel: string }
  | { kind: 'bare'; noun: AttachableVocab; vowel: string }
  | { kind: 'isyarah'; distance: 'dekat' | 'jauh' }
  | { kind: 'lawn' }
  | { kind: 'color'; color: Color; form: 'm' | 'f' };

export class Substituter {
  private readonly nouns: AttachableVocab[];

  constructor(private readonly c: Bab3Content) {
    this.nouns = [...c.vocab.sekolah, ...c.vocab.kelas].filter(isAttachable);
  }

  /** Kenali satu kata (tanpa tanda baca). */
  private match(word: string): Match | null {
    const norm = normalizeForCompare(word);
    for (const d of this.c.demonstratives) if (sameArabic(d.ar, word)) return { kind: 'isyarah', distance: d.distance };
    const lawn = lawnForms(this.c);
    if (sameArabic(word, lawn.hu) || sameArabic(word, lawn.ha)) return { kind: 'lawn' };
    for (const col of this.c.colors) {
      if (sameArabic(col.m, word)) return { kind: 'color', color: col, form: 'm' };
      if (sameArabic(col.f, word)) return { kind: 'color', color: col, form: 'f' };
    }
    for (const n of this.nouns) {
      // Kata ber-dhamir. Harakat huruf akhir benda diambil dari kalimat asli (mis. kasrah setelah لَوْنُ),
      // jadi i'rab mengikuti teks dialog, bukan ditebak. Harakat persis diutamakan (bedakan كَ/كِ),
      // lalu longgar (mis. sukun ي tidak ditulis).
      for (const p of this.c.pronouns) {
        for (const vowel of [p.vowel, ...VOWELS]) {
          const variant = { ...p, vowel };
          if (sameArabic(attachDhamir(n.stem, variant), word)) return { kind: 'dhamir', noun: n, pronoun: variant };
        }
      }
      const loose = this.c.pronouns.find((p) => normalizeForCompare(attachDhamir(n.stem, p)) === norm);
      if (loose) return { kind: 'dhamir', noun: n, pronoun: loose };
      for (const v of VOWELS) {
        if (sameArabic(makeDefinite(n.stem) + v, word)) return { kind: 'definite', noun: n, vowel: v };
        if (sameArabic(n.stem + v, word)) return { kind: 'bare', noun: n, vowel: v };
      }
    }
    return null;
  }

  /** Benda yang muncul di kalimat (unik). */
  nounsIn(line: string): AttachableVocab[] {
    const found = new Map<string, AttachableVocab>();
    for (const t of tokenize(line)) {
      const waw = splitWaw(t.word);
      const m = this.match(t.word) ?? (waw ? this.match(waw[1]) : null);
      if (m && 'noun' in m) found.set(m.noun.id, m.noun);
    }
    return [...found.values()];
  }

  /** Baris yang bisa disubstitusi: tepat satu jenis benda. */
  substitutable(lines: readonly HiwarLine[]): HiwarLine[] {
    return lines.filter((l) => this.nounsIn(l.ar).length === 1);
  }

  /** Ganti benda & warna di satu kalimat. */
  substitute(line: string, noun: AttachableVocab, color: Color): string {
    const lawn = lawnForms(this.c);
    return tokenize(line)
      .map(({ word, trailing }) => {
        let prefix = '';
        let m = this.match(word);
        const waw = m ? null : splitWaw(word);
        if (waw) {
          m = this.match(waw[1]);
          if (m) prefix = waw[0];
        }
        let out = word;
        if (m) {
          const body = (() => {
            switch (m.kind) {
              case 'dhamir':
                return attachDhamir(noun.stem, m.pronoun);
              case 'definite':
                return makeDefinite(noun.stem) + m.vowel;
              case 'bare':
                return noun.stem + m.vowel;
              case 'isyarah':
                return this.c.demonstratives.find((d) => d.gender === noun.gender && d.distance === m.distance)!.ar;
              case 'lawn':
                return noun.gender === 'm' ? lawn.hu : lawn.ha;
              case 'color':
                return m.form === 'm' ? color.m : noun.gender === 'm' ? color.m : color.f;
            }
          })();
          out = prefix + body;
        }
        return out + trailing;
      })
      .join(' ');
  }

  /** Terjemahan: ganti arti benda & warna lama dengan yang baru. */
  substituteTranslation(text: string, from: { noun: AttachableVocab; colors: Color[] }, noun: AttachableVocab, color: Color): string {
    const swap = (s: string, oldW: string, newW: string) =>
      s.replace(new RegExp(oldW.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), (hit) =>
        hit[0] === hit[0].toUpperCase() ? newW[0].toUpperCase() + newW.slice(1) : newW,
      );
    let out = swap(text, shortMeaning(from.noun.id_meaning), shortMeaning(noun.id_meaning));
    for (const c of from.colors) out = swap(out, c.id_meaning, color.id_meaning);
    return out;
  }

  /** Warna yang muncul di kalimat. */
  colorsIn(line: string): Color[] {
    return tokenize(line)
      .map((t) => this.match(t.word))
      .filter((m): m is Extract<Match, { kind: 'color' }> => m?.kind === 'color')
      .map((m) => m.color);
  }
}
