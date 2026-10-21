// Loader + validasi runtime untuk content/bab3.json (satu-satunya sumber konten).
// Validasi jalan saat build (static export), jadi data rusak bikin build gagal, bukan UI rusak.

import raw from '@/content/bab3.json';
import type { Bab3Content, ComprehensionQuestion, Vocab } from '@/types/content';

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNonEmptyStr = (v: unknown): v is string => isStr(v) && v.trim().length > 0;
const isStrArr = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);

/** Kumpulkan pesan error; kosong berarti valid. */
export function validateContent(data: unknown): string[] {
  const errors: string[] = [];
  const err = (path: string, msg: string) => errors.push(`${path}: ${msg}`);

  const strFields = (o: unknown, path: string, fields: string[]): o is Obj => {
    if (!isObj(o)) {
      err(path, 'harus object');
      return false;
    }
    for (const f of fields) if (!isNonEmptyStr(o[f])) err(`${path}.${f}`, 'harus string tidak kosong');
    return true;
  };

  const arr = (v: unknown, path: string): unknown[] => {
    if (!Array.isArray(v)) {
      err(path, 'harus array');
      return [];
    }
    return v;
  };

  if (!isObj(data)) return ['root: harus object'];

  strFields(data.meta, 'meta', ['source', 'title_ar', 'title_id', 'transcription_note']);

  if (strFields(data.kompetensi, 'kompetensi', [])) {
    arr(data.kompetensi.kd, 'kompetensi.kd').forEach((kd, i) =>
      strFields(kd, `kompetensi.kd[${i}]`, ['kode', 'teks']),
    );
  }

  // Vocab
  const ids = new Set<string>();
  if (strFields(data.vocab, 'vocab', [])) {
    for (const cat of ['sekolah', 'kelas'] as const) {
      arr(data.vocab[cat], `vocab.${cat}`).forEach((v, i) => {
        const p = `vocab.${cat}[${i}]`;
        if (!strFields(v, p, ['id', 'ar', 'id_meaning'])) return;
        if (isStr(v.id)) {
          if (ids.has(v.id)) err(`${p}.id`, `id duplikat "${v.id}"`);
          ids.add(v.id);
        }
        if (v.gender !== 'm' && v.gender !== 'f') err(`${p}.gender`, "harus 'm' atau 'f'");
        if (v.category !== cat) err(`${p}.category`, `harus "${cat}" sesuai grupnya`);
        if (typeof v.attachable !== 'boolean') err(`${p}.attachable`, 'harus boolean');
        if (v.stem !== null && !isNonEmptyStr(v.stem)) err(`${p}.stem`, 'harus string atau null');
        if (v.attachable === true && v.stem === null) err(`${p}.stem`, 'attachable:true butuh stem');
        if (v.note !== undefined && !isStr(v.note)) err(`${p}.note`, 'harus string');
      });
    }
  }

  arr(data.colors, 'colors').forEach((c, i) => {
    const p = `colors[${i}]`;
    if (!strFields(c, p, ['id', 'm', 'f', 'id_meaning', 'hex'])) return;
    if (isStr(c.hex) && !/^#[0-9a-fA-F]{6}$/.test(c.hex)) err(`${p}.hex`, 'harus format #RRGGBB');
  });

  arr(data.pronouns, 'pronouns').forEach((pr, i) =>
    strFields(pr, `pronouns[${i}]`, ['id', 'ar', 'suffix', 'vowel', 'id_meaning', 'inda']),
  );

  arr(data.demonstratives, 'demonstratives').forEach((d, i) => {
    const p = `demonstratives[${i}]`;
    if (!strFields(d, p, ['ar', 'id_meaning'])) return;
    if (d.gender !== 'm' && d.gender !== 'f') err(`${p}.gender`, "harus 'm' atau 'f'");
    if (d.distance !== 'dekat' && d.distance !== 'jauh') err(`${p}.distance`, "harus 'dekat' atau 'jauh'");
  });

  arr(data.expressions, 'expressions').forEach((e, i) =>
    strFields(e, `expressions[${i}]`, ['ar', 'id_meaning']),
  );

  arr(data.grammar, 'grammar').forEach((g, i) => {
    const p = `grammar[${i}]`;
    if (!strFields(g, p, ['id', 'title'])) return;
    if (g.id === 'dhamir_muttashil') {
      strFields(g, p, ['summary', 'table_example_base']);
      arr(g.rows, `${p}.rows`).forEach((r, j) =>
        strFields(r, `${p}.rows[${j}]`, ['pronoun', 'suffix', 'result', 'id_meaning']),
      );
      if (!isStrArr(g.rules)) err(`${p}.rules`, 'harus array string');
      arr(g.wrong_right, `${p}.wrong_right`).forEach((pair, j) => {
        if (!isStrArr(pair) || pair.length !== 2) err(`${p}.wrong_right[${j}]`, 'harus [salah, benar]');
      });
    } else if (g.id === 'lawn') {
      strFields(g, p, ['color_form_rule']);
      arr(g.patterns, `${p}.patterns`).forEach((pt, j) =>
        strFields(pt, `${p}.patterns[${j}]`, ['name', 'example', 'id_meaning', 'rule']),
      );
    } else {
      err(`${p}.id`, `id grammar tidak dikenal "${String(g.id)}"`);
    }
  });

  const bookText = (o: Obj, p: string) => {
    if (o.book_text !== null && !isStr(o.book_text)) err(`${p}.book_text`, 'harus string atau null');
  };
  if (strFields(data.texts, 'texts', [])) {
    arr(data.texts.nash, 'texts.nash').forEach((n, i) => {
      const p = `texts.nash[${i}]`;
      if (strFields(n, p, ['id', 'title', 'ar', 'translation'])) bookText(n, p);
    });
    arr(data.texts.hiwar, 'texts.hiwar').forEach((h, i) => {
      const p = `texts.hiwar[${i}]`;
      if (!strFields(h, p, ['id', 'title'])) return;
      bookText(h, p);
      arr(h.lines, `${p}.lines`).forEach((l, j) =>
        strFields(l, `${p}.lines[${j}]`, ['speaker', 'ar', 'translation']),
      );
    });
  }

  if (strFields(data.quiz_bank, 'quiz_bank', [])) {
    const qb = data.quiz_bank;
    for (const key of ['lawn_pronoun', 'lawn_color_form', 'dhamir_choose'] as const) {
      arr(qb[key], `quiz_bank.${key}`).forEach((q, i) => {
        const p = `quiz_bank.${key}[${i}]`;
        if (!strFields(q, p, ['q', 'answer'])) return;
        if (!isStrArr(q.options) || q.options.length < 2) err(`${p}.options`, 'minimal 2 opsi string');
        else if (isStr(q.answer) && !q.options.includes(q.answer)) err(`${p}.answer`, 'tidak ada di options');
      });
    }
    arr(qb.fix_al, 'quiz_bank.fix_al').forEach((q, i) =>
      strFields(q, `quiz_bank.fix_al[${i}]`, ['wrong', 'right']),
    );
  }

  if (!isObj(data.istima)) err('istima', 'harus object');

  arr(data.book_structure, 'book_structure').forEach((s, i) => {
    const p = `book_structure[${i}]`;
    if (strFields(s, p, ['section']) && !isStrArr(s.parts)) err(`${p}.parts`, 'harus array string');
  });

  strFields(data.grammar_words, 'grammar_words', ['lawn', 'lawn_stem', 'lawn_meaning', 'mudzakkar', 'muannats']);
  strFields(data.module_titles, 'module_titles', ['mufradat', 'nushush', 'hiwar', 'tarkib', 'latihan', 'istima', 'produksi']);

  if (strFields(data.comprehension, 'comprehension', [])) {
    const nashIds = isObj(data.texts) && Array.isArray(data.texts.nash)
      ? data.texts.nash.filter(isObj).map((n) => n.id)
      : [];
    for (const id of nashIds) {
      if (!isStr(id)) continue;
      arr(data.comprehension[id], `comprehension.${id}`).forEach((q, i) => {
        const p = `comprehension.${id}[${i}]`;
        if (!strFields(q, p, ['q', 'answer', 'why'])) return;
        if (q.options_lang !== 'ar' && q.options_lang !== 'id') err(`${p}.options_lang`, "harus 'ar' atau 'id'");
        if (!isStrArr(q.options) || q.options.length < 2) err(`${p}.options`, 'minimal 2 opsi string');
        else if (isStr(q.answer) && !q.options.includes(q.answer)) err(`${p}.answer`, 'tidak ada di options');
      });
    }
  }

  return errors;
}

/** Soal pemahaman untuk satu nash (kosong kalau belum ada). */
export function comprehensionFor(c: Bab3Content, nashId: string): ComprehensionQuestion[] {
  const qs = c.comprehension[nashId];
  return Array.isArray(qs) ? qs : [];
}

export function parseContent(data: unknown): Bab3Content {
  const errors = validateContent(data);
  if (errors.length > 0) {
    throw new Error(`content/bab3.json tidak valid:\n- ${errors.join('\n- ')}`);
  }
  return data as Bab3Content;
}

export const content: Bab3Content = parseContent(raw);

export const allVocab: Vocab[] = [...content.vocab.sekolah, ...content.vocab.kelas];
