'use client';

import { useState } from 'react';
import { QuizRunner } from '@/components/quiz/QuizRunner';
import { useModuleVisit, useProgress } from '@/hooks/useProgress';
import { FOCUS_OPTIONS, typesForFocus, type Focus, type Question, type QuizResult } from '@/lib/quiz';
import { QuizGenerator, quizGenerator } from '@/lib/quiz-generator';
import { createRng, randomSeed } from '@/lib/rng';

const SESSION_SIZE = 10;
const scoreKey = (f: Focus) => `latihan:${f}`;

export function LatihanView() {
  useModuleVisit('latihan');
  const { progress, recordScore, updateReview, setModuleStatus } = useProgress();
  const [focus, setFocus] = useState<Focus>('campur');
  const [session, setSession] = useState<{ id: number; questions: Question[] } | null>(null);

  const reviewInFocus = progress.review.filter((k) => {
    const t = QuizGenerator.typeOfKey(k);
    return t !== null && typesForFocus(focus).includes(t);
  }).length;

  const start = () => {
    const questions = quizGenerator.buildSession({
      types: typesForFocus(focus),
      count: SESSION_SIZE,
      rng: createRng(randomSeed()),
      reviewKeys: progress.review,
    });
    setSession((s) => ({ id: (s?.id ?? 0) + 1, questions }));
  };

  const onComplete = (results: QuizResult[], { retry }: { retry: boolean }) => {
    updateReview(results);
    if (retry) return;
    recordScore(scoreKey(focus), (results.filter((r) => r.correct).length / results.length) * 100);
    setModuleStatus('latihan', 'selesai');
  };

  if (session) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Latihan: {FOCUS_OPTIONS.find((f) => f.id === focus)?.label}</h1>
          <button
            type="button"
            onClick={() => setSession(null)}
            className="rounded-full border border-border px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-primary"
          >
            ✕ Berhenti
          </button>
        </div>
        <h2 className="sr-only">Soal latihan</h2>
        <QuizRunner
          key={session.id}
          questions={session.questions}
          regenerate={(keys) => keys.map((k) => quizGenerator.fromKey(k, createRng(randomSeed()))).filter((q): q is Question => q !== null)}
          onComplete={onComplete}
          onNewSession={() => setSession(null)}
          newSessionLabel="Pilih latihan lain"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Latihan</h1>
        <p className="text-muted">
          {SESSION_SIZE} soal acak dengan feedback langsung. Soal yang salah akan muncul lagi di sesi berikutnya.
        </p>
      </div>
      <fieldset className="space-y-2">
        <legend className="mb-2 font-semibold">Pilih fokus latihan</legend>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
          {FOCUS_OPTIONS.map((f) => {
            const best = progress.bestScores[scoreKey(f.id)];
            const selected = focus === f.id;
            return (
              <label
                key={f.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 bg-surface p-4 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
                  selected ? 'border-primary' : 'border-border'
                }`}
              >
                <input
                  type="radio"
                  name="focus"
                  value={f.id}
                  checked={selected}
                  onChange={() => setFocus(f.id)}
                  className="h-5 w-5 accent-[var(--primary)]"
                />
                <span className="flex-1">
                  <span className="block font-semibold">{f.label}</span>
                  <span className="block text-sm text-muted">
                    {best === undefined ? 'Belum pernah' : `Skor terbaik: ${best}%`}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {reviewInFocus > 0 && (
        <p className="rounded-xl bg-notice-bg p-3 text-sm text-notice-fg">
          🔁 Ada {reviewInFocus} soal yang dulu salah. Sebagian akan muncul lagi di sesi ini.
        </p>
      )}
      <button
        type="button"
        onClick={start}
        className="w-full rounded-full bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto"
      >
        Mulai {SESSION_SIZE} soal →
      </button>
    </div>
  );
}
