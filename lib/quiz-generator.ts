// Generator soal (SKILL.md §7). Setiap soal punya key yang bisa dibangun ulang (antrean review).
// Format key:
//   vocab_ar_to_id:<vocabId>            vocab_id_to_ar:<vocabId>
//   color_match:<colorId>,<colorId>,... lawn_pronoun:<vocabId>:<dekat|jauh>:<colorId>
//   color_form:<1|2|3>:<vocabId>:<colorId>
//   dhamir_choose:<vocabId>:<pronounId>  dhamir_identify:<vocabId>:<pronounId>  fix_al:<vocabId>:<pronounId>
//   sentence_builder:<1|2|3>:<vocabId>:<colorId>
//   bank:<lawn_pronoun|lawn_color_form|dhamir_choose|fix_al>:<index>

import { attachDhamir, isAttachable, makeDefinite, normalizeForCompare, sameArabic } from '@/lib/arabic';
import { content } from '@/lib/content';
import type { Bab3Content, Color, Distance, Pronoun, Vocab } from '@/types/content';
import {
  type ChoiceOption,
  type McqQuestion,
  type Question,
  type QuestionType,
  QUESTION_TYPES,
} from '@/lib/quiz';
import { pick, type Rng, sample, shuffle } from '@/lib/rng';
import { colorFormFor, colorSentence, demonstrative, lawnForms, suffixLabel, type ColorPattern } from '@/lib/sentences';
import { shortMeaning } from '@/lib/text';

const DHAMMAH = 'ُ';
const BANK_TYPE = {
  lawn_pronoun: 'lawn_pronoun',
  lawn_color_form: 'color_form',
  dhamir_choose: 'dhamir_choose',
  fix_al: 'fix_al',
} as const satisfies Record<string, QuestionType>;
type BankName = keyof typeof BANK_TYPE;

const isPattern = (s: string): s is `${ColorPattern}` => s === '1' || s === '2' || s === '3';

export class QuizGenerator {
  private readonly vocab: Vocab[];
  private readonly attachable: (Vocab & { stem: string; attachable: true })[];

  constructor(private readonly c: Bab3Content) {
    this.vocab = [...c.vocab.sekolah, ...c.vocab.kelas];
    this.attachable = this.vocab.filter(isAttachable);
  }

  // ---------- lookup ----------

  private vocabById = (id: string) => this.vocab.find((v) => v.id === id);
  private attachableById = (id: string) => this.attachable.find((v) => v.id === id);
  private colorById = (id: string) => this.c.colors.find((c) => c.id === id);
  private pronounById = (id: string) => this.c.pronouns.find((p) => p.id === id);

  /** Tipe soal dari key (termasuk key bank). */
  static typeOfKey(key: string): QuestionType | null {
    const [head, sub] = key.split(':');
    if (head === 'bank') return sub in BANK_TYPE ? BANK_TYPE[sub as BankName] : null;
    return (QUESTION_TYPES as readonly string[]).includes(head) ? (head as QuestionType) : null;
  }

  // ---------- key acak ----------

  randomKey(type: QuestionType, rng: Rng): string {
    const bankChance = 0.3;
    const bankFor = (name: BankName) => {
      const bank = this.c.quiz_bank[name];
      return bank.length > 0 && rng() < bankChance ? `bank:${name}:${Math.floor(rng() * bank.length)}` : null;
    };
    const v = () => pick(this.attachable, rng).id;
    const col = () => pick(this.c.colors, rng).id;
    const pr = () => pick(this.c.pronouns, rng).id;
    const pat = () => pick([1, 2, 3] as const, rng);

    switch (type) {
      case 'vocab_ar_to_id':
      case 'vocab_id_to_ar':
        return `${type}:${pick(this.vocab, rng).id}`;
      case 'color_match':
        return `color_match:${sample(this.c.colors, 4, rng).map((c) => c.id).join(',')}`;
      case 'lawn_pronoun':
        return bankFor('lawn_pronoun') ?? `lawn_pronoun:${v()}:${pick(['dekat', 'jauh'] as const, rng)}:${col()}`;
      case 'color_form':
        return bankFor('lawn_color_form') ?? `color_form:${pat()}:${v()}:${col()}`;
      case 'dhamir_choose':
        return bankFor('dhamir_choose') ?? `dhamir_choose:${v()}:${pr()}`;
      case 'dhamir_identify':
        return `dhamir_identify:${v()}:${pr()}`;
      case 'fix_al':
        return bankFor('fix_al') ?? `fix_al:${v()}:${pr()}`;
      case 'sentence_builder':
        return `sentence_builder:${pat()}:${v()}:${col()}`;
    }
  }

  // ---------- bangun soal dari key ----------

  /** null kalau key tidak valid (mis. data berubah). */
  fromKey(key: string, rng: Rng): Question | null {
    const parts = key.split(':');
    const [head] = parts;
    try {
      if (head === 'bank') return this.fromBank(parts[1] as BankName, Number(parts[2]), key, rng);
      switch (head as QuestionType) {
        case 'vocab_ar_to_id':
          return this.vocabArToId(key, parts[1], rng);
        case 'vocab_id_to_ar':
          return this.vocabIdToAr(key, parts[1], rng);
        case 'color_match':
          return this.colorMatch(key, parts[1].split(','), rng);
        case 'lawn_pronoun':
          return this.lawnPronoun(key, parts[1], parts[2] as Distance, parts[3], rng);
        case 'color_form':
          return isPattern(parts[1]) ? this.colorForm(key, Number(parts[1]) as ColorPattern, parts[2], parts[3], rng) : null;
        case 'dhamir_choose':
          return this.dhamirChoose(key, parts[1], parts[2], rng);
        case 'dhamir_identify':
          return this.dhamirIdentify(key, parts[1], parts[2], rng);
        case 'fix_al':
          return this.fixAl(key, parts[1], parts[2], rng);
        case 'sentence_builder':
          return isPattern(parts[1]) ? this.sentenceBuilder(key, Number(parts[1]) as ColorPattern, parts[2], parts[3], rng) : null;
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  generate(type: QuestionType, rng: Rng): Question {
    for (let i = 0; i < 20; i++) {
      const q = this.fromKey(this.randomKey(type, rng), rng);
      if (q) return q;
    }
    throw new Error(`Gagal membuat soal ${type}`);
  }

  // ---------- resep per tipe ----------

  /** Distraktor dari kategori yang sama, arti tidak kembar. */
  private distractors(v: Vocab, n: number, rng: Rng): Vocab[] {
    const seen = new Set([normalizeForCompare(shortMeaning(v.id_meaning)).toLowerCase(), normalizeForCompare(v.ar)]);
    const out: Vocab[] = [];
    for (const d of shuffle(this.vocab.filter((x) => x.category === v.category && x.id !== v.id), rng)) {
      const m = shortMeaning(d.id_meaning).toLowerCase();
      const a = normalizeForCompare(d.ar);
      if (seen.has(m) || seen.has(a)) continue;
      seen.add(m).add(a);
      out.push(d);
      if (out.length === n) break;
    }
    return out;
  }

  private vocabArToId(key: string, id: string, rng: Rng): McqQuestion | null {
    const v = this.vocabById(id);
    if (!v) return null;
    const options = shuffle([v, ...this.distractors(v, 3, rng)], rng).map(
      (x): ChoiceOption => ({ value: x.id, label: x.id_meaning, lang: 'id' }),
    );
    return {
      kind: 'mcq',
      key,
      type: 'vocab_ar_to_id',
      instruction: 'Apa arti kata ini?',
      prompt: v.ar,
      promptLang: 'ar',
      options,
      answer: v.id,
      explanation: `${v.ar} artinya "${v.id_meaning}".`,
    };
  }

  private vocabIdToAr(key: string, id: string, rng: Rng): McqQuestion | null {
    const v = this.vocabById(id);
    if (!v) return null;
    const options = shuffle([v, ...this.distractors(v, 3, rng)], rng).map(
      (x): ChoiceOption => ({ value: x.id, label: x.ar, lang: 'ar' }),
    );
    return {
      kind: 'mcq',
      key,
      type: 'vocab_id_to_ar',
      instruction: 'Pilih bahasa Arab yang tepat untuk kata ini.',
      prompt: v.id_meaning,
      promptLang: 'id',
      options,
      answer: v.id,
      explanation: `"${v.id_meaning}" dalam bahasa Arab: ${v.ar}.`,
    };
  }

  private colorMatch(key: string, ids: string[], rng: Rng): Question | null {
    const colors = ids.map(this.colorById);
    if (colors.length < 2 || colors.some((c) => !c)) return null;
    const cs = colors as Color[];
    return {
      kind: 'match',
      key,
      type: 'color_match',
      instruction: 'Jodohkan setiap warna dengan kata Arabnya.',
      left: cs.map((c, i) => ({ id: c.id, hex: c.hex, label: `Warna ${i + 1} (${c.id_meaning})` })),
      right: shuffle(cs, rng).map((c) => ({ value: c.id, label: c.m, lang: 'ar' as const })),
      explanation: cs.map((c) => `${c.m} = ${c.id_meaning}`).join(' · '),
    };
  }

  private lawnPronoun(key: string, vocabId: string, distance: Distance, colorId: string, rng: Rng): McqQuestion | null {
    const n = this.attachableById(vocabId);
    const color = this.colorById(colorId);
    if (!n || !color || (distance !== 'dekat' && distance !== 'jauh')) return null;
    const lawn = lawnForms(this.c);
    const isyarah = demonstrative(this.c, n.gender, distance);
    const answer = n.gender === 'm' ? lawn.hu : lawn.ha;
    return {
      kind: 'mcq',
      key,
      type: 'lawn_pronoun',
      instruction: 'Lengkapi dengan bentuk yang tepat.',
      prompt: `${isyarah.ar} ${makeDefinite(n.stem)}${DHAMMAH} ... ${color.m}`,
      promptLang: 'ar',
      options: shuffle([lawn.hu, lawn.ha], rng).map((x) => ({ value: x, label: x, lang: 'ar' as const })),
      answer,
      explanation: this.lawnPronounWhy(n.ar, n.gender === 'm'),
    };
  }

  private lawnPronounWhy(nounAr: string, masculine: boolean): string {
    const lawn = lawnForms(this.c);
    const p = this.pronounById(masculine ? 'huwa' : 'hiya')!;
    return `${nounAr} itu ${masculine ? 'mudzakkar' : "mu'annats"}, jadi dhamir yang kembali kepadanya ${suffixLabel(p)} → ${masculine ? lawn.hu : lawn.ha}.`;
  }

  private colorForm(key: string, pattern: ColorPattern, vocabId: string, colorId: string, rng: Rng): McqQuestion | null {
    const n = this.attachableById(vocabId);
    const color = this.colorById(colorId);
    if (!n || !color) return null;
    const s = colorSentence(this.c, n, color, pattern);
    const blanked = s.ar.slice(0, s.ar.length - s.colorWord.length) + '...';
    return {
      kind: 'mcq',
      key,
      type: 'color_form',
      instruction: `Pilih bentuk warna "${color.id_meaning}" yang tepat.`,
      prompt: blanked,
      promptLang: 'ar',
      options: shuffle([color.m, color.f], rng).map((x) => ({ value: x, label: x, lang: 'ar' as const })),
      answer: colorFormFor(pattern, n.gender) === 'm' ? color.m : color.f,
      explanation: s.explanation,
    };
  }

  private dhamirOptions(stem: string, p: Pronoun, rng: Rng): ChoiceOption[] {
    const others = sample(
      this.c.pronouns.filter((x) => x.id !== p.id),
      3,
      rng,
    );
    return shuffle([p, ...others], rng).map((x) => {
      const form = attachDhamir(stem, x);
      return { value: form, label: form, lang: 'ar' as const };
    });
  }

  private dhamirWhy(p: Pronoun, stem: string): string {
    const parts = [`${p.ar} (${p.id_meaning}) → akhiran ${suffixLabel(p)}.`];
    if (stem.endsWith('ة')) parts.push('Ta marbuthah ة berubah jadi ت.');
    if (p.vowel === 'ِ') parts.push(`Untuk ${p.ar}, huruf terakhir benda berharakat kasrah.`);
    return parts.join(' ');
  }

  private dhamirChoose(key: string, vocabId: string, pronounId: string, rng: Rng): McqQuestion | null {
    const n = this.attachableById(vocabId);
    const p = this.pronounById(pronounId);
    if (!n || !p) return null;
    return {
      kind: 'mcq',
      key,
      type: 'dhamir_choose',
      instruction: `Pilih bentuk "${shortMeaning(n.id_meaning)}" yang cocok dengan dhamir ini.`,
      prompt: `${p.ar} + ${n.ar}`,
      promptLang: 'ar',
      options: this.dhamirOptions(n.stem, p, rng),
      answer: attachDhamir(n.stem, p),
      explanation: this.dhamirWhy(p, n.stem),
    };
  }

  private dhamirIdentify(key: string, vocabId: string, pronounId: string, rng: Rng): McqQuestion | null {
    const n = this.attachableById(vocabId);
    const p = this.pronounById(pronounId);
    if (!n || !p) return null;
    const others = sample(
      this.c.pronouns.filter((x) => x.id !== p.id),
      3,
      rng,
    );
    return {
      kind: 'mcq',
      key,
      type: 'dhamir_identify',
      instruction: 'Kata ini memakai dhamir apa?',
      prompt: attachDhamir(n.stem, p),
      promptLang: 'ar',
      options: shuffle([p, ...others], rng).map((x) => ({ value: x.id, label: x.ar, lang: 'ar' as const })),
      answer: p.id,
      explanation: `Akhiran ${suffixLabel(p)} menunjukkan ${p.ar} (${p.id_meaning}).`,
    };
  }

  private fixAlQuestion(key: string, n: { stem: string }, p: Pronoun, wrong: string, rng: Rng): McqQuestion {
    const right = attachDhamir(n.stem, p);
    const other = pick(
      this.c.pronouns.filter((x) => x.id !== p.id),
      rng,
    );
    const options = [right, wrong, attachDhamir(n.stem, other)];
    return {
      kind: 'mcq',
      key,
      type: 'fix_al',
      instruction: `Kata ini salah tulis (maksudnya: dhamir ${p.ar}). Pilih perbaikannya.`,
      prompt: wrong,
      promptLang: 'ar',
      options: shuffle(options, rng).map((x) => ({ value: x, label: x, lang: 'ar' as const })),
      answer: right,
      explanation: `Kata yang sudah diberi dhamir tidak boleh diawali ال. ${wrong} → ${right}.`,
    };
  }

  private fixAl(key: string, vocabId: string, pronounId: string, rng: Rng): McqQuestion | null {
    const n = this.attachableById(vocabId);
    const p = this.pronounById(pronounId);
    if (!n || !p) return null;
    return this.fixAlQuestion(key, n, p, makeDefinite(attachDhamir(n.stem, p)), rng);
  }

  private sentenceBuilder(key: string, pattern: ColorPattern, vocabId: string, colorId: string, rng: Rng): Question | null {
    const n = this.attachableById(vocabId);
    const color = this.colorById(colorId);
    if (!n || !color) return null;
    const s = colorSentence(this.c, n, color, pattern);
    const words = s.ar.split(' ');
    let tokens = words.map((text, i) => ({ id: `t${i}`, text }));
    // Pastikan urutan acak tidak sama dengan jawaban.
    for (let i = 0; i < 5; i++) {
      tokens = shuffle(tokens, rng);
      if (tokens.some((t, j) => t.text !== words[j])) break;
    }
    return {
      kind: 'builder',
      key,
      type: 'sentence_builder',
      instruction: 'Susun kata-kata ini jadi kalimat yang benar (urutan dari kanan ke kiri).',
      tokens,
      answer: s.ar,
      translation: s.translation,
      explanation: s.explanation,
    };
  }

  private fromBank(name: BankName, index: number, key: string, rng: Rng): Question | null {
    if (!(name in BANK_TYPE)) return null;
    const lawn = lawnForms(this.c);
    if (name === 'fix_al') {
      const item = this.c.quiz_bank.fix_al[index];
      if (!item) return null;
      for (const n of this.attachable) {
        for (const p of this.c.pronouns) {
          if (sameArabic(attachDhamir(n.stem, p), item.right)) return this.fixAlQuestion(key, n, p, item.wrong, rng);
        }
      }
      return null;
    }
    const item = this.c.quiz_bank[name][index];
    if (!item) return null;
    const type = BANK_TYPE[name];
    let explanation = item.why ?? '';
    let instruction = 'Lengkapi dengan bentuk yang tepat.';
    if (name === 'lawn_pronoun') {
      explanation ||= this.lawnPronounWhy(item.q.split(' ')[1] ?? '', sameArabic(item.answer, lawn.hu));
    } else if (name === 'dhamir_choose') {
      const p = this.c.pronouns.find((x) => sameArabic(x.ar, item.q));
      instruction = 'Pilih kata yang cocok dengan dhamir ini.';
      explanation ||= p ? `${p.ar} (${p.id_meaning}) → akhiran ${suffixLabel(p)}.` : '';
    } else if (name === 'lawn_color_form') {
      instruction = 'Pilih bentuk warna yang tepat.';
    }
    return {
      kind: 'mcq',
      key,
      type,
      instruction,
      prompt: item.q,
      promptLang: 'ar',
      options: shuffle(item.options, rng).map((x) => ({ value: x, label: x, lang: 'ar' as const })),
      answer: item.answer,
      explanation,
    };
  }

  // ---------- sesi ----------

  /**
   * Satu sesi: soal review dulu (maks. setengah sesi), sisanya acak dengan tipe bergiliran.
   * Hanya soal bertipe `types` yang dipakai.
   */
  buildSession(opts: { types: readonly QuestionType[]; count: number; rng: Rng; reviewKeys?: readonly string[] }): Question[] {
    const { types, count, rng, reviewKeys = [] } = opts;
    const used = new Set<string>();
    const out: Question[] = [];

    const maxReview = Math.floor(count / 2);
    for (const key of reviewKeys) {
      if (out.length >= maxReview) break;
      const t = QuizGenerator.typeOfKey(key);
      if (!t || !types.includes(t) || used.has(key)) continue;
      const q = this.fromKey(key, rng);
      if (q) {
        used.add(key);
        out.push(q);
      }
    }

    let order = shuffle(types, rng);
    let i = 0;
    let guard = 0;
    while (out.length < count && guard++ < count * 30) {
      if (i === order.length) {
        order = shuffle(types, rng);
        i = 0;
      }
      const key = this.randomKey(order[i], rng);
      if (used.has(key)) continue;
      const q = this.fromKey(key, rng);
      if (!q) continue;
      used.add(key);
      out.push(q);
      i++;
    }
    return shuffle(out, rng);
  }
}


/** Generator untuk konten Bab 3. */
export const quizGenerator = new QuizGenerator(content);
