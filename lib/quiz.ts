// Tipe soal & pengecekan jawaban (F6). Generator ada di lib/quiz-generator.ts.

import { sameArabic } from '@/lib/arabic';
import type { ComprehensionQuestion } from '@/types/content';

export const QUESTION_TYPES = [
  'vocab_ar_to_id',
  'vocab_id_to_ar',
  'color_match',
  'lawn_pronoun',
  'color_form',
  'dhamir_choose',
  'dhamir_identify',
  'fix_al',
  'sentence_builder',
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];
/** Tipe di luar generator latihan (tidak masuk sesi campuran / antrean review). */
export type ExtraQuestionType = 'pemahaman';
export type AnyQuestionType = QuestionType | ExtraQuestionType;

export type Lang = 'ar' | 'id';

export interface ChoiceOption {
  value: string;
  label: string;
  lang: Lang;
}

interface QuestionBase {
  /** Key unik & bisa dibangun ulang (dipakai antrean review). */
  key: string;
  type: AnyQuestionType;
  /** Perintah soal (Bahasa Indonesia, boleh mengandung kata Arab). */
  instruction: string;
  /** Penjelasan setelah menjawab (Bahasa Indonesia, boleh mengandung kata Arab). */
  explanation: string;
}

export interface McqQuestion extends QuestionBase {
  kind: 'mcq';
  /** Boleh kosong kalau soalnya sudah cukup di `instruction`. */
  prompt: string;
  promptLang: Lang;
  options: ChoiceOption[];
  /** `value` opsi yang benar. */
  answer: string;
}

export interface MatchQuestion extends QuestionBase {
  kind: 'match';
  /** Kiri: swatch warna. */
  left: { id: string; hex: string; label: string }[];
  /** Kanan: kata warna (value = id warna), sudah diacak. */
  right: ChoiceOption[];
}

export interface BuilderQuestion extends QuestionBase {
  kind: 'builder';
  /** Potongan kata (sudah diacak); id unik walau teksnya sama. */
  tokens: { id: string; text: string }[];
  /** Kalimat benar. */
  answer: string;
  translation: string;
}

export type Question = McqQuestion | MatchQuestion | BuilderQuestion;

/** Jawaban user: MCQ = value; match = {leftId: rightValue}; builder = urutan id token. */
export type UserAnswer = string | Record<string, string> | string[];

export function isCorrect(q: Question, answer: UserAnswer): boolean {
  switch (q.kind) {
    case 'mcq': {
      if (typeof answer !== 'string') return false;
      if (answer === q.answer) return true;
      const opt = q.options.find((o) => o.value === answer);
      const right = q.options.find((o) => o.value === q.answer);
      return !!opt && !!right && opt.lang === 'ar' && sameArabic(opt.label, right.label);
    }
    case 'match': {
      if (typeof answer !== 'object' || Array.isArray(answer)) return false;
      return q.left.every((l) => answer[l.id] === l.id);
    }
    case 'builder': {
      if (!Array.isArray(answer) || answer.length !== q.tokens.length) return false;
      const text = answer.map((id) => q.tokens.find((t) => t.id === id)?.text ?? '').join(' ');
      return sameArabic(text, q.answer);
    }
  }
}

/** Jawaban benar dalam bentuk teks (untuk feedback & rekap). */
export function correctAnswerText(q: Question): { text: string; ar: boolean } {
  if (q.kind === 'mcq') {
    const o = q.options.find((x) => x.value === q.answer)!;
    return { text: o.label, ar: o.lang === 'ar' };
  }
  if (q.kind === 'builder') return { text: q.answer, ar: true };
  return { text: q.explanation, ar: false };
}

export interface QuizResult {
  key: string;
  type: AnyQuestionType;
  correct: boolean;
}

export const TYPE_LABELS: Record<AnyQuestionType, string> = {
  pemahaman: 'Pemahaman teks',
  vocab_ar_to_id: 'Arab → arti',
  vocab_id_to_ar: 'Arti → Arab',
  color_match: 'Jodohkan warna',
  lawn_pronoun: 'Pilih lawnuhu / lawnuha',
  color_form: 'Bentuk warna',
  dhamir_choose: 'Pilih dhamir',
  dhamir_identify: 'Tebak dhamir',
  fix_al: 'Perbaiki kesalahan',
  sentence_builder: 'Susun kalimat',
};

/** Soal pemahaman nash dari JSON → soal pilihan ganda. */
export function fromComprehension(nashId: string, index: number, cq: ComprehensionQuestion): McqQuestion {
  return {
    kind: 'mcq',
    key: `pemahaman:${nashId}:${index}`,
    type: 'pemahaman',
    instruction: cq.q,
    prompt: '',
    promptLang: 'id',
    options: cq.options.map((o) => ({ value: o, label: o, lang: cq.options_lang })),
    answer: cq.answer,
    explanation: cq.why,
  };
}

export const FOCUS_OPTIONS = [
  { id: 'campur', label: 'Campur', types: QUESTION_TYPES },
  { id: 'mufradat', label: 'Mufradat', types: ['vocab_ar_to_id', 'vocab_id_to_ar'] },
  { id: 'warna', label: 'Warna', types: ['color_match', 'lawn_pronoun', 'color_form', 'sentence_builder'] },
  { id: 'dhamir', label: 'Dhamir', types: ['dhamir_choose', 'dhamir_identify', 'fix_al'] },
] as const satisfies readonly { id: string; label: string; types: readonly QuestionType[] }[];

export type Focus = (typeof FOCUS_OPTIONS)[number]['id'];

export const typesForFocus = (focus: Focus): readonly QuestionType[] =>
  FOCUS_OPTIONS.find((f) => f.id === focus)!.types;
