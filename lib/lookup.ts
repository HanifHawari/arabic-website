// Lookup arti kata di teks (SKILL.md §8). Tidak mengarang arti: kalau tidak ketemu → null.

import { normalizeForCompare } from '@/lib/arabic';
import type { Bab3Content, Gender } from '@/types/content';

export interface LookupEntry {
  kind: 'vocab' | 'color' | 'pronoun' | 'inda' | 'isyarah' | 'lawn';
  /** Bentuk kamus (dari JSON). */
  ar: string;
  meaning: string;
  gender?: Gender;
  note?: string;
}

export interface TextToken {
  /** Teks asli kata (tanpa tanda baca di ujung). */
  word: string;
  /** Tanda baca yang menempel di belakang kata. */
  trailing: string;
}

const PUNCT = /[،,.؟?!:؛]+$/;
const PREFIXES = ['و', 'ف', 'ب'];
const SUFFIXES = ['ها', 'نا', 'ه', 'ك', 'ي'];

/** Pecah teks per spasi; tanda baca di ujung dipisah. */
export function tokenize(text: string): TextToken[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((raw) => {
      const m = raw.match(PUNCT);
      return m ? { word: raw.slice(0, -m[0].length), trailing: m[0] } : { word: raw, trailing: '' };
    });
}

/** Kandidat bentuk dasar (sudah dinormalisasi), urut dari perubahan paling sedikit. */
export function candidates(word: string): string[] {
  const base = normalizeForCompare(word);
  const out: string[] = [];
  const add = (s: string) => {
    if (s.length >= 2 && !out.includes(s)) out.push(s);
  };
  add(base);
  for (const p of PREFIXES) if (base.startsWith(p)) add(base.slice(1));
  for (const s of [...out]) if (s.startsWith('ال')) add(s.slice(2));
  for (const s of [...out]) {
    for (const suf of SUFFIXES) {
      if (!s.endsWith(suf)) continue;
      const stem = s.slice(0, -suf.length);
      add(stem);
      if (stem.endsWith('ت')) add(stem.slice(0, -1) + 'ة');
    }
  }
  return out;
}

export class Lexicon {
  private readonly single = new Map<string, LookupEntry>();
  private readonly phrases = new Map<string, LookupEntry>();

  constructor(c: Bab3Content) {
    const put = (key: string, e: LookupEntry) => {
      const k = normalizeForCompare(key);
      if (k.includes(' ')) {
        if (!this.phrases.has(k)) this.phrases.set(k, e);
      } else if (!this.single.has(k)) this.single.set(k, e);
    };
    for (const v of [...c.vocab.sekolah, ...c.vocab.kelas]) {
      const e: LookupEntry = { kind: 'vocab', ar: v.ar, meaning: v.id_meaning, gender: v.gender, note: v.note };
      put(v.stem ?? v.ar, e);
    }
    for (const col of c.colors) {
      put(col.m, { kind: 'color', ar: col.m, meaning: `${col.id_meaning} (mudzakkar)`, gender: 'm' });
      put(col.f, { kind: 'color', ar: col.f, meaning: `${col.id_meaning} (mu'annats)`, gender: 'f' });
    }
    for (const p of c.pronouns) {
      put(p.ar, { kind: 'pronoun', ar: p.ar, meaning: p.id_meaning });
      put(p.inda, { kind: 'inda', ar: p.inda, meaning: `${p.id_meaning} punya` });
    }
    for (const d of c.demonstratives) put(d.ar, { kind: 'isyarah', ar: d.ar, meaning: d.id_meaning, gender: d.gender });
    put(c.grammar_words.lawn_stem, { kind: 'lawn', ar: c.grammar_words.lawn, meaning: c.grammar_words.lawn_meaning });
  }

  lookup(word: string): LookupEntry | null {
    for (const cand of candidates(word)) {
      const e = this.single.get(cand);
      if (e) return e;
    }
    return null;
  }

  /** Cocokkan frasa 2 kata (mis. سَاعَةٌ حَائِطِيَّةٌ) mulai dari tokens[i]; و di depan boleh. */
  lookupPhrase(tokens: readonly TextToken[], i: number): LookupEntry | null {
    if (i + 1 >= tokens.length || tokens[i].trailing) return null;
    const second = normalizeForCompare(tokens[i + 1].word);
    for (const first of candidates(tokens[i].word).slice(0, 2)) {
      const e = this.phrases.get(`${first} ${second}`);
      if (e) return e;
    }
    return null;
  }
}

export interface AnnotatedToken extends TextToken {
  entry: LookupEntry | null;
}

/** Tandai setiap token dengan arti (frasa 2 kata diutamakan). */
export function annotate(lex: Lexicon, text: string): AnnotatedToken[] {
  const tokens = tokenize(text);
  const out: AnnotatedToken[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const phrase = lex.lookupPhrase(tokens, i);
    if (phrase) {
      out.push({ ...tokens[i], entry: phrase }, { ...tokens[i + 1], entry: phrase });
      i++;
      continue;
    }
    out.push({ ...tokens[i], entry: lex.lookup(tokens[i].word) });
  }
  return out;
}
