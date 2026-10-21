'use client';

import { useState } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { HiwarBubble } from '@/components/hiwar/HiwarBubble';
import { RolePlay } from '@/components/hiwar/RolePlay';
import { SubstitutionPractice } from '@/components/hiwar/SubstitutionPractice';
import { NextModuleLink } from '@/components/NextModuleLink';
import { PageHero } from '@/components/PageHero';
import { SpeedToggle, type Speed } from '@/components/SpeedToggle';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { TtsNotice } from '@/components/TtsNotice';
import { useModuleVisit, useProgress } from '@/hooks/useProgress';
import { useAudio } from '@/hooks/useAudio';
import { content } from '@/lib/content';
import { isDone } from '@/lib/progress';

const FLAG = 'hiwar:roleplay';

const MODES = [
  { id: 'baca', icon: '📖', title: 'Baca & dengar', sub: 'Simak seluruh dialog' },
  { id: 'roleplay', icon: '🎭', title: 'Role-play', sub: 'Peranmu disembunyikan' },
] as const;

export function HiwarView() {
  useModuleVisit('hiwar');
  const { progress, markDone, setModuleStatus } = useProgress();
  const { canPlay, playAll: playTexts, stop } = useAudio();
  const hiwar = content.texts.hiwar[0];
  const [mode, setMode] = useState<'baca' | 'roleplay'>('baca');
  const [showTr, setShowTr] = useState(true);
  const [rate, setRate] = useState<Speed>(1);
  const [playing, setPlaying] = useState<number | null>(null);

  if (!hiwar) return <p>Belum ada dialog.</p>;
  const speakers = [...new Set(hiwar.lines.map((l) => l.speaker))].slice(0, 2) as [string, string];

  const playAll = async () => {
    if (playing !== null) {
      stop();
      setPlaying(null);
      return;
    }
    setMode('baca');
    setPlaying(0);
    await playTexts(
      hiwar.lines.map((l) => l.ar),
      { rate, onIndex: setPlaying },
    );
    setPlaying(null);
  };

  return (
    <div className="space-y-5">
      <PageHero moduleId="hiwar" title="Hiwar (Dialog)" description={hiwar.title}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={playAll}
            disabled={!hiwar.lines.some((l) => canPlay(l.ar))}
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-900 shadow-sm active:scale-95 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {playing !== null ? '⏹ Berhenti' : '▶ Putar semua'}
          </button>
          <SpeedToggle value={rate} onChange={setRate} />
        </div>
      </PageHero>
      <TtsNotice />

      <section aria-labelledby="mode-h" className="card space-y-3 rounded-3xl p-4">
        <h2 id="mode-h" className="font-display text-lg font-semibold">
          Pilih cara belajar
        </h2>
        <div role="group" aria-label="Mode" className="grid grid-cols-2 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => {
                stop();
                setPlaying(null);
                setMode(m.id);
              }}
              className={`flex flex-col items-start rounded-2xl border-2 px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                mode === m.id ? 'border-primary bg-primary-soft' : 'border-border bg-surface hover:border-primary/40'
              }`}
            >
              <span className="text-sm font-bold">
                {m.icon} {m.title}
              </span>
              <span className="text-xs text-muted">{m.sub}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">
          Tokoh:{' '}
          {speakers.map((s, i) => (
            <span key={s}>
              {i > 0 && ' & '}
              <ArabicText as="bdi" className="text-xl font-bold text-primary">
                {s}
              </ArabicText>
            </span>
          ))}
        </p>
        {isDone(progress, FLAG) && (
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">✓ Kamu sudah menyelesaikan role-play.</p>
        )}
      </section>

      <section aria-labelledby="naskah-h" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 id="naskah-h" className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary" />
            {mode === 'baca' ? 'Naskah percakapan' : 'Role-play'}
          </h2>
          {mode === 'baca' && <ToggleSwitch label="Terjemahan" checked={showTr} onChange={setShowTr} />}
        </div>

        {mode === 'baca' ? (
          <div className="space-y-4">
            {hiwar.lines.map((line, i) => (
              <HiwarBubble
                key={i}
                line={line}
                number={i + 1}
                side={line.speaker === speakers[0] ? 'right' : 'left'}
                showTranslation={showTr}
                highlight={playing === i}
                rate={rate}
              />
            ))}
          </div>
        ) : (
          <RolePlay
            hiwar={hiwar}
            speakers={speakers}
            rate={rate}
            onFinish={() => {
              markDone(FLAG);
              setModuleStatus('hiwar', 'selesai');
            }}
          />
        )}
      </section>

      <SubstitutionPractice hiwar={hiwar} />

      <NextModuleLink href="/tarkib" label="Lanjut ke Tarkib" sub="Kaidah dhamir muttashil & warna" />
    </div>
  );
}
