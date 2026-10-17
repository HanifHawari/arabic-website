import { describe, expect, it } from 'vitest';
import { normalizeForCompare, sameArabic, stripHarakat } from '@/lib/arabic';
import { allVocab, content } from '@/lib/content';
import { isCorrect, QUESTION_TYPES, typesForFocus, type McqQuestion, type Question } from '@/lib/quiz';
import { QuizGenerator } from '@/lib/quiz-generator';
import { createRng } from '@/lib/rng';
import { lawnForms } from '@/lib/sentences';

const gen = new QuizGenerator(content);
const mcq = (q: Question | null): McqQuestion => {
  if (!q || q.kind !== 'mcq') throw new Error('bukan MCQ');
  return q;
};
const vocab = (id: string) => allVocab.find((v) => v.id === id)!;

describe('properti umum semua tipe soal (500 soal acak)', () => {
  const rng = createRng(7);
  for (const type of QUESTION_TYPES) {
    it(type, () => {
      for (let i = 0; i < 60; i++) {
        const q = gen.generate(type, rng);
        expect(q.type).toBe(type);
        expect(q.explanation.length).toBeGreaterThan(0);
        expect(QuizGenerator.typeOfKey(q.key)).toBe(type);
        // key bisa dibangun ulang jadi soal dengan jawaban yang sama
        const again = gen.fromKey(q.key, createRng(i));
        expect(again).not.toBeNull();
        if (q.kind === 'mcq') {
          const values = q.options.map((o) => o.value);
          expect(new Set(values).size, `opsi kembar: ${values}`).toBe(values.length);
          const labels = q.options.map((o) => normalizeForCompare(o.label) + '|' + o.label.normalize('NFC'));
          expect(new Set(labels).size).toBe(labels.length);
          expect(values).toContain(q.answer);
          expect(isCorrect(q, q.answer)).toBe(true);
          for (const v of values.filter((x) => x !== q.answer)) expect(isCorrect(q, v)).toBe(false);
          expect(mcq(again).answer).toBe(q.answer);
        } else if (q.kind === 'match') {
          expect(isCorrect(q, Object.fromEntries(q.left.map((l) => [l.id, l.id])))).toBe(true);
          const [a, b] = q.left;
          expect(isCorrect(q, { ...Object.fromEntries(q.left.map((l) => [l.id, l.id])), [a.id]: b.id, [b.id]: a.id })).toBe(false);
        } else {
          const words = q.answer.split(' ');
          const ordered: string[] = [];
          const pool = [...q.tokens];
          for (const w of words) {
            const i2 = pool.findIndex((t) => t.text === w);
            ordered.push(pool.splice(i2, 1)[0].id);
          }
          expect(isCorrect(q, ordered)).toBe(true);
          expect(isCorrect(q, [...ordered].reverse())).toBe(words.length > 1 ? false : true);
          expect(q.tokens.map((t) => t.text).join(' ')).not.toBe(q.answer);
        }
      }
    });
  }
});

describe('resep khusus', () => {
  it('vocab_ar_to_id: distraktor dari kategori yang sama', () => {
    for (let i = 0; i < 30; i++) {
      const q = mcq(gen.fromKey('vocab_ar_to_id:haqibah', createRng(i)));
      for (const o of q.options) expect(vocab(o.value).category).toBe('sekolah');
      expect(q.options).toHaveLength(4);
    }
  });

  it('vocab soal boleh dari frasa majemuk (attachable:false)', () => {
    expect(gen.fromKey('vocab_id_to_ar:kasyful_hudhur', createRng(1))).not.toBeNull();
  });

  it('soal dhamir/warna tidak boleh dari item attachable:false', () => {
    expect(gen.fromKey('dhamir_choose:kasyful_hudhur:ana', createRng(1))).toBeNull();
    expect(gen.fromKey('color_form:1:brojektor:ahmar', createRng(1))).toBeNull();
    expect(gen.fromKey('fix_al:qalam_rashash:huwa', createRng(1))).toBeNull();
  });

  it("color_form: opsi selalu pasangan m/f warna yang sama; pola 1 & 2 → m walau benda mu'annats", () => {
    const red = content.colors.find((c) => c.id === 'ahmar')!;
    for (const p of [1, 2] as const) {
      const q = mcq(gen.fromKey(`color_form:${p}:haqibah:ahmar`, createRng(3)));
      expect(q.options.map((o) => o.value).sort()).toEqual([red.m, red.f].sort());
      expect(q.answer).toBe(red.m);
    }
    expect(mcq(gen.fromKey('color_form:3:haqibah:ahmar', createRng(3))).answer).toBe(red.f);
    expect(mcq(gen.fromKey('color_form:3:qalam:ahmar', createRng(3))).answer).toBe(red.m);
  });

  it('lawn_pronoun: opsi [لَوْنُهُ, لَوْنُهَا], jawaban ikut gender', () => {
    const lawn = lawnForms(content);
    expect(mcq(gen.fromKey('lawn_pronoun:haqibah:dekat:bunni', createRng(1))).answer).toBe(lawn.ha);
    const q = mcq(gen.fromKey('lawn_pronoun:qalam:jauh:ahmar', createRng(1)));
    expect(q.answer).toBe(lawn.hu);
    expect(stripHarakat(q.prompt).startsWith('ذلك')).toBe(true);
  });

  it('dhamir_choose: 4 opsi dari stem yang sama', () => {
    const q = mcq(gen.fromKey('dhamir_choose:shurah:anti', createRng(2)));
    expect(q.options).toHaveLength(4);
    for (const o of q.options) expect(stripHarakat(o.label).startsWith('صورت')).toBe(true);
    expect(sameArabic(q.answer, 'صُوْرَتُكِ')).toBe(true);
  });

  it('fix_al: soal ber-ال, jawaban tanpa ال', () => {
    const q = mcq(gen.fromKey('fix_al:kitab:anta', createRng(2)));
    expect(sameArabic(q.prompt, 'الْكِتَابُكَ')).toBe(true);
    expect(sameArabic(q.answer, 'كِتَابُكَ')).toBe(true);
    const bank = mcq(gen.fromKey('bank:fix_al:2', createRng(2)));
    expect(bank.prompt).toBe(content.quiz_bank.fix_al[2].wrong);
    expect(sameArabic(bank.answer, content.quiz_bank.fix_al[2].right)).toBe(true);
  });

  it('semua soal quiz_bank bisa dibangun', () => {
    for (const [name, items] of Object.entries(content.quiz_bank)) {
      if (!Array.isArray(items)) continue;
      items.forEach((_, i) => expect(gen.fromKey(`bank:${name}:${i}`, createRng(i)), `${name}:${i}`).not.toBeNull());
    }
  });

  it('key rusak → null', () => {
    for (const k of ['', 'x:y', 'vocab_ar_to_id:tidak_ada', 'color_form:9:kitab:ahmar', 'bank:lawn_pronoun:99', 'bank:nope:0']) {
      expect(gen.fromKey(k, createRng(1)), k).toBeNull();
    }
  });
});

describe('buildSession', () => {
  it('10 soal unik, sesuai fokus', () => {
    for (const focus of ['campur', 'mufradat', 'warna', 'dhamir'] as const) {
      const types = typesForFocus(focus);
      const qs = gen.buildSession({ types, count: 10, rng: createRng(11) });
      expect(qs).toHaveLength(10);
      expect(new Set(qs.map((q) => q.key)).size).toBe(10);
      for (const q of qs) expect(types).toContain(q.type);
    }
  });

  it('campur: memakai banyak tipe', () => {
    const qs = gen.buildSession({ types: typesForFocus('campur'), count: 10, rng: createRng(5) });
    expect(new Set(qs.map((q) => q.type)).size).toBeGreaterThanOrEqual(8);
  });

  it('soal review ikut masuk (maks. setengah sesi), key tidak valid dilewati', () => {
    const review = ['dhamir_choose:bab:ana', 'vocab_ar_to_id:qalam', 'rusak:1', 'fix_al:kitab:anta'];
    const qs = gen.buildSession({ types: typesForFocus('dhamir'), count: 10, rng: createRng(1), reviewKeys: review });
    const keys = qs.map((q) => q.key);
    expect(keys).toContain('dhamir_choose:bab:ana');
    expect(keys).toContain('fix_al:kitab:anta');
    expect(keys).not.toContain('vocab_ar_to_id:qalam'); // beda fokus
    const many = Array.from({ length: 10 }, (_, i) => `vocab_ar_to_id:${allVocab[i].id}`);
    const qs2 = gen.buildSession({ types: typesForFocus('mufradat'), count: 10, rng: createRng(1), reviewKeys: many });
    expect(qs2.filter((q) => many.includes(q.key)).length).toBe(5);
  });

  it('mini-quiz 3 soal', () => {
    expect(gen.buildSession({ types: ['dhamir_choose', 'fix_al'], count: 3, rng: createRng(4) })).toHaveLength(3);
  });
});
