// Tipe konten, diturunkan dari skema content/bab3.json.
// Validasi runtime ada di lib/content.ts.

export type Gender = 'm' | 'f';
export type VocabCategory = 'sekolah' | 'kelas';
export type Distance = 'dekat' | 'jauh';

export interface Vocab {
  id: string;
  ar: string;
  /** Kata tanpa tanwin; null untuk frasa majemuk / kata serapan. */
  stem: string | null;
  id_meaning: string;
  gender: Gender;
  category: VocabCategory;
  attachable: boolean;
  note?: string;
}

/** Vocab yang boleh ditempeli dhamir (stem pasti ada). */
export type AttachableVocab = Vocab & { stem: string; attachable: true };

export interface Color {
  id: string;
  m: string;
  f: string;
  id_meaning: string;
  hex: string;
}

export interface Pronoun {
  id: string;
  ar: string;
  suffix: string;
  /** Harakat huruf akhir benda sebelum suffix: dhammah, atau kasrah untuk أَنَا. */
  vowel: string;
  id_meaning: string;
  inda: string;
}

export interface Demonstrative {
  ar: string;
  id_meaning: string;
  gender: Gender;
  distance: Distance;
}

export interface Expression {
  ar: string;
  id_meaning: string;
}

export interface Kd {
  kode: string;
  teks: string;
}

export interface DhamirGrammarRow {
  pronoun: string;
  suffix: string;
  result: string;
  id_meaning: string;
}

export interface DhamirGrammar {
  id: 'dhamir_muttashil';
  title: string;
  summary: string;
  table_example_base: string;
  rows: DhamirGrammarRow[];
  rules: string[];
  /** Pasangan [salah, benar]. */
  wrong_right: [string, string][];
}

export interface LawnPattern {
  name: string;
  example: string;
  id_meaning: string;
  rule: string;
}

export interface LawnGrammar {
  id: 'lawn';
  title: string;
  patterns: LawnPattern[];
  color_form_rule: string;
}

export type Grammar = DhamirGrammar | LawnGrammar;

export interface Nash {
  id: string;
  title: string;
  ar: string;
  translation: string;
  /** Hanya diisi user (teks asli buku). */
  book_text: string | null;
}

export interface HiwarLine {
  speaker: string;
  ar: string;
  translation: string;
}

export interface Hiwar {
  id: string;
  title: string;
  book_text: string | null;
  lines: HiwarLine[];
}

export interface ChoiceQuestion {
  q: string;
  options: string[];
  answer: string;
  why?: string;
}

export interface FixAlQuestion {
  wrong: string;
  right: string;
}

export interface QuizBank {
  _note?: string;
  lawn_pronoun: ChoiceQuestion[];
  lawn_color_form: ChoiceQuestion[];
  dhamir_choose: ChoiceQuestion[];
  fix_al: FixAlQuestion[];
}

export interface BookSection {
  section: string;
  parts: string[];
}

/** Kata bantu kaidah (ditambahkan agent, wajib dicek guru). */
export interface GrammarWords {
  _note?: string;
  /** لَوْنٌ (bentuk kamus). */
  lawn: string;
  /** لَوْن tanpa tanwin, untuk ditempeli dhamir / harakat. */
  lawn_stem: string;
  lawn_meaning: string;
  mudzakkar: string;
  muannats: string;
}

export interface ComprehensionQuestion {
  q: string;
  options_lang: 'ar' | 'id';
  options: string[];
  answer: string;
  why: string;
}

/** Soal pemahaman per nash, key = Nash.id. */
export type Comprehension = { _note?: string } & Record<string, ComprehensionQuestion[] | string | undefined>;

export interface Bab3Content {
  meta: {
    source: string;
    title_ar: string;
    title_id: string;
    transcription_note: string;
  };
  kompetensi: { kd: Kd[] };
  vocab: { sekolah: Vocab[]; kelas: Vocab[] };
  colors: Color[];
  pronouns: Pronoun[];
  demonstratives: Demonstrative[];
  expressions: Expression[];
  grammar: Grammar[];
  texts: { _note?: string; nash: Nash[]; hiwar: Hiwar[] };
  quiz_bank: QuizBank;
  istima: { _note?: string; known_issue?: string };
  book_structure: BookSection[];
  grammar_words: GrammarWords;
  comprehension: Comprehension;
}
