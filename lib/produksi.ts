// Pengecekan ringan tulisan siswa (F8). Sifatnya SARAN, bukan nilai.

import { isAttachable, normalizeForCompare } from '@/lib/arabic';
import { annotate, Lexicon, tokenize } from '@/lib/lookup';
import { lawnForms } from '@/lib/sentences';
import type { Bab3Content } from '@/types/content';

export interface TextCheck {
  /** Kata yang tampaknya ber-ال sekaligus ber-dhamir, mis. الْكِتَابُكَ. */
  alWithDhamir: string[];
  /** Pasangan لَوْن… + warna bentuk mu'annats (seharusnya mudzakkar). */
  lawnFeminine: string[];
  /** Kosakata Bab 3 yang dipakai (bentuk kamus, unik). */
  vocabUsed: string[];
  wordCount: number;
}

export const MIN_VOCAB = 5;
const SUFFIXES = ['ها', 'نا', 'ه', 'ك', 'ي'];
const stripConj = (s: string) => (s.length > 3 && /^[وفب]/.test(s) ? s.slice(1) : s);

export class TextChecker {
  private readonly lexicon: Lexicon;
  private readonly stems: Set<string>;
  private readonly feminineColors: Set<string>;
  private readonly lawn: string;

  constructor(c: Bab3Content) {
    this.lexicon = new Lexicon(c);
    this.stems = new Set([...c.vocab.sekolah, ...c.vocab.kelas].filter(isAttachable).map((v) => normalizeForCompare(v.stem)));
    this.feminineColors = new Set(c.colors.map((x) => normalizeForCompare(x.f)));
    this.lawn = normalizeForCompare(c.grammar_words.lawn_stem);
  }

  /** ال + benda + akhiran dhamir (benda dikenal dari data). */
  isAlWithDhamir(word: string): boolean {
    let n = normalizeForCompare(word);
    if (!n.startsWith('ال')) n = stripConj(n);
    if (!n.startsWith('ال')) return false;
    const rest = n.slice(2);
    if (this.stems.has(rest)) return false; // benda ber-ال biasa, mis. الكرسي
    return SUFFIXES.some((suf) => {
      if (!rest.endsWith(suf)) return false;
      const stem = rest.slice(0, -suf.length);
      return this.stems.has(stem) || (stem.endsWith('ت') && this.stems.has(stem.slice(0, -1) + 'ة'));
    });
  }

  check(text: string): TextCheck {
    const tokens = tokenize(text);
    const words = tokens.map((t) => t.word);

    const alWithDhamir = [...new Set(words.filter((w) => this.isAlWithDhamir(w)))];

    const lawnFeminine: string[] = [];
    tokens.forEach((t, i) => {
      if (!stripConj(normalizeForCompare(t.word)).startsWith(this.lawn)) return;
      // cek sampai 3 kata sesudahnya, berhenti di akhir kalimat
      for (let j = i; j < Math.min(tokens.length, i + 4); j++) {
        if (j > i && this.feminineColors.has(normalizeForCompare(tokens[j].word))) {
          lawnFeminine.push(words.slice(i, j + 1).join(' '));
          break;
        }
        if (/[.؟?!]/.test(tokens[j].trailing)) break;
      }
    });

    const vocabUsed = [
      ...new Set(
        annotate(this.lexicon, text)
          .filter((t) => t.entry?.kind === 'vocab')
          .map((t) => t.entry!.ar),
      ),
    ];

    return { alWithDhamir, lawnFeminine, vocabUsed, wordCount: words.length };
  }
}

/** Checklist tashih (PRD F8); kata Arab diturunkan dari JSON. */
export function checklistItems(c: Bab3Content): string[] {
  const lawn = lawnForms(c);
  return [
    'Kata ber-dhamir tidak diawali alif-lam',
    `Setelah ${lawn.mudhaf}, warna memakai bentuk mudzakkar`,
    `Tanpa ${lawn.dict}, warna sesuai gender bendanya`,
    `Memakai minimal ${MIN_VOCAB} mufradat Bab 3`,
  ];
}

export interface Draft {
  text: string;
  checks: boolean[];
}

export const emptyDraft: Draft = { text: '', checks: [false, false, false, false] };

export function parseDraft(raw: unknown): Draft {
  if (typeof raw !== 'object' || raw === null) return emptyDraft;
  const o = raw as Record<string, unknown>;
  const checks = Array.isArray(o.checks) ? o.checks.slice(0, 4).map((x) => x === true) : [];
  while (checks.length < 4) checks.push(false);
  return { text: typeof o.text === 'string' ? o.text.slice(0, 20000) : '', checks };
}
