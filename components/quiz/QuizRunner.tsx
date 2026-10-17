'use client';

import { useEffect, useRef, useState } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { MixedText } from '@/components/MixedText';
import { McqView } from '@/components/quiz/McqView';
import { MatchView } from '@/components/quiz/MatchView';
import { QuizFeedback } from '@/components/quiz/QuizFeedback';
import { SentenceBuilder } from '@/components/quiz/SentenceBuilder';
import { correctAnswerText, isCorrect, TYPE_LABELS, type Question, type QuizResult, type UserAnswer } from '@/lib/quiz';

interface QuizRunnerProps {
  questions: Question[];
  /** Bangun ulang soal dari key (untuk "ulangi yang salah"). */
  regenerate: (keys: string[]) => Question[];
  /** Dipanggil tiap putaran selesai; retry = putaran "ulangi yang salah". */
  onComplete?: (results: QuizResult[], meta: { retry: boolean }) => void;
  onNewSession?: () => void;
  newSessionLabel?: string;
}

const needsHarakat = (q: Question) => !q.type.startsWith('vocab');

export function QuizRunner({ questions: initial, regenerate, onComplete, onNewSession, newSessionLabel = 'Sesi baru' }: QuizRunnerProps) {
  const [questions, setQuestions] = useState(initial);
  const [retry, setRetry] = useState(false);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(UserAnswer | null)[]>(() => initial.map(() => null));
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const summaryRef = useRef<HTMLHeadingElement>(null);
  const reported = useRef(false);

  const done = idx >= questions.length;
  const q = questions[idx];
  const answer = q ? answers[idx] : null;
  const revealed = answer !== null;
  const results: QuizResult[] = questions.map((qq, i) => ({
    key: qq.key,
    type: qq.type,
    correct: answers[i] !== null && isCorrect(qq, answers[i]!),
  }));
  const score = results.filter((r) => r.correct).length;

  useEffect(() => {
    if (revealed) nextRef.current?.focus();
  }, [revealed]);

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onComplete?.(results, { retry });
      summaryRef.current?.focus();
    }
  });

  const answerWith = (a: UserAnswer) => {
    setAnswers((prev) => prev.map((x, i) => (i === idx ? a : x)));
  };

  const next = () => {
    setIdx((i) => i + 1);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const restartWith = (qs: Question[], isRetry: boolean) => {
    setQuestions(qs);
    setAnswers(qs.map(() => null));
    setIdx(0);
    setRetry(isRetry);
    reported.current = false;
  };

  if (done) {
    const wrong = questions.filter((_, i) => !results[i].correct);
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-border bg-surface p-5 text-center">
          <h3 ref={summaryRef} tabIndex={-1} className="text-xl font-bold outline-none">
            {retry ? 'Hasil ulangan' : 'Hasil'}: {score}/{questions.length} ({pct}%)
          </h3>
          <p className="mt-1 text-muted">
            {pct === 100 ? 'Sempurna! 🎉' : pct >= 70 ? 'Bagus! Sedikit lagi sempurna.' : 'Ayo coba lagi, pelan-pelan saja.'}
          </p>
        </div>
        {wrong.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Soal yang masih salah</h4>
            <ul className="space-y-3">
              {wrong.map((w) => {
                const right = correctAnswerText(w);
                return (
                  <li key={w.key} className="space-y-1 rounded-xl border border-border bg-surface p-3 text-sm">
                    <p className="text-muted">{TYPE_LABELS[w.type]}</p>
                    {w.kind === 'mcq' &&
                      (w.promptLang === 'ar' ? (
                        <ArabicText as="p" className="text-2xl" showHarakat>
                          {w.prompt}
                        </ArabicText>
                      ) : (
                        <p className="font-semibold">{w.prompt}</p>
                      ))}
                    {w.kind === 'builder' && <p>{w.translation}</p>}
                    {w.kind !== 'match' && (
                      <p>
                        Jawaban:{' '}
                        {right.ar ? (
                          <ArabicText as="bdi" className="text-2xl" showHarakat>
                            {right.text}
                          </ArabicText>
                        ) : (
                          <strong>{right.text}</strong>
                        )}
                      </p>
                    )}
                    <p>
                      <MixedText text={w.explanation} showHarakat />
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {wrong.length > 0 && (
            <button
              type="button"
              onClick={() => restartWith(regenerate(wrong.map((w) => w.key)), true)}
              className="flex-1 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              🔁 Ulangi yang salah ({wrong.length})
            </button>
          )}
          {onNewSession && (
            <button
              type="button"
              onClick={onNewSession}
              className="flex-1 rounded-full border border-border bg-surface px-5 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {newSessionLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  const correct = revealed && isCorrect(q, answer!);
  const forceHarakat = needsHarakat(q) ? true : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 text-sm text-muted">
        <span>
          Soal {idx + 1} dari {questions.length}
        </span>
        <span>{TYPE_LABELS[q.type]}</span>
      </div>
      <div
        role="progressbar"
        aria-label="Kemajuan kuis"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={idx}
        className="h-2 rounded-full bg-border"
      >
        <div className="h-2 rounded-full bg-primary transition-[width]" style={{ width: `${(idx / questions.length) * 100}%` }} />
      </div>
      <h3 ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
        <MixedText text={q.instruction} showHarakat />
      </h3>

      {q.kind === 'mcq' && (
        <McqView
          key={`${retry}-${idx}`}
          question={q}
          chosen={typeof answer === 'string' ? answer : null}
          revealed={revealed}
          onChoose={answerWith}
          forceHarakat={forceHarakat}
        />
      )}
      {q.kind === 'match' && (
        <MatchView
          key={`${retry}-${idx}`}
          question={q}
          revealed={revealed}
          submitted={revealed ? (answer as Record<string, string>) : null}
          onSubmit={answerWith}
        />
      )}
      {q.kind === 'builder' && (
        <SentenceBuilder
          key={`${retry}-${idx}`}
          question={q}
          revealed={revealed}
          submitted={revealed ? (answer as string[]) : null}
          onSubmit={answerWith}
        />
      )}

      {revealed && (
        <>
          <QuizFeedback question={q} correct={correct} />
          <button
            ref={nextRef}
            type="button"
            onClick={next}
            className="w-full rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {idx + 1 < questions.length ? 'Lanjut →' : 'Lihat hasil'}
          </button>
        </>
      )}
    </div>
  );
}
