'use client';

import { useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { MixedText } from '@/components/MixedText';
import { ArabicKeyboard } from '@/components/produksi/ArabicKeyboard';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { useProgress } from '@/hooks/useProgress';
import { removeAl } from '@/lib/arabic';
import { content } from '@/lib/content';
import { backspaceAt, insertAt } from '@/lib/keyboard';
import { checklistItems, MIN_VOCAB, TextChecker, type Draft } from '@/lib/produksi';
import { draftStore } from '@/lib/stores';

const checker = new TextChecker(content);
const CHECKLIST = checklistItems(content);

/** Produksi teks mandiri (F8): editor RTL + keyboard Arab + checklist tashih + saran otomatis. */
export function WritingEditor() {
  const draft = useSyncExternalStore(draftStore.subscribe, draftStore.get, () => draftStore.initial);
  const setDraft = (patch: Partial<Draft>) => draftStore.set((d) => ({ ...d, ...patch }));
  const { setModuleStatus } = useProgress();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [msg, setMsg] = useState('');
  const result = useMemo(() => checker.check(draft.text), [draft.text]);

  const applyEdit = (fn: (text: string, start: number, end: number) => { text: string; caret: number }) => {
    const el = ref.current;
    const start = el?.selectionStart ?? draft.text.length;
    const end = el?.selectionEnd ?? draft.text.length;
    const next = fn(draft.text, start, end);
    setDraft({ text: next.text });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(next.caret, next.caret);
    });
  };

  const markFinished = () => setModuleStatus('produksi', 'selesai');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(draft.text);
      setMsg('Tulisan sudah disalin. Tempel ke WhatsApp/Classroom untuk dikumpulkan ke guru.');
    } catch {
      ref.current?.select();
      setMsg('Tidak bisa menyalin otomatis. Teks sudah diblok, tekan lama lalu pilih "Salin".');
    }
    markFinished();
  };

  const download = () => {
    try {
      const blob = new Blob(['﻿' + draft.text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tulisan-bab3.txt';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMsg('File tulisan-bab3.txt sudah diunduh.');
      markFinished();
    } catch {
      setMsg('Gagal mengunduh file. Coba tombol "Salin".');
    }
  };

  const empty = draft.text.trim().length === 0;

  return (
    <div className="space-y-4">
      <p>
        Tulis paragraf pendek tentang tas, alat sekolah, atau kelasmu: sebutkan bendanya dan warnanya. Tulisanmu tersimpan
        otomatis di perangkat ini.
      </p>
      <label htmlFor="tulisan" className="block font-semibold">
        Tulisanmu
      </label>
      <textarea
        id="tulisan"
        ref={ref}
        dir="rtl"
        lang="ar"
        rows={6}
        value={draft.text}
        onChange={(e) => setDraft({ text: e.target.value })}
        placeholder="Tulis di sini (huruf Arab)…"
        className="font-arabic text-arabic-para w-full rounded-2xl border-2 border-border bg-surface p-3 focus-visible:border-primary focus-visible:outline-none"
      />
      <ToggleSwitch label="Keyboard Arab di layar" checked={showKeyboard} onChange={setShowKeyboard} />
      {showKeyboard && (
        <ArabicKeyboard
          onInsert={(v) => applyEdit((t, s, e) => insertAt(t, s, e, v))}
          onBackspace={() => applyEdit(backspaceAt)}
        />
      )}

      <section aria-labelledby="saran-h" className="space-y-2 rounded-2xl border border-border bg-surface p-4">
        <h2 id="saran-h" className="font-bold">
          🤖 Saran otomatis <span className="text-sm font-normal text-muted">(bukan nilai, cek lagi sendiri ya)</span>
        </h2>
        <p className="text-sm">
          Mufradat Bab 3 yang terpakai: <strong>{result.vocabUsed.length}</strong>/{MIN_VOCAB}{' '}
          {result.vocabUsed.length >= MIN_VOCAB ? '✅' : ''}
        </p>
        {result.vocabUsed.length > 0 && (
          <ArabicText as="p" className="text-xl" showHarakat>
            {result.vocabUsed.join('، ')}
          </ArabicText>
        )}
        {result.alWithDhamir.map((w) => (
          <p key={w} className="rounded-lg bg-notice-bg p-2 text-sm text-notice-fg">
            ⚠️ <MixedText text={`${w} → ${removeAl(w)}`} showHarakat /> — kata yang sudah ber-dhamir tidak pakai alif-lam.
          </p>
        ))}
        {result.lawnFeminine.map((w) => (
          <p key={w} className="rounded-lg bg-notice-bg p-2 text-sm text-notice-fg">
            ⚠️ <MixedText text={w} showHarakat /> — setelah lawn, warna memakai bentuk mudzakkar.
          </p>
        ))}
        {!empty && result.alWithDhamir.length === 0 && result.lawnFeminine.length === 0 && (
          <p className="text-sm text-muted">Belum ada kesalahan umum yang terdeteksi.</p>
        )}
      </section>

      <fieldset className="space-y-2 rounded-2xl border border-border bg-surface p-4">
        <legend className="px-1 font-bold">✅ Checklist tashih (centang sendiri)</legend>
        {CHECKLIST.map((item, i) => (
          <label key={item} className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={draft.checks[i] ?? false}
              onChange={(e) => setDraft({ checks: draft.checks.map((c, j) => (j === i ? e.target.checked : c)) })}
              className="mt-1 h-5 w-5 accent-[var(--primary)]"
            />
            <span>
              <MixedText text={item} />
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          disabled={empty}
          className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          📋 Salin
        </button>
        <button
          type="button"
          onClick={download}
          disabled={empty}
          className="rounded-full border border-border bg-surface px-5 py-2.5 font-semibold disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary"
        >
          ⬇️ Unduh .txt
        </button>
      </div>
      {msg && (
        <p role="status" className="text-sm">
          {msg}
        </p>
      )}
    </div>
  );
}
