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
}

export function HiwarBubble({ line, side, showTranslation, highlight = false, rate = 1 }: HiwarBubbleProps) {
  const right = side === 'right';
  return (
    <div className={`flex ${right ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] space-y-1 rounded-2xl border px-4 py-2 ${
          right ? 'rounded-tr-sm border-primary/40 bg-primary/10' : 'rounded-tl-sm border-border bg-surface'
        } ${highlight ? 'ring-2 ring-primary' : ''}`}
      >
        <div className={`flex items-center gap-2 ${right ? 'flex-row-reverse' : ''}`}>
          <ArabicText className="text-lg font-bold text-primary">{line.speaker}</ArabicText>
          <AudioButton text={line.ar} label={line.translation} size="sm" rate={rate} />
        </div>
        <ArabicText as="p" size="para">
          {line.ar}
        </ArabicText>
        {showTranslation && <p className="text-sm text-muted">{line.translation}</p>}
      </div>
    </div>
  );
}
