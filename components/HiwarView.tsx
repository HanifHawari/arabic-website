'use client';

import { useState } from 'react';
import { HiwarBubble } from '@/components/hiwar/HiwarBubble';
import { RolePlay } from '@/components/hiwar/RolePlay';
import { SubstitutionPractice } from '@/components/hiwar/SubstitutionPractice';
import { SpeedToggle, type Speed } from '@/components/SpeedToggle';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { TtsNotice } from '@/components/TtsNotice';
import { useModuleVisit, useProgress } from '@/hooks/useProgress';
import { useAudio } from '@/hooks/useAudio';
import { content } from '@/lib/content';
import { isDone } from '@/lib/progress';

const FLAG = 'hiwar:roleplay';

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
    setPlaying(0);
    await playTexts(
      hiwar.lines.map((l) => l.ar),
      { rate, onIndex: setPlaying },
    );
    setPlaying(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Hiwar (Dialog)</h1>
        <p className="text-muted">{hiwar.title}</p>
      </div>
      <TtsNotice />
      <div role="group" aria-label="Mode" className="inline-flex rounded-full border border-border bg-surface p-0.5">
        {(['baca', 'roleplay'] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => {
              stop();
              setPlaying(null);
              setMode(m);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary ${
              mode === m ? 'bg-primary text-primary-foreground' : 'text-muted'
            }`}
          >
            {m === 'baca' ? '📖 Baca & dengar' : '🎭 Role-play'}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {mode === 'baca' && (
          <button
            type="button"
            onClick={playAll}
            disabled={!hiwar.lines.some((l) => canPlay(l.ar))}
            className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {playing !== null ? '⏹ Berhenti' : '▶ Putar semua'}
          </button>
        )}
        <SpeedToggle value={rate} onChange={setRate} />
        {mode === 'baca' && <ToggleSwitch label="Terjemahan" checked={showTr} onChange={setShowTr} />}
      </div>

      {mode === 'baca' ? (
        <div className="space-y-3">
          {hiwar.lines.map((line, i) => (
            <HiwarBubble
              key={i}
              line={line}
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
      {isDone(progress, FLAG) && mode === 'baca' && (
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">✓ Kamu sudah menyelesaikan role-play.</p>
      )}

      <SubstitutionPractice hiwar={hiwar} />
    </div>
  );
}
