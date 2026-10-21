'use client';

import { useState } from 'react';
import { QuizRunner } from '@/components/quiz/QuizRunner';
import type { Question, QuestionType, QuizResult } from '@/lib/quiz';
import { quizGenerator } from '@/lib/quiz-generator';
import { createRng, randomSeed } from '@/lib/rng';

interface MiniQuizProps {
  title: string;
  types: readonly QuestionType[];
  count?: number;
  done: boolean;
  onFinish: (results: QuizResult[]) => void;
}

/** Mini-quiz di akhir kaidah (F5). Soal dibuat saat tombol ditekan (bukan saat render) supaya aman untuk SSG. */
export function MiniQuiz({ title, types, count = 3, done, onFinish }: MiniQuizProps) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [session, setSession] = useState(0);

  const start = () => {
    setQuestions(quizGenerator.buildSession({ types, count, rng: createRng(randomSeed()) }));
    setSession((s) => s + 1);
  };

  return (
    <section className="card space-y-3 rounded-3xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold">📝 {title}</h3>
        {done && <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">✓ Sudah dikerjakan</span>}
      </div>
      {questions ? (
        <QuizRunner
          key={session}
          questions={questions}
          regenerate={(keys) => keys.map((k) => quizGenerator.fromKey(k, createRng(randomSeed()))).filter((q): q is Question => q !== null)}
          onComplete={(results, { retry }) => {
            if (!retry) onFinish(results);
          }}
          onNewSession={start}
          newSessionLabel="Soal baru"
        />
      ) : (
        <button
          type="button"
          onClick={start}
          className="w-full rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground active:scale-[0.98] sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Mulai {count} soal
        </button>
      )}
    </section>
  );
}
