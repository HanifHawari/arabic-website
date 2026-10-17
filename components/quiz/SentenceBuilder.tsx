'use client';

import { useState } from 'react';
import { ArabicText } from '@/components/ArabicText';
import type { BuilderQuestion } from '@/lib/quiz';

interface SentenceBuilderProps {
  question: BuilderQuestion;
  revealed: boolean;
  onSubmit: (order: string[]) => void;
  submitted: string[] | null;
}

/** Susun kalimat: ketuk kata untuk memindahkannya ke baris jawaban (RTL); ketuk lagi untuk mengembalikan. */
export function SentenceBuilder({ question: q, revealed, onSubmit, submitted }: SentenceBuilderProps) {
  const [order, setOrder] = useState<string[]>([]);
  const shown = submitted ?? order;
  const textOf = (id: string) => q.tokens.find((t) => t.id === id)?.text ?? '';
  const remaining = q.tokens.filter((t) => !shown.includes(t.id));

  const chip =
    'min-h-12 rounded-xl border-2 bg-surface px-3 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default';

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">Arti: {q.translation}</p>
      <div
        dir="rtl"
        lang="ar"
        aria-label="Baris jawaban"
        className="flex min-h-20 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background p-3"
      >
        {shown.length === 0 && (
          <span dir="ltr" lang="id" className="text-sm text-muted">
            Ketuk kata di bawah untuk mulai menyusun (dari kanan).
          </span>
        )}
        {shown.map((id) => (
          <button
            key={id}
            type="button"
            disabled={revealed}
            onClick={() => setOrder(order.filter((x) => x !== id))}
            aria-label={`Hapus kata ${textOf(id)} dari jawaban`}
            className={`${chip} border-primary`}
          >
            <ArabicText size="word" showHarakat>
              {textOf(id)}
            </ArabicText>
          </button>
        ))}
      </div>
      {!revealed && (
        <div dir="rtl" lang="ar" aria-label="Pilihan kata" className="flex flex-wrap gap-2">
          {remaining.map((t) => (
            <button key={t.id} type="button" onClick={() => setOrder([...order, t.id])} className={`${chip} border-border`}>
              <ArabicText size="word" showHarakat>
                {t.text}
              </ArabicText>
            </button>
          ))}
        </div>
      )}
      {!revealed && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOrder([])}
            disabled={order.length === 0}
            className="rounded-full border border-border px-4 py-3 font-medium disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary"
          >
            Ulang
          </button>
          <button
            type="button"
            disabled={order.length !== q.tokens.length}
            onClick={() => onSubmit(order)}
            className="flex-1 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Periksa
          </button>
        </div>
      )}
    </div>
  );
}
