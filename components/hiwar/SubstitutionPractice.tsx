'use client';

import { useMemo, useState } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { AudioButton } from '@/components/AudioButton';
import { ColorSwatch } from '@/components/ColorSwatch';
import { NounSelect } from '@/components/NounSelect';
import { isAttachable } from '@/lib/arabic';
import { allVocab, content } from '@/lib/content';
import { Substituter } from '@/lib/substitution';
import type { Hiwar } from '@/types/content';

const NOUNS = allVocab.filter(isAttachable).sort((a, b) => a.id_meaning.localeCompare(b.id_meaning, 'id'));
const substituter = new Substituter(content);

/** Latihan substitusi (F4): ganti benda & warna pada kalimat dialog. */
export function SubstitutionPractice({ hiwar }: { hiwar: Hiwar }) {
  const lines = useMemo(() => substituter.substitutable(hiwar.lines), [hiwar.lines]);
  const [nounId, setNounId] = useState(NOUNS.find((n) => n.id === 'kitab')?.id ?? NOUNS[0].id);
  const [colorId, setColorId] = useState(content.colors.find((c) => c.id === 'akhdhar')?.id ?? content.colors[0].id);
  const noun = NOUNS.find((n) => n.id === nounId)!;
  const color = content.colors.find((c) => c.id === colorId)!;

  return (
    <section className="space-y-4 card rounded-3xl p-4 sm:p-5" aria-labelledby="subst-h">
      <h2 id="subst-h" className="font-display text-lg font-semibold">
        🔄 Latihan substitusi
      </h2>
      <p className="text-sm text-muted">
        Ganti benda dan warnanya. Perhatikan dhamir, kata tunjuk, dan bentuk warna ikut berubah sesuai gender benda.
      </p>
      <NounSelect nouns={NOUNS} value={nounId} onChange={setNounId} label="Ganti benda jadi" />
      <fieldset>
        <legend className="mb-1 text-sm font-medium">Ganti warna jadi</legend>
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
      <ol className="space-y-3" aria-live="polite">
        {lines.map((line) => {
          const from = { noun: substituter.nounsIn(line.ar)[0], colors: substituter.colorsIn(line.ar) };
          const ar = substituter.substitute(line.ar, noun, color);
          return (
            <li key={line.ar} className="space-y-1 rounded-2xl border border-border bg-surface-alt/60 p-3">
              <p className="text-xs text-muted">
                Asli: <ArabicText as="bdi" className="text-lg">{line.ar}</ArabicText>
              </p>
              <div className="flex items-center gap-2">
                <ArabicText className="text-lg font-bold text-primary">{line.speaker}</ArabicText>
                <ArabicText as="p" size="para" className="flex-1" showHarakat>
                  {ar}
                </ArabicText>
                <AudioButton text={ar} label="kalimat substitusi" size="sm" />
              </div>
              <p className="text-sm text-muted">{substituter.substituteTranslation(line.translation, from, noun, color)}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
