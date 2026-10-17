'use client';

import { useState } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { HiwarBubble } from '@/components/hiwar/HiwarBubble';
import { useArrowHandler } from '@/hooks/useArrowNav';
import { useAudio } from '@/hooks/useAudio';
import type { Hiwar } from '@/types/content';

interface RolePlayProps {
  hiwar: Hiwar;
  speakers: [string, string];
  rate: number;
  onFinish: () => void;
}

/** Role-play (F4): baris tokoh pilihan user disembunyikan; user membaca keras lalu lanjut. */
export function RolePlay({ hiwar, speakers, rate, onFinish }: RolePlayProps) {
  const { canPlay, play } = useAudio();
  const [role, setRole] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [peek, setPeek] = useState(false);
  const lines = hiwar.lines;
  const finished = role !== null && idx >= lines.length;

  const goTo = (next: number) => {
    setIdx(next);
    setPeek(false);
    if (next >= lines.length) {
      onFinish();
      return;
    }
    // Baris lawan bicara dibacakan otomatis (dipanggil dari klik, jadi aman untuk autoplay).
    if (role && lines[next].speaker !== role && canPlay(lines[next].ar)) void play(lines[next].ar, rate);
  };

  useArrowHandler((dir) => {
    if (!role || finished) return false;
    if (dir === 1) goTo(idx + 1);
    else if (idx > 0) goTo(idx - 1);
    return true;
  }, role !== null);

  if (!role) {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <p className="font-semibold">Kamu mau jadi siapa?</p>
        <div className="flex flex-wrap gap-2">
          {speakers.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setRole(s);
                setIdx(0);
                if (lines[0].speaker !== s && canPlay(lines[0].ar)) void play(lines[0].ar, rate);
              }}
              className="rounded-full border-2 border-primary px-5 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ArabicText className="text-2xl">{s}</ArabicText>
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">
          Kalimat tokohmu akan disembunyikan. Baca dengan suara keras, lalu tekan &quot;Lanjut&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm">
        Kamu berperan sebagai <ArabicText as="bdi" className="text-xl font-bold">{role}</ArabicText>
      </p>
      <div className="space-y-3" aria-live="polite">
        {lines.slice(0, Math.min(idx + 1, lines.length)).map((line, i) => {
          const mine = line.speaker === role;
          const current = i === idx;
          const side = line.speaker === speakers[0] ? 'right' : 'left';
          if (mine && current && !peek) {
            return (
              <div key={i} className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] space-y-2 rounded-2xl border-2 border-dashed border-primary bg-surface px-4 py-3">
                  <p className="font-semibold">🎤 Giliranmu! Ucapkan kalimatnya dengan keras.</p>
                  <p className="text-sm text-muted">Petunjuk: &quot;{line.translation}&quot;</p>
                  <button
                    type="button"
                    onClick={() => setPeek(true)}
                    className="rounded-full border border-border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    👀 Intip kalimat
                  </button>
                </div>
              </div>
            );
          }
          return <HiwarBubble key={i} line={line} side={side} showTranslation={false} highlight={current} rate={rate} />;
        })}
      </div>

      {finished ? (
        <div className="space-y-2 rounded-2xl border-2 border-emerald-600 bg-emerald-600/10 p-4 text-center">
          <p className="font-bold">🎉 Role-play selesai!</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => goTo(0)}
              className="rounded-full border border-border bg-surface px-4 py-2 focus-visible:outline-2 focus-visible:outline-primary"
            >
              Ulangi
            </button>
            <button
              type="button"
              onClick={() => {
                setRole(null);
                setIdx(0);
              }}
              className="rounded-full border border-border bg-surface px-4 py-2 focus-visible:outline-2 focus-visible:outline-primary"
            >
              Tukar peran
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={idx === 0}
            onClick={() => goTo(idx - 1)}
            className="rounded-full border border-border px-4 py-3 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => goTo(idx + 1)}
            className="flex-1 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Lanjut → ({Math.min(idx + 1, lines.length)}/{lines.length})
          </button>
        </div>
      )}
    </div>
  );
}
