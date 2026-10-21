'use client';

import { useState } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { ColorSwatch } from '@/components/ColorSwatch';
import { Illustration } from '@/components/Illustration';
import { MixedText } from '@/components/MixedText';
import { SpeedToggle, type Speed } from '@/components/SpeedToggle';
import { useAudio } from '@/hooks/useAudio';
import { content } from '@/lib/content';
import { makeRounds, type IstimaRound, type TadribId } from '@/lib/istima';
import { createRng, randomSeed } from '@/lib/rng';

interface TadribPlayerProps {
  id: TadribId;
  desc: string;
  done: boolean;
  onFinish: (score: number, total: number) => void;
}

export function TadribPlayer({ id, desc, done, onFinish }: TadribPlayerProps) {
  const { canPlay, play: playText } = useAudio();
  const [rounds, setRounds] = useState<IstimaRound[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [rate, setRate] = useState<Speed>(1);
  const [showText, setShowText] = useState(false);

  const play = (r: IstimaRound | undefined) => {
    if (r && canPlay(r.speak)) void playText(r.speak, rate);
  };

  const start = () => {
    const rs = makeRounds(content, id, createRng(randomSeed()));
    setRounds(rs);
    setIdx(0);
    setChosen(null);
    setScore(0);
    setShowText(false);
    play(rs[0]);
  };

  if (!rounds) {
    return (
      <div className="space-y-3">
        <p>{desc}</p>
        {done && <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">✓ Sudah dikerjakan</p>}
        <button
          type="button"
          onClick={start}
          className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          ▶ Mulai
        </button>
      </div>
    );
  }

  if (idx >= rounds.length) {
    return (
      <div className="space-y-3 card rounded-2xl p-4 text-center">
        <p className="text-xl font-bold">
          Skor: {score}/{rounds.length}
        </p>
        <button
          type="button"
          onClick={start}
          className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Main lagi
        </button>
      </div>
    );
  }

  const r = rounds[idx];
  const revealed = chosen !== null;
  const correct = chosen === r.answer;

  const choose = (value: string) => {
    if (revealed) return;
    setChosen(value);
    if (value === r.answer) setScore((s) => s + 1);
  };

  const next = () => {
    const n = idx + 1;
    setIdx(n);
    setChosen(null);
    setShowText(false);
    if (n >= rounds.length) onFinish(score, rounds.length);
    else play(rounds[n]);
  };

  // Tanpa audio (tidak ada rekaman & TTS Arab): teks tadrib 1–3 ditampilkan langsung (fallback);
  // tadrib 4 lewat tombol supaya tidak membocorkan jawaban.
  const noVoice = !canPlay(r.speak);
  const textVisible = revealed || showText || (noVoice && id !== 't4');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <span>
          Ronde {idx + 1} dari {rounds.length}
        </span>
        <span>Skor {score}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => play(r)}
          disabled={noVoice}
          aria-label="Putar ulang audio"
          className="rounded-full bg-primary px-5 py-3 text-lg font-semibold text-primary-foreground disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          🔊 Putar ulang
        </button>
        <SpeedToggle value={rate} onChange={setRate} />
        {noVoice && id === 't4' && !textVisible && (
          <button
            type="button"
            onClick={() => setShowText(true)}
            className="rounded-full border border-border px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary"
          >
            Tampilkan teks
          </button>
        )}
      </div>

      {textVisible && (
        <div className="rounded-xl border border-border bg-background p-3">
          <p className="text-xs text-muted">{revealed ? 'Yang dibacakan:' : 'Teks (audio tidak tersedia):'}</p>
          <ArabicText as="p" size="para" showHarakat>
            {r.speak}
          </ArabicText>
        </div>
      )}
      {r.prompt && (
        <div className="rounded-xl border border-border bg-surface p-3 text-center">
          <ArabicText as="p" size="para" showHarakat>
            {r.prompt}
          </ArabicText>
        </div>
      )}

      <ul className={`grid gap-2 ${id === 't1' ? 'grid-cols-3' : id === 't2' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {r.options.map((o) => {
          const isAns = o.value === r.answer;
          const isChosen = o.value === chosen;
          const state = revealed
            ? isAns
              ? 'border-emerald-600 bg-emerald-600/10'
              : isChosen
                ? 'border-red-600 bg-red-600/10'
                : 'border-border opacity-60'
            : 'border-border hover:border-primary';
          return (
            <li key={o.value}>
              <button
                type="button"
                disabled={revealed}
                onClick={() => choose(o.value)}
                aria-label={o.hex ? o.label : undefined}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 bg-surface p-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${state}`}
              >
                {o.hex && <ColorSwatch hex={o.hex} className="h-14 w-full" />}
                {o.vocabId && <Illustration vocabId={o.vocabId} />}
                {o.hex ? (
                  revealed && <span className="text-sm">{o.label}</span>
                ) : o.lang === 'ar' ? (
                  <ArabicText size="word" showHarakat>
                    {o.label}
                  </ArabicText>
                ) : (
                  <span>{o.label}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {revealed && (
        <div className="space-y-3">
          <p
            role="status"
            className={`rounded-xl border-2 p-3 ${correct ? 'border-emerald-600 bg-emerald-600/10' : 'border-red-600 bg-red-600/10'}`}
          >
            <span className="font-bold">{correct ? '✅ Benar!' : '❌ Belum tepat.'}</span>{' '}
            <MixedText text={r.explanation} showHarakat />
          </p>
          <button
            type="button"
            autoFocus
            onClick={next}
            className="w-full rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {idx + 1 < rounds.length ? 'Lanjut →' : 'Lihat skor'}
          </button>
        </div>
      )}
    </div>
  );
}
