'use client';

import { AudioButton } from '@/components/AudioButton';
import { LearnedToggle } from '@/components/LearnedToggle';
import { ItemArabic, ItemDetails, ItemVisual } from '@/components/MufradatParts';
import { meaningOf, speechTexts, type MufradatItem } from '@/lib/mufradat';

interface MufradatCardProps {
  item: MufradatItem;
  learned: boolean;
  onToggleLearned: () => void;
}

/** Kartu mode grid: semua info sekaligus. */
export function MufradatCard({ item, learned, onToggleLearned }: MufradatCardProps) {
  const meaning = meaningOf(item);
  return (
    <article
      className={`flex h-full flex-col gap-3 rounded-2xl border bg-surface p-4 ${learned ? 'border-emerald-600/60' : 'border-border'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <ItemVisual item={item} />
        <AudioButton text={speechTexts(item)} label={meaning} size="sm" />
      </div>
      <ItemArabic item={item} />
      <div className="flex-1">
        <ItemDetails item={item} />
      </div>
      <div className="flex justify-center">
        <LearnedToggle learned={learned} onToggle={onToggleLearned} label={meaning} />
      </div>
    </article>
  );
}
