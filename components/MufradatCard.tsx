'use client';

import { ArabicText } from '@/components/ArabicText';
import { AudioButton } from '@/components/AudioButton';
import { ColorSwatch } from '@/components/ColorSwatch';
import { GenderBadge } from '@/components/GenderBadge';
import { LearnedToggle } from '@/components/LearnedToggle';
import { ItemExtra, ItemVisual } from '@/components/MufradatParts';
import { meaningOf, speechTexts, type MufradatItem } from '@/lib/mufradat';

interface MufradatCardProps {
  item: MufradatItem;
  learned: boolean;
  onToggleLearned: () => void;
}

/** Bentuk Arab di sisi kanan baris; warna tampil mudzakkar & mu'annats berdampingan. */
function RowArabic({ item }: { item: MufradatItem }) {
  if (item.kind === 'color') {
    return (
      <div dir="rtl" className="flex items-end gap-4">
        <div className="text-center">
          <ArabicText as="p" size="word" className="text-primary">
            {item.color.m}
          </ArabicText>
          <p dir="ltr" className="text-[11px] text-muted">mudzakkar</p>
        </div>
        <div className="text-center">
          <ArabicText as="p" size="word" className="text-accent-strong">
            {item.color.f}
          </ArabicText>
          <p dir="ltr" className="text-[11px] text-muted">mu&apos;annats</p>
        </div>
      </div>
    );
  }
  return (
    <ArabicText as="p" size="word" className="text-primary">
      {item.kind === 'vocab' ? item.vocab.ar : item.pronoun.inda}
    </ArabicText>
  );
}

/** Baris kosakata (mode daftar): ikon · arti + gender · kata Arab, lalu catatan & tombol. */
export function MufradatCard({ item, learned, onToggleLearned }: MufradatCardProps) {
  const meaning = meaningOf(item);
  return (
    <article
      className={`card flex h-full flex-col gap-2 rounded-2xl p-3 transition-colors ${learned ? 'border-emerald-600/60!' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {item.kind === 'color' ? (
          <ColorSwatch hex={item.color.hex} label={`Contoh warna ${item.color.id_meaning}`} className="h-12 w-12" />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-soft">
            <ItemVisual item={item} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-snug font-semibold">{meaning}</p>
          {item.kind === 'vocab' && <GenderBadge gender={item.vocab.gender} />}
        </div>
        <div className="ms-auto">
          <RowArabic item={item} />
        </div>
      </div>
      <ItemExtra item={item} />
      <div className="mt-auto flex items-center justify-end gap-2">
        <LearnedToggle learned={learned} onToggle={onToggleLearned} label={meaning} />
        <AudioButton text={speechTexts(item)} label={meaning} size="sm" />
      </div>
    </article>
  );
}
