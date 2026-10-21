// Item mufradat per tab (F2). Semua data dari content/bab3.json.

import { normalizeForCompare } from '@/lib/arabic';
import type { Bab3Content, Color, Pronoun, Vocab } from '@/types/content';

export const MUFRADAT_TABS = [
  { id: 'sekolah', label: 'Alat Sekolah' },
  { id: 'kelas', label: 'Perangkat Kelas' },
  { id: 'warna', label: 'Warna' },
  { id: 'lain', label: 'Kosakata Lain' },
] as const;

export type MufradatTab = (typeof MUFRADAT_TABS)[number]['id'];

export type MufradatItem =
  | { kind: 'vocab'; key: string; vocab: Vocab }
  | { kind: 'color'; key: string; color: Color }
  | { kind: 'inda'; key: string; pronoun: Pronoun };

export const colorKey = (c: Color) => `color:${c.id}`;
export const indaKey = (p: Pronoun) => `inda:${p.id}`;

export function itemsForTab(c: Bab3Content, tab: MufradatTab): MufradatItem[] {
  switch (tab) {
    case 'sekolah':
    case 'kelas':
      return c.vocab[tab].map((vocab) => ({ kind: 'vocab', key: vocab.id, vocab }));
    case 'warna':
      return c.colors.map((color) => ({ kind: 'color', key: colorKey(color), color }));
    case 'lain':
      return c.pronouns.map((pronoun) => ({ kind: 'inda', key: indaKey(pronoun), pronoun }));
  }
}

export const allMufradatKeys = (c: Bab3Content): string[] =>
  MUFRADAT_TABS.flatMap((t) => itemsForTab(c, t.id).map((i) => i.key));

/** Teks yang dibacakan untuk item (warna: bentuk mudzakkar lalu mu'annats). */
export function speechTexts(item: MufradatItem): string[] {
  switch (item.kind) {
    case 'vocab':
      return [item.vocab.ar];
    case 'color':
      return [item.color.m, item.color.f];
    case 'inda':
      return [item.pronoun.inda];
  }
}

/** Arti Indonesia ringkas untuk aria-label & kartu. */
export function meaningOf(item: MufradatItem): string {
  switch (item.kind) {
    case 'vocab':
      return item.vocab.id_meaning;
    case 'color':
      return item.color.id_meaning;
    case 'inda':
      return `${item.pronoun.id_meaning} punya`;
  }
}

/** Contoh عِنْدَ + benda indefinit (SKILL.md §6), mis. عِنْدِي فِرْجَارٌ. */
export const indaExample = (p: Pronoun, v: Vocab): string => `${p.inda} ${v.ar}`;

/** Teks Arab yang ditampilkan untuk item (untuk pencarian). */
function arabicOf(item: MufradatItem): string[] {
  switch (item.kind) {
    case 'vocab':
      return [item.vocab.ar];
    case 'color':
      return [item.color.m, item.color.f];
    case 'inda':
      return [item.pronoun.inda];
  }
}

/**
 * Cari item di semua kategori berdasarkan arti Indonesia atau tulisan Arab.
 * Arab dibandingkan tanpa harakat (normalizeForCompare), jadi "حقيبة" menemukan حَقِيْبَةٌ.
 */
export function searchItems(c: Bab3Content, query: string): MufradatItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const qAr = normalizeForCompare(q);
  return MUFRADAT_TABS.flatMap((t) => itemsForTab(c, t.id)).filter(
    (item) =>
      meaningOf(item).toLowerCase().includes(q) ||
      (qAr.length > 0 && arabicOf(item).some((ar) => normalizeForCompare(ar).includes(qAr))),
  );
}
