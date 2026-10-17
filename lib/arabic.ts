// Utilitas teks Arab Bab 3. Aturan & algoritma: .claude/skills/arabic-bab3/SKILL.md.
// Fungsi normalisasi di sini HANYA untuk perbandingan/pencarian — jangan tampilkan hasilnya
// sebagai konten utama (kecuali stripHarakat untuk toggle "sembunyikan harakat").

import type { AttachableVocab, Pronoun, Vocab } from '@/types/content';

const SHADDA = 'ّ';
const SUKUN = 'ْ';

/** Tanwin, fathah, dhammah, kasrah, syaddah, sukun, alif khanjariyah, tatweel. */
const HARAKAT = /[ً-ْٰـ]/g;

/** Huruf syamsiyah: lam ال tidak dibaca, huruf pertama dapat syaddah. */
const SUN_LETTERS = new Set([...'تثدذرزسشصضطظلن']);

export const stripHarakat = (s: string): string => s.replace(HARAKAT, '');

/** Normalisasi longgar untuk lookup: tanpa harakat, hamzah di alif disamakan, ى → ي. */
export const normalizeForCompare = (s: string): string =>
  stripHarakat(s).replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').trim();

/** Bandingkan dua teks berharakat; urutan codepoint harakat boleh beda. */
export const sameArabic = (a: string, b: string): boolean =>
  a.normalize('NFC') === b.normalize('NFC');

export function isAttachable(v: Vocab): v is AttachableVocab {
  return v.attachable && v.stem !== null;
}

/**
 * Tempelkan dhamir muttashil ke stem (tanpa tanwin):
 * ة → ت, lalu harakat akhir (dari JSON: dhammah, atau kasrah untuk أَنَا) + suffix.
 * Contoh: بَاب + هُوَ → بَابُهُ, صُوْرَة + أَنْتَ → صُوْرَتُكَ, كُرْسِيّ + أَنَا → كُرْسِيِّيْ.
 */
export function attachDhamir(stem: string, p: Pronoun): string {
  const base = stem.endsWith('ة') ? stem.slice(0, -1) + 'ت' : stem;
  return base + p.vowel + p.suffix;
}

/**
 * Bentuk ber-ال dari stem, tanpa harakat akhir (tambahkan sendiri: 'ُ' atau 'ِ').
 * Syamsiyah → ال + huruf + syaddah (السَّبُّوْرَة); qamariyah → الْ (الْكِتَاب).
 */
export function makeDefinite(stem: string): string {
  const first = stem[0];
  return SUN_LETTERS.has(first)
    ? 'ال' + first + SHADDA + stem.slice(1)
    : 'ال' + SUKUN + stem;
}

/** alif (atau alif washal) + harakat opsional + lam di awal kata. */
const AL_PREFIX = /^[اٱ][ً-ْ]*ل/;
const LEADING_MARKS = /^[ً-ْٰ]*/;

/**
 * Buang ال di awal kata, termasuk syaddah huruf syamsiyah yang ditimbulkannya.
 * الْكِتَابُكَ → كِتَابُكَ, الصُّوْرَتُكَ → صُوْرَتُكَ. Kata tanpa ال dikembalikan apa adanya.
 */
export function removeAl(word: string): string {
  const m = word.match(AL_PREFIX);
  if (!m) return word;
  const rest = word.slice(m[0].length);
  if (rest.length === 0) return word;
  // Qamariyah: الْ + huruf.
  if (rest.startsWith(SUKUN)) return rest.slice(1);
  // Syamsiyah (atau tanpa harakat): buang syaddah pada huruf pertama saja.
  const first = rest[0];
  const marks = rest.slice(1).match(LEADING_MARKS)![0];
  const after = rest.slice(1 + marks.length);
  const cleaned = SUN_LETTERS.has(first) ? marks.replace(SHADDA, '') : marks;
  return first + cleaned + after;
}
