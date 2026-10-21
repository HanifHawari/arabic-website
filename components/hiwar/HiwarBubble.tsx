'use client';

import { ArabicText } from '@/components/ArabicText';
import { AudioButton } from '@/components/AudioButton';
import type { HiwarLine } from '@/types/content';

interface HiwarBubbleProps {
  line: HiwarLine;
  /** Tokoh pertama di kanan (arah baca Arab), tokoh kedua di kiri. */
  side: 'right' | 'left';
  showTranslation: boolean;
  highlight?: boolean;
  rate?: number;
  /** Nomor baris (1-based) untuk label kecil di atas bubble. */
  number?: number;
}

export function HiwarBubble({ line, side, showTranslation, highlight = false, rate = 1, number }: HiwarBubbleProps) {
  const right = side === 'right';
  return (
    <div className={`flex flex-col ${right ? 'items-end' : 'items-start'}`}>
      <div className={`mb-1 flex items-center gap-2 px-1 text-xs text-muted ${right ? 'flex-row-reverse' : ''}`}>
        {number !== undefined && <span className="font-bold tabular-nums">{String(number).padStart(2, '0')}</span>}
        <ArabicText className="text-lg leading-[1.9] font-bold text-primary">{line.speaker}</ArabicText>
      </div>
      <div
        className={`flex max-w-[88%] gap-3 rounded-3xl px-4 py-3 shadow-sm ${
          right
            ? 'hero-gradient flex-row-reverse rounded-tr-md text-white'
            : 'rounded-tl-md border border-primary/20 bg-primary-soft'
        } ${highlight ? 'ring-4 ring-accent/70' : ''}`}
      >
        <AudioButton text={line.ar} label={line.translation} size="sm" rate={rate} className="mt-1" />
        <div className="min-w-0 flex-1 space-y-1">
          <ArabicText as="p" size="para">
            {line.ar}
          </ArabicText>
          {showTranslation && (
            <p className={`border-t pt-1 text-sm italic ${right ? 'border-white/20 text-emerald-50/90' : 'border-primary/15 text-muted'}`}>
              &ldquo;{line.translation}&rdquo;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
