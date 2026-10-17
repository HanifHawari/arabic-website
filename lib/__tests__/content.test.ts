import { describe, expect, it } from 'vitest';
import raw from '@/content/bab3.json';
import { allVocab, content, parseContent, validateContent } from '@/lib/content';
import { sameArabic } from '@/lib/arabic';

const clone = <T>(x: T): T => structuredClone(x);

describe('content/bab3.json', () => {
  it('valid menurut validator', () => {
    expect(validateContent(raw)).toEqual([]);
  });

  it('berisi 45 kosakata (15 alat sekolah + 30 perangkat kelas), 12 warna, 6 dhamir', () => {
    expect(content.vocab.sekolah).toHaveLength(15);
    expect(content.vocab.kelas).toHaveLength(30);
    expect(allVocab).toHaveLength(45);
    expect(content.colors).toHaveLength(12);
    expect(content.pronouns).toHaveLength(6);
  });

  it('stem = kata tanpa tanwin untuk semua vocab attachable', () => {
    for (const v of allVocab.filter((x) => x.attachable)) {
      const withoutTanwin = v.ar.replace(/[ً-ٍ]/g, '');
      expect(sameArabic(withoutTanwin, v.stem!), `${v.id}: ${v.ar} vs ${v.stem}`).toBe(true);
    }
  });
});

describe('validateContent menolak data rusak', () => {
  it('root bukan object', () => {
    expect(validateContent(null)).toEqual(['root: harus object']);
    expect(() => parseContent([])).toThrow(/tidak valid/);
  });

  it('gender tidak valid', () => {
    const d = clone(raw) as unknown as { vocab: { sekolah: Record<string, unknown>[] } };
    d.vocab.sekolah[0].gender = 'x';
    expect(validateContent(d)).toContain("vocab.sekolah[0].gender: harus 'm' atau 'f'");
  });

  it('attachable:true tanpa stem', () => {
    const d = clone(raw) as unknown as { vocab: { kelas: Record<string, unknown>[] } };
    d.vocab.kelas[0].stem = null;
    expect(validateContent(d)).toContain('vocab.kelas[0].stem: attachable:true butuh stem');
  });

  it('id vocab duplikat', () => {
    const d = clone(raw) as unknown as { vocab: { sekolah: Record<string, unknown>[] } };
    d.vocab.sekolah[1].id = d.vocab.sekolah[0].id;
    expect(validateContent(d).some((e) => e.includes('id duplikat'))).toBe(true);
  });

  it('jawaban quiz tidak ada di opsi', () => {
    const d = clone(raw) as unknown as { quiz_bank: { lawn_pronoun: Record<string, unknown>[] } };
    d.quiz_bank.lawn_pronoun[0].answer = 'xxx';
    expect(validateContent(d)).toContain('quiz_bank.lawn_pronoun[0].answer: tidak ada di options');
  });

  it('hex warna salah format', () => {
    const d = clone(raw) as unknown as { colors: Record<string, unknown>[] };
    d.colors[0].hex = 'red';
    expect(validateContent(d)).toContain('colors[0].hex: harus format #RRGGBB');
  });
});
