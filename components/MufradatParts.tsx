// Potongan tampilan item mufradat yang dipakai kartu grid & flashcard.

import { ArabicText } from '@/components/ArabicText';
import { ColorSwatch } from '@/components/ColorSwatch';
import { GenderBadge } from '@/components/GenderBadge';
import { Illustration } from '@/components/Illustration';
import { MixedText } from '@/components/MixedText';
import { content } from '@/lib/content';
import { indaExample, meaningOf, type MufradatItem } from '@/lib/mufradat';

/** Teks Arab utama item. */
export function ItemArabic({ item, large = false }: { item: MufradatItem; large?: boolean }) {
  const size = large ? 'hero' : 'word';
  if (item.kind === 'color') {
    return (
      <div dir="rtl" className="flex flex-wrap items-end justify-center gap-x-6 gap-y-2">
        <div className="text-center">
          <ArabicText as="p" size={size}>
            {item.color.m}
          </ArabicText>
          <p dir="ltr" className="text-xs text-muted">mudzakkar</p>
        </div>
        <div className="text-center">
          <ArabicText as="p" size={size}>
            {item.color.f}
          </ArabicText>
          <p dir="ltr" className="text-xs text-muted">mu&apos;annats</p>
        </div>
      </div>
    );
  }
  const ar = item.kind === 'vocab' ? item.vocab.ar : item.pronoun.inda;
  return (
    <ArabicText as="p" size={size} className="text-center">
      {ar}
    </ArabicText>
  );
}

/** Ilustrasi / swatch item. */
export function ItemVisual({ item }: { item: MufradatItem }) {
  if (item.kind === 'vocab') return <Illustration vocabId={item.vocab.id} />;
  if (item.kind === 'color') return <ColorSwatch hex={item.color.hex} label={`Contoh warna ${item.color.id_meaning}`} />;
  return (
    <span aria-hidden="true" className="text-4xl leading-none">
      🤲
    </span>
  );
}

/** Arti, gender, catatan, contoh. */
export function ItemDetails({ item }: { item: MufradatItem }) {
  const pronounIndex = item.kind === 'inda' ? content.pronouns.indexOf(item.pronoun) : -1;
  const exampleNoun = pronounIndex >= 0 ? content.vocab.sekolah[pronounIndex % content.vocab.sekolah.length] : null;

  return (
    <div className="space-y-2 text-center">
      <p className="text-lg font-semibold">{meaningOf(item)}</p>
      {item.kind === 'vocab' && <GenderBadge gender={item.vocab.gender} />}
      {item.kind === 'vocab' && item.vocab.note && (
        <p className="rounded-lg bg-notice-bg px-3 py-2 text-left text-xs text-notice-fg">
          <span className="font-semibold">Catatan:</span> <MixedText text={item.vocab.note} />
        </p>
      )}
      {item.kind === 'inda' && exampleNoun && (
        <p className="text-sm text-muted">
          Contoh:{' '}
          <ArabicText as="bdi" className="text-xl text-foreground">
            {indaExample(item.pronoun, exampleNoun)}
          </ArabicText>{' '}
          = {item.pronoun.id_meaning} punya {exampleNoun.id_meaning}
        </p>
      )}
    </div>
  );
}
