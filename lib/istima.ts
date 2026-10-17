// Ronde latihan menyimak (F7). Teks yang diucapkan TTS selalu dari JSON / generator kalimat.

import { isAttachable, sameArabic } from '@/lib/arabic';
import { tokenize } from '@/lib/lookup';
import { pick, type Rng, sample, shuffle } from '@/lib/rng';
import { colorSentence, type ColorPattern } from '@/lib/sentences';
import { splitSentences } from '@/lib/text';
import type { Bab3Content, Color } from '@/types/content';

export const TADRIB = [
  { id: 't1', title: 'Tadrib 1', desc: 'Dengar kata warna, pilih warnanya.' },
  { id: 't2', title: 'Tadrib 2', desc: 'Dengar kosakata, pilih artinya.' },
  { id: 't3', title: 'Tadrib 3', desc: 'Dengar kalimat warna, pilih kalimat yang benar.' },
  { id: 't4', title: 'Tadrib 4', desc: 'Dengar kalimat dari teks, lengkapi kata yang hilang.' },
] as const;
export type TadribId = (typeof TADRIB)[number]['id'];

export interface IstimaOption {
  value: string;
  label: string;
  lang: 'ar' | 'id';
  hex?: string;
  vocabId?: string;
}

export interface IstimaRound {
  /** Teks Arab yang dibacakan. */
  speak: string;
  /** Teks soal yang ditampilkan (mis. kalimat rumpang), opsional. */
  prompt?: string;
  options: IstimaOption[];
  answer: string;
  explanation: string;
}

export const ROUNDS_PER_TADRIB = 5;

function tadrib1(c: Bab3Content, rng: Rng): IstimaRound {
  const target = pick(c.colors, rng);
  const form = pick(['m', 'f'] as const, rng);
  const opts = shuffle([target, ...sample(c.colors.filter((x) => x.id !== target.id), 2, rng)], rng);
  return {
    speak: target[form],
    options: opts.map((x) => ({ value: x.id, label: x.id_meaning, lang: 'id', hex: x.hex })),
    answer: target.id,
    explanation: `${target[form]} = ${target.id_meaning}.`,
  };
}

function tadrib2(c: Bab3Content, rng: Rng): IstimaRound {
  const all = [...c.vocab.sekolah, ...c.vocab.kelas];
  const target = pick(all, rng);
  const pool = all.filter((v) => v.category === target.category && v.id !== target.id && v.id_meaning !== target.id_meaning);
  const opts = shuffle([target, ...sample(pool, 3, rng)], rng);
  return {
    speak: target.ar,
    options: opts.map((v) => ({ value: v.id, label: v.id_meaning, lang: 'id', vocabId: v.id })),
    answer: target.id,
    explanation: `${target.ar} = ${target.id_meaning}.`,
  };
}

function tadrib3(c: Bab3Content, rng: Rng): IstimaRound {
  const nouns = [...c.vocab.sekolah, ...c.vocab.kelas].filter(isAttachable);
  const noun = pick(nouns, rng);
  const color = pick(c.colors, rng);
  const pattern = pick([1, 2, 3] as const, rng) as ColorPattern;
  const right = colorSentence(c, noun, color, pattern);
  const otherColor = pick(c.colors.filter((x) => x.id !== color.id), rng);
  const otherNoun = pick(nouns.filter((x) => x.id !== noun.id && x.id_meaning !== noun.id_meaning), rng);
  const variants = [right, colorSentence(c, noun, otherColor, pattern), colorSentence(c, otherNoun, color, pattern)];
  return {
    speak: right.ar,
    options: shuffle(variants, rng).map((s) => ({ value: s.ar, label: s.ar, lang: 'ar' })),
    answer: right.ar,
    explanation: `Yang dibacakan: ${right.ar} (${right.translation})`,
  };
}

/** Kalimat nash yang memuat kata warna → kandidat soal rumpang. */
export function blankableSentences(c: Bab3Content): { sentence: string; color: Color; form: 'm' | 'f'; word: string }[] {
  const out: { sentence: string; color: Color; form: 'm' | 'f'; word: string }[] = [];
  for (const n of c.texts.nash) {
    for (const sentence of splitSentences(n.ar)) {
      for (const t of tokenize(sentence)) {
        for (const col of c.colors) {
          for (const form of ['m', 'f'] as const) {
            if (sameArabic(col[form], t.word)) out.push({ sentence, color: col, form, word: t.word });
          }
        }
      }
    }
  }
  return out;
}

function tadrib4(c: Bab3Content, rng: Rng): IstimaRound {
  const item = pick(blankableSentences(c), rng);
  const opts = shuffle([item.color, ...sample(c.colors.filter((x) => x.id !== item.color.id), 2, rng)], rng);
  return {
    speak: item.sentence,
    prompt: item.sentence.replace(item.word, '...'),
    options: opts.map((x) => ({ value: x[item.form], label: x[item.form], lang: 'ar' })),
    answer: item.color[item.form],
    explanation: `Kalimat lengkapnya: ${item.sentence}`,
  };
}

const MAKERS: Record<TadribId, (c: Bab3Content, rng: Rng) => IstimaRound> = {
  t1: tadrib1,
  t2: tadrib2,
  t3: tadrib3,
  t4: tadrib4,
};

/** Buat ronde untuk satu tadrib; teks yang dibacakan tidak berulang kalau memungkinkan. */
export function makeRounds(c: Bab3Content, id: TadribId, rng: Rng, n = ROUNDS_PER_TADRIB): IstimaRound[] {
  const rounds: IstimaRound[] = [];
  for (let guard = 0; rounds.length < n && guard < n * 20; guard++) {
    const r = MAKERS[id](c, rng);
    if (guard < n * 10 && rounds.some((x) => x.speak === r.speak)) continue;
    rounds.push(r);
  }
  return rounds;
}
