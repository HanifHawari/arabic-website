'use client';

import { useState } from 'react';
import { NextModuleLink } from '@/components/NextModuleLink';
import { PageHero } from '@/components/PageHero';
import { QuizRunner } from '@/components/quiz/QuizRunner';
import { useModuleVisit, useProgress } from '@/hooks/useProgress';
import { FOCUS_OPTIONS, typesForFocus, type Focus, type Question, type QuizResult } from '@/lib/quiz';
import { QuizGenerator, quizGenerator } from '@/lib/quiz-generator';
import { createRng, randomSeed } from '@/lib/rng';

const SESSION_SIZE = 10;
const scoreKey = (f: Focus) => `latihan:${f}`;
const FOCUS_ICONS: Record<Focus, string> = { campur: '🎲', mufradat: '🗂️', warna: '🎨', dhamir: '🧩' };

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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSession(null)}
            aria-label="Berhenti latihan"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-alt text-lg focus-visible:outline-2 focus-visible:outline-primary"
          >
            ←
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-wider text-accent-strong uppercase">Sesi latihan</p>
            <h1 className="truncate text-xl font-bold text-primary">{FOCUS_OPTIONS.find((f) => f.id === focus)?.label}</h1>
          </div>
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
      <PageHero
        moduleId="latihan"
        title="Latihan"
        description={`${SESSION_SIZE} soal acak dengan feedback langsung. Soal yang salah akan muncul lagi di sesi berikutnya.`}
      />
      <fieldset className="space-y-2">
        <legend className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-primary">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary" />
          Pilih fokus latihan
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {FOCUS_OPTIONS.map((f) => {
            const best = progress.bestScores[scoreKey(f.id)];
            const selected = focus === f.id;
            return (
              <label
                key={f.id}
                className={`relative flex cursor-pointer flex-col gap-1 rounded-2xl border-2 p-3 shadow-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${
                  selected ? 'border-primary bg-primary-soft' : 'border-border bg-surface'
                }`}
              >
                <span aria-hidden="true" className="text-2xl">
                  {FOCUS_ICONS[f.id]}
                </span>
                <input
                  type="radio"
                  name="focus"
                  value={f.id}
                  checked={selected}
                  onChange={() => setFocus(f.id)}
                  className="absolute top-3 right-3 h-5 w-5 accent-[var(--primary)]"
                />
                <span>
                  <span className="block font-semibold">{f.label}</span>
                  <span className="block text-xs text-muted">
                    {best === undefined ? 'Belum pernah' : `Skor terbaik: ${best}%`}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {reviewInFocus > 0 && (
        <p className="rounded-2xl bg-notice-bg p-3 text-sm text-notice-fg">
          🔁 Ada {reviewInFocus} soal yang dulu salah. Sebagian akan muncul lagi di sesi ini.
        </p>
      )}
      <button
        type="button"
        onClick={start}
        className="w-full rounded-2xl bg-primary px-6 py-4 text-lg font-bold text-primary-foreground shadow-md active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Mulai {SESSION_SIZE} soal →
      </button>
      <NextModuleLink href="/istima" label="Lanjut ke Istima'" sub="Latihan menyimak dengan audio" />
    </div>
  );
}
