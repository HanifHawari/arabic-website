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

export function McqView({ question: q, chosen, revealed, onChoose, forceHarakat }: McqViewProps) {
  const arOptions = q.options.some((o) => o.lang === 'ar');
  return (
    <div className="space-y-5">
      {q.prompt && (
        <div className="rounded-2xl border border-border bg-background px-4 py-5 text-center">
          {q.promptLang === 'ar' ? (
            <ArabicText as="p" size="word" showHarakat={forceHarakat}>
              {q.prompt}
            </ArabicText>
          ) : (
            <p className="text-2xl font-semibold">{q.prompt}</p>
          )}
        </div>
      )}
      <ul className={`grid gap-2 ${arOptions ? 'grid-cols-1 min-[420px]:grid-cols-2' : 'grid-cols-1'}`}>
        {q.options.map((o) => {
          const isAnswer = o.value === q.answer;
          const isChosen = o.value === chosen;
          let state = 'border-border bg-surface hover:border-primary';
          if (revealed && isAnswer) state = 'border-emerald-600 bg-emerald-600/10';
          else if (revealed && isChosen) state = 'border-red-600 bg-red-600/10';
          else if (revealed) state = 'border-border bg-surface opacity-60';
          return (
            <li key={o.value}>
              <button
                type="button"
                disabled={revealed}
                aria-pressed={isChosen}
                onClick={() => onChoose(o.value)}
                className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-center font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default ${state}`}
              >
                {revealed && isAnswer && <span aria-label="jawaban benar">✓</span>}
                {revealed && isChosen && !isAnswer && <span aria-label="pilihanmu, salah">✗</span>}
                {o.lang === 'ar' ? (
                  <ArabicText size="word" showHarakat={forceHarakat}>
                    {o.label}
                  </ArabicText>
                ) : (
                  <span className="text-lg">{o.label}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
