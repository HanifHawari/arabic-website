'use client';

import { useState } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { ColorSwatch } from '@/components/ColorSwatch';
import type { MatchQuestion } from '@/lib/quiz';

interface MatchViewProps {
  question: MatchQuestion;
  revealed: boolean;
  onSubmit: (pairs: Record<string, string>) => void;
  submitted: Record<string, string> | null;
}

/** Jodohkan: pilih swatch, lalu pilih kata warnanya. */
export function MatchView({ question: q, revealed, onSubmit, submitted }: MatchViewProps) {
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [active, setActive] = useState<string | null>(q.left[0]?.id ?? null);
  const shown = submitted ?? pairs;

  const numberOf = (leftId: string) => q.left.findIndex((l) => l.id === leftId) + 1;
  const leftFor = (rightValue: string) => Object.keys(shown).find((k) => shown[k] === rightValue);

  const choose = (rightValue: string) => {
    if (!active || revealed) return;
    const next = { ...pairs };
    for (const k of Object.keys(next)) if (next[k] === rightValue) delete next[k];
    next[active] = rightValue;
    setPairs(next);
    const unpaired = q.left.find((l) => !next[l.id]);
    setActive(unpaired?.id ?? null);
  };

  const complete = q.left.every((l) => pairs[l.id]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Ketuk satu warna, lalu ketuk kata Arabnya.</p>
      <div className="grid grid-cols-2 gap-3">
        <ul className="space-y-2" aria-label="Warna">
          {q.left.map((l, i) => {
            const paired = shown[l.id];
            const ok = revealed && paired === l.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  disabled={revealed}
                  aria-pressed={active === l.id}
                  aria-label={`${l.label}${paired ? ', sudah dipasangkan' : ''}`}
                  onClick={() => setActive(l.id)}
                  className={`flex min-h-16 w-full items-center gap-2 rounded-xl border-2 p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    revealed ? (ok ? 'border-emerald-600' : 'border-red-600') : active === l.id ? 'border-primary' : 'border-border'
                  } bg-surface`}
                >
                  <span className="w-5 text-center text-sm font-bold">{i + 1}</span>
                  <ColorSwatch hex={l.hex} className="h-10 w-10" />
                  {revealed && <span aria-hidden="true">{ok ? '✓' : '✗'}</span>}
                </button>
              </li>
            );
          })}
        </ul>
        <ul className="space-y-2" aria-label="Kata warna">
          {q.right.map((r) => {
            const left = leftFor(r.value);
            return (
              <li key={r.value}>
                <button
                  type="button"
                  disabled={revealed}
                  onClick={() => choose(r.value)}
                  aria-label={`${r.label}${left ? `, dipasangkan dengan warna ${numberOf(left)}` : ''}`}
                  className="flex min-h-16 w-full items-center justify-between gap-2 rounded-xl border-2 border-border bg-surface px-3 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span className="w-5 text-sm font-bold text-primary">{left ? numberOf(left) : ''}</span>
                  <ArabicText size="word">{r.label}</ArabicText>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {!revealed && (
        <button
          type="button"
          disabled={!complete}
          onClick={() => onSubmit(pairs)}
          className="w-full rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Periksa
        </button>
      )}
    </div>
  );
}
