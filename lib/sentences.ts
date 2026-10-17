// Generator kalimat Bab 3 (SKILL.md §3–§5). Semua kata Arab diambil/diturunkan dari content/bab3.json.

import { attachDhamir, makeDefinite, sameArabic } from '@/lib/arabic';
import { allVocab } from '@/lib/content';
import { capitalize, shortMeaning } from '@/lib/text';
import type { AttachableVocab, Bab3Content, Color, DhamirGrammar, Demonstrative, Distance, Gender, Pronoun } from '@/types/content';

const DHAMMAH = 'ُ';
const KASRAH = 'ِ';
const TATWEEL = 'ـ';

export type ColorPattern = 1 | 2 | 3;
export const COLOR_PATTERNS: readonly ColorPattern[] = [1, 2, 3];

const pronounById = (c: Bab3Content, id: string): Pronoun => {
  const p = c.pronouns.find((x) => x.id === id);
  if (!p) throw new Error(`pronoun ${id} tidak ada`);
  return p;
};

/** Bentuk-bentuk لَوْنٌ. */
export function lawnForms(c: Bab3Content) {
  const stem = c.grammar_words.lawn_stem;
  return {
    /** لَوْنٌ */
    dict: c.grammar_words.lawn,
    /** لَوْنُ (mudhaf, sebelum benda) */
    mudhaf: stem + DHAMMAH,
    /** لَوْنُهُ */
    hu: attachDhamir(stem, pronounById(c, 'huwa')),
    /** لَوْنُهَا */
    ha: attachDhamir(stem, pronounById(c, 'hiya')),
  };
}

/** Akhiran dhamir untuk ditulis di penjelasan, mis. ـهُ. */
export const suffixLabel = (p: Pronoun): string => TATWEEL + p.suffix;

export function demonstrative(c: Bab3Content, gender: Gender, distance: Distance = 'dekat'): Demonstrative {
  const d = c.demonstratives.find((x) => x.gender === gender && x.distance === distance);
  if (!d) throw new Error(`isim isyarah ${gender}/${distance} tidak ada`);
  return d;
}

export const genderName = (g: Gender): string => (g === 'm' ? 'mudzakkar' : "mu'annats");

/** Bentuk warna yang benar untuk pola + gender benda. */
export const colorFormFor = (pattern: ColorPattern, gender: Gender): Gender => (pattern === 3 ? gender : 'm');

export interface ColorSentence {
  ar: string;
  translation: string;
  /** Bentuk warna yang dipakai. */
  form: Gender;
  colorWord: string;
  explanation: string;
}

/**
 * Pola 1: لَوْنُ + benda (ال, kasrah) + warna mudzakkar.
 * Pola 2: benda (ال, dhammah) + لَوْنُهُ/لَوْنُهَا + warna mudzakkar.
 * Pola 3: isim isyarah + benda indefinit + warna sesuai gender benda.
 */
export function colorSentence(
  c: Bab3Content,
  n: AttachableVocab,
  color: Color,
  pattern: ColorPattern,
  distance: Distance = 'dekat',
): ColorSentence {
  const lawn = lawnForms(c);
  const form = colorFormFor(pattern, n.gender);
  const colorWord = form === 'm' ? color.m : color.f;
  const benda = shortMeaning(n.id_meaning);
  const warna = color.id_meaning;

  if (pattern === 1) {
    const extra = n.gender === 'f' ? ` — walaupun ${n.ar} itu mu'annats` : '';
    return {
      ar: `${lawn.mudhaf} ${makeDefinite(n.stem)}${KASRAH} ${colorWord}`,
      translation: `Warna ${benda} itu ${warna}.`,
      form,
      colorWord,
      explanation: `Pola 1: warna jadi khabar bagi ${lawn.dict} yang mudzakkar, jadi warnanya selalu bentuk mudzakkar (${color.m})${extra}.`,
    };
  }
  if (pattern === 2) {
    const p = pronounById(c, n.gender === 'm' ? 'huwa' : 'hiya');
    const lawnX = n.gender === 'm' ? lawn.hu : lawn.ha;
    return {
      ar: `${makeDefinite(n.stem)}${DHAMMAH} ${lawnX} ${colorWord}`,
      translation: `${capitalize(benda)} itu warnanya ${warna}.`,
      form,
      colorWord,
      explanation: `Pola 2: ${n.ar} itu ${genderName(n.gender)}, jadi dhamirnya ${suffixLabel(p)} (${lawnX}). Warnanya tetap mudzakkar (${color.m}) karena jadi khabar bagi ${lawn.dict}.`,
    };
  }
  const isyarah = demonstrative(c, n.gender, distance);
  return {
    ar: `${isyarah.ar} ${n.ar} ${colorWord}`,
    translation: `${distance === 'dekat' ? 'Ini' : 'Itu'} ${benda} ${warna}.`,
    form,
    colorWord,
    explanation: `Pola 3 (tanpa ${lawn.dict}): warna ikut gender benda. ${n.ar} itu ${genderName(n.gender)} → warna bentuk ${genderName(form)} (${colorWord}).`,
  };
}

/** Arti bentuk ber-dhamir, mis. ("tas", أَنَا) → "tasku". Diturunkan dari tabel grammar di JSON. */
export function possessiveMeaning(c: Bab3Content, nounMeaning: string, p: Pronoun): string {
  const g = c.grammar.find((x): x is DhamirGrammar => x.id === 'dhamir_muttashil');
  const base = allVocab.find((v) => v.stem !== null && g && sameArabic(v.stem, g.table_example_base));
  const row = g?.rows.find((r) => sameArabic(r.pronoun, p.ar));
  if (!g || !base || !row) return `${nounMeaning} (${p.id_meaning})`;
  return row.id_meaning.replace(shortMeaning(base.id_meaning), shortMeaning(nounMeaning));
}

export interface DhamirStep {
  label: string;
  ar: string;
}

/** Langkah pembentukan dhamir untuk animasi DhamirBuilder. */
export function dhamirSteps(n: AttachableVocab, p: Pronoun): DhamirStep[] {
  const steps: DhamirStep[] = [{ label: 'Kata asal', ar: n.ar }];
  steps.push({ label: 'Hapus tanwin', ar: n.stem });
  const endsTa = n.stem.endsWith('ة');
  const base = endsTa ? n.stem.slice(0, -1) + 'ت' : n.stem;
  if (endsTa) steps.push({ label: 'Ta marbuthah ة berubah jadi ت', ar: base });
  const vowelName = p.vowel === KASRAH ? 'kasrah' : 'dhammah';
  steps.push({ label: `Huruf akhir berharakat ${vowelName}, lalu tempel ${suffixLabel(p)}`, ar: attachDhamir(n.stem, p) });
  return steps;
}
