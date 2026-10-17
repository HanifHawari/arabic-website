'use client';

import { useState } from 'react';
import { useAudio } from '@/hooks/useAudio';

interface AudioButtonProps {
  /** Satu teks, atau beberapa teks yang diputar berurutan. */
  text: string | string[];
  /** Untuk aria-label, mis. arti kata. */
  label: string;
  rate?: number;
  className?: string;
  size?: 'sm' | 'md';
}

/** Tombol 🔊: rekaman guru kalau ada, kalau tidak suara TTS. Nonaktif kalau keduanya tidak ada (pesan di <TtsNotice>). */
export function AudioButton({ text, label, rate = 1, className = '', size = 'md' }: AudioButtonProps) {
  const { canPlay, play } = useAudio();
  const [playing, setPlaying] = useState(false);
  const disabled = !canPlay(text);

  const onClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaying(true);
    await play(text, rate);
    setPlaying(false);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Putar audio: ${label}`}
      title={disabled ? 'Audio belum tersedia di perangkat ini' : `Putar audio: ${label}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface disabled:hover:text-foreground ${
        size === 'sm' ? 'h-9 w-9 text-base' : 'h-11 w-11 text-xl'
      } ${playing ? 'ring-2 ring-primary' : ''} ${className}`}
    >
      <span aria-hidden="true">{playing ? '🔉' : '🔊'}</span>
    </button>
  );
}
