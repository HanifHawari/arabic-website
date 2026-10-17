'use client';

import { useState } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { AudioButton } from '@/components/AudioButton';
import { ColorSwatch } from '@/components/ColorSwatch';
import { MixedText } from '@/components/MixedText';
import { NounSelect } from '@/components/NounSelect';
import { isAttachable } from '@/lib/arabic';
import { allVocab, content } from '@/lib/content';
import { COLOR_PATTERNS, colorSentence, genderName, type ColorPattern } from '@/lib/sentences';

const NOUNS = allVocab.filter(isAttachable).sort((a, b) => a.id_meaning.localeCompare(b.id_meaning, 'id'));
const lawnGrammar = content.grammar.find((g) => g.id === 'lawn');
const patternNames = lawnGrammar && 'patterns' in lawnGrammar ? lawnGrammar.patterns.map((p) => p.name) : [];

/** Simulator warna (F5): benda + warna + pola → kalimat + alasan bentuk warnanya. */
export function ColorSimulator() {
  const [nounId, setNounId] = useState(NOUNS.find((n) => n.gender === 'f')?.id ?? NOUNS[0].id);
  const [colorId, setColorId] = useState(content.colors[0].id);
  const [pattern, setPattern] = useState<ColorPattern>(1);
  const noun = NOUNS.find((n) => n.id === nounId)!;
  const color = content.colors.find((c) => c.id === colorId)!;
  const s = colorSentence(content, noun, color, pattern);

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
      <h3 className="text-lg font-bold">🎨 Simulator Warna</h3>
      <NounSelect nouns={NOUNS} value={nounId} onChange={setNounId} />
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Pilih warna</legend>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
          {content.colors.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={c.id === colorId}
              aria-label={c.id_meaning}
              title={c.id_meaning}
              onClick={() => setColorId(c.id)}
              className={`flex aspect-square items-center justify-center rounded-xl border-2 p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                c.id === colorId ? 'border-primary' : 'border-transparent'
              }`}
            >
              <ColorSwatch hex={c.hex} className="h-full w-full" />
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Pilih pola</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {COLOR_PATTERNS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={p === pattern}
              onClick={() => setPattern(p)}
              className={`rounded-xl border-2 px-3 py-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                p === pattern ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              <MixedText text={patternNames[p - 1] ?? `Pola ${p}`} showHarakat />
            </button>
          ))}
        </div>
      </fieldset>

      <div aria-live="polite" className="space-y-3 rounded-xl bg-background p-4">
        <div className="flex items-center justify-center gap-3">
          <ArabicText as="p" size="word" className="text-center" showHarakat>
            {s.ar}
          </ArabicText>
          <AudioButton text={s.ar} label={s.translation} size="sm" />
        </div>
        <p className="text-center text-muted">{s.translation}</p>
        <p className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <span>
            Benda: <strong>{genderName(noun.gender)}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Warna dipakai: <strong>bentuk {genderName(s.form)}</strong>
          </span>
        </p>
        <p className="rounded-lg border border-border bg-surface p-3 text-sm">
          💡 <MixedText text={s.explanation} showHarakat />
        </p>
      </div>
    </div>
  );
}
