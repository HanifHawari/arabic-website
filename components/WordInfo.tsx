'use client';

import { ArabicText } from '@/components/ArabicText';
import { AudioButton } from '@/components/AudioButton';
import { GenderBadge } from '@/components/GenderBadge';
import { MixedText } from '@/components/MixedText';
import type { LookupEntry } from '@/lib/lookup';

interface WordInfoProps {
  word: string;
  entry: LookupEntry;
  onClose: () => void;
}

/** Panel arti kata yang diklik di teks (pengganti popover, ramah layar sempit & pembaca layar). */
export function WordInfo({ word, entry, onClose }: WordInfoProps) {
  return (
    <div role="dialog" aria-label={`Arti kata: ${entry.meaning}`} className="mt-2 space-y-2 rounded-xl border-2 border-primary/50 bg-surface p-3 shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-3">
          <ArabicText className="text-3xl font-bold">{word}</ArabicText>
          {word !== entry.ar && (
            <span className="text-sm text-muted">
              bentuk dasar: <ArabicText as="bdi" className="text-2xl text-foreground">{entry.ar}</ArabicText>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup arti kata"
          autoFocus
          className="rounded-full px-2 py-1 text-lg leading-none text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
        >
          ✕
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-lg font-semibold">{entry.meaning}</span>
        {entry.kind === 'vocab' && entry.gender && <GenderBadge gender={entry.gender} />}
        <AudioButton text={entry.ar} label={entry.meaning} size="sm" />
      </div>
      {entry.note && (
        <p className="text-xs text-muted">
          Catatan: <MixedText text={entry.note} />
        </p>
      )}
    </div>
  );
}
