'use client';

import { useRef } from 'react';
import { AudioButton } from '@/components/AudioButton';
import { ItemArabic, ItemDetails, ItemVisual } from '@/components/MufradatParts';
import { meaningOf, speechTexts, type MufradatItem } from '@/lib/mufradat';

interface FlashcardProps {
  item: MufradatItem;
  flipped: boolean;
  onFlip: () => void;
  /** Geser: 1 = berikutnya, -1 = sebelumnya. */
  onSwipe: (dir: 1 | -1) => void;
}

const SWIPE_PX = 50;

/**
 * Kartu bolak-balik: depan = Arab, belakang = arti.
 * Ketuk kartu untuk membalik, geser kiri/kanan untuk pindah. Versi keyboard: tombol "Balik kartu".
 */
export function Flashcard({ item, flipped, onFlip, onSwipe }: FlashcardProps) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const meaning = meaningOf(item);

  return (
    <div className="space-y-3">
      <div className="relative perspective-distant">
        <div
          onClick={() => {
            if (swiped.current) swiped.current = false;
            else onFlip();
          }}
          onPointerDown={(e) => {
            start.current = { x: e.clientX, y: e.clientY };
            swiped.current = false;
          }}
          onPointerUp={(e) => {
            const s = start.current;
            start.current = null;
            if (!s) return;
            const dx = e.clientX - s.x;
            if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(e.clientY - s.y)) {
              swiped.current = true;
              onSwipe(dx < 0 ? 1 : -1);
            }
          }}
          className="grid cursor-pointer touch-pan-y select-none motion-safe:transition-transform motion-safe:duration-500 transform-3d"
          style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}
        >
          <div
            aria-hidden={flipped}
            className="col-start-1 row-start-1 flex min-h-72 flex-col items-center justify-center gap-4 card rounded-3xl p-6 pt-16 backface-hidden"
          >
            <ItemArabic item={item} large />
            <span className="text-sm text-muted">Ketuk kartu untuk lihat arti</span>
          </div>
          <div
            aria-hidden={!flipped}
            className="col-start-1 row-start-1 flex min-h-72 flex-col items-center justify-center gap-4 rounded-3xl border border-primary/40 bg-surface p-6 pt-16 backface-hidden rotate-y-180"
          >
            <ItemVisual item={item} />
            <ItemDetails item={item} />
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <AudioButton text={speechTexts(item)} label={meaning} />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onFlip}
          aria-pressed={flipped}
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          🔄 Balik kartu {flipped ? '(lihat Arab)' : '(lihat arti)'}
        </button>
      </div>
    </div>
  );
}
