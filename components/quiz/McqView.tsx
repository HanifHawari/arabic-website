'use client';

import { ArabicText } from '@/components/ArabicText';
import type { McqQuestion } from '@/lib/quiz';

interface McqViewProps {
  question: McqQuestion;
  chosen: string | null;
  revealed: boolean;
  onChoose: (value: string) => void;
  /** Paksa harakat tampil (soal kaidah butuh harakat). */
  forceHarakat?: boolean;
}

const LETTERS = 'ABCDEFGH';

export function McqView({ question: q, chosen, revealed, onChoose, forceHarakat }: McqViewProps) {
  const arOptions = q.options.some((o) => o.lang === 'ar');
  return (
    <div className="space-y-4">
      {q.prompt && (
        <div className="rounded-2xl bg-surface-alt px-4 py-4 text-center">
          {q.promptLang === 'ar' ? (
            <ArabicText as="p" size="word" showHarakat={forceHarakat}>
              {q.prompt}
            </ArabicText>
          ) : (
            <p className="font-display text-2xl font-semibold">{q.prompt}</p>
          )}
        </div>
      )}
      <ul className={`grid gap-2 ${arOptions ? 'grid-cols-1 min-[420px]:grid-cols-2' : 'grid-cols-1'}`}>
        {q.options.map((o, i) => {
          const isAnswer = o.value === q.answer;
          const isChosen = o.value === chosen;
          let state = 'border-border bg-surface hover:border-primary/60';
          let badge = 'bg-primary-soft text-primary';
          if (revealed && isAnswer) {
            state = 'border-emerald-600 bg-emerald-600/10';
            badge = 'bg-emerald-600 text-white';
          } else if (revealed && isChosen) {
            state = 'border-red-600 bg-red-600/10';
            badge = 'bg-red-600 text-white';
          } else if (revealed) state = 'border-border bg-surface opacity-60';
          return (
            <li key={o.value}>
              <button
                type="button"
                disabled={revealed}
                aria-pressed={isChosen}
                onClick={() => onChoose(o.value)}
                className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border-2 px-3 py-2 font-medium shadow-sm transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default ${state}`}
              >
                <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badge}`}>
                  {LETTERS[i]}
                </span>
                <span className="flex-1 text-center">
                  {o.lang === 'ar' ? (
                    <ArabicText size="word" showHarakat={forceHarakat}>
                      {o.label}
                    </ArabicText>
                  ) : (
                    <span className="text-lg">{o.label}</span>
                  )}
                </span>
                <span className="w-6 shrink-0 text-center text-lg">
                  {revealed && isAnswer && <span aria-label="jawaban benar">✓</span>}
                  {revealed && isChosen && !isAnswer && <span aria-label="pilihanmu, salah">✗</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
