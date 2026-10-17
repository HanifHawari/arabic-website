'use client';

import { useEffect, useState } from 'react';
import { NashReader } from '@/components/NashReader';
import { QuizRunner } from '@/components/quiz/QuizRunner';
import { Tabs } from '@/components/Tabs';
import { useModuleVisit, useProgress } from '@/hooks/useProgress';
import { comprehensionFor, content } from '@/lib/content';
import { isDone } from '@/lib/progress';
import { fromComprehension, type Question } from '@/lib/quiz';
import { createRng, randomSeed, shuffle } from '@/lib/rng';

const TABS = content.texts.nash.map((n, i) => ({ id: n.id, label: `Teks ${i + 1}: ${n.title}` }));
const flag = (id: string) => `nushush:${id}`;

function questionsFor(nashId: string): Question[] {
  return comprehensionFor(content, nashId).map((cq, i) => {
    const q = fromComprehension(nashId, i, cq);
    return { ...q, options: shuffle(q.options, createRng(randomSeed())) };
  });
}

export function NushushView() {
  useModuleVisit('nushush');
  const { progress, markDone, setModuleStatus } = useProgress();
  const [tab, setTab] = useState(TABS[0]?.id ?? '');
  const [quiz, setQuiz] = useState<{ id: number; questions: Question[] } | null>(null);
  const nash = content.texts.nash.find((n) => n.id === tab);
  const allDone = content.texts.nash.every((n) => isDone(progress, flag(n.id)));

  useEffect(() => {
    if (allDone) setModuleStatus('nushush', 'selesai');
  }, [allDone, setModuleStatus]);

  if (!nash) return null;
  const regenerate = (keys: string[]) => questionsFor(nash.id).filter((q) => keys.includes(q.key));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Nushush (Teks Bacaan)</h1>
      <Tabs
        tabs={TABS}
        value={tab}
        onChange={(t) => {
          setTab(t);
          setQuiz(null);
        }}
        label="Pilih teks"
        idPrefix="nushush"
      />
      <div id="nushush-panel" role="tabpanel" aria-labelledby={`nushush-tab-${tab}`} className="space-y-6">
        <NashReader key={nash.id} nash={nash} />

        <section className="space-y-3 rounded-2xl border-2 border-primary/30 bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Soal pemahaman</h2>
            {isDone(progress, flag(nash.id)) && (
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">✓ Sudah dikerjakan</span>
            )}
          </div>
          {quiz ? (
            <QuizRunner
              key={quiz.id}
              questions={quiz.questions}
              regenerate={regenerate}
              onComplete={(_, { retry }) => {
                if (!retry) markDone(flag(nash.id));
              }}
              onNewSession={() => setQuiz(null)}
              newSessionLabel="Selesai"
            />
          ) : (
            <button
              type="button"
              onClick={() => setQuiz({ id: Date.now(), questions: questionsFor(nash.id) })}
              className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Kerjakan {comprehensionFor(content, nash.id).length} soal
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
