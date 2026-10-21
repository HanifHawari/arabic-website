'use client';

import { useMemo, useState } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { AudioButton } from '@/components/AudioButton';
import { MixedText } from '@/components/MixedText';
import { NounSelect } from '@/components/NounSelect';
import { isAttachable } from '@/lib/arabic';
import { allVocab, content } from '@/lib/content';
import { dhamirSteps, possessiveMeaning } from '@/lib/sentences';

const NOUNS = allVocab.filter(isAttachable).sort((a, b) => a.id_meaning.localeCompare(b.id_meaning, 'id'));

/** Pembentuk dhamir (F5): pilih benda + dhamir → langkah pembentukan muncul satu per satu. */
export function DhamirBuilder() {
  const [nounId, setNounId] = useState(NOUNS.find((n) => n.stem.endsWith('ة'))?.id ?? NOUNS[0].id);
  const [pronounId, setPronounId] = useState(content.pronouns[0].id);
  const noun = NOUNS.find((n) => n.id === nounId)!;
  const pronoun = content.pronouns.find((p) => p.id === pronounId)!;
  const steps = useMemo(() => dhamirSteps(noun, pronoun), [noun, pronoun]);
  const result = steps[steps.length - 1].ar;
  const meaning = possessiveMeaning(content, noun.id_meaning, pronoun);

  return (
    <div className="space-y-4 card rounded-2xl p-4">
      <h3 className="text-lg font-bold">🧪 Pembentuk Dhamir</h3>
      <NounSelect nouns={NOUNS} value={nounId} onChange={setNounId} />
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Pilih dhamir</legend>
        <div className="grid grid-cols-3 gap-2">
          {content.pronouns.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === pronounId}
              onClick={() => setPronounId(p.id)}
              className={`rounded-xl border-2 px-2 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                p.id === pronounId ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <ArabicText as="span" className="block text-2xl" showHarakat>
                {p.ar}
              </ArabicText>
              <span className="block text-xs text-muted">{p.id_meaning}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <ol key={`${nounId}-${pronounId}`} className="space-y-2" aria-live="polite">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          return (
            <li
              key={s.label}
              className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-1 motion-safe:animate-[step-in_400ms_ease-out_both] ${
                last ? 'border-primary bg-primary/10' : 'border-border'
              }`}
              style={{ animationDelay: `${i * 350}ms` }}
            >
              <span className="text-sm">
                <span className="me-1 font-bold">{i + 1}.</span>
                <MixedText text={s.label} showHarakat />
              </span>
              <ArabicText className={last ? 'text-4xl font-bold' : 'text-3xl'} showHarakat>
                {s.ar}
              </ArabicText>
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl bg-background p-3 text-center">
        <div className="flex items-center justify-center gap-3">
          <ArabicText className="text-arabic-word font-bold" showHarakat>
            {result}
          </ArabicText>
          <AudioButton text={result} label={meaning} size="sm" />
        </div>
        <p className="text-lg">= {meaning}</p>
      </div>
    </div>
  );
}
