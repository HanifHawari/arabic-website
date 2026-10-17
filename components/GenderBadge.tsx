import { ArabicText } from '@/components/ArabicText';
import { content } from '@/lib/content';
import type { Gender } from '@/types/content';

/** Badge gender kata benda: label Arab dari JSON + keterangan Indonesia. */
export function GenderBadge({ gender }: { gender: Gender }) {
  const isM = gender === 'm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        isM ? 'border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-200' : 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200'
      }`}
    >
      <ArabicText className="text-base leading-[1.9]">
        {isM ? content.grammar_words.mudzakkar : content.grammar_words.muannats}
      </ArabicText>
      <span>{isM ? 'mudzakkar' : "mu'annats"}</span>
    </span>
  );
}
