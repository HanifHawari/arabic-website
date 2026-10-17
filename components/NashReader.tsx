'use client';

import { Fragment, useMemo, useState } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { AudioButton } from '@/components/AudioButton';
import { SpeedToggle, type Speed } from '@/components/SpeedToggle';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { TtsNotice } from '@/components/TtsNotice';
import { WordInfo } from '@/components/WordInfo';
import { useArrowHandler } from '@/hooks/useArrowNav';
import { useSettings } from '@/hooks/useSettings';
import { useAudio } from '@/hooks/useAudio';
import { content } from '@/lib/content';
import { annotate, Lexicon } from '@/lib/lookup';
import { splitSentences } from '@/lib/text';
import type { Nash } from '@/types/content';

const lexicon = new Lexicon(content);

/** Teks bacaan (F3): kata bisa diklik, terjemahan per kalimat/semua, audio dengan highlight kalimat. */
export function NashReader({ nash }: { nash: Nash }) {
  const sentences = useMemo(() => splitSentences(nash.ar), [nash.ar]);
  const translations = useMemo(() => splitSentences(nash.translation), [nash.translation]);
  const paired = sentences.length === translations.length;
  const tokens = useMemo(() => sentences.map((s) => annotate(lexicon, s)), [sentences]);

  const { canPlay, playAll: playTexts, stop } = useAudio();
  const { settings } = useSettings();
  const [rate, setRate] = useState<Speed>(1);
  const [playing, setPlaying] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [shown, setShown] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<{ s: number; t: number } | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);

  useArrowHandler((dir) => {
    const next = focusIdx + dir;
    if (next < 0 || next >= sentences.length) return false;
    setFocusIdx(next);
    document.getElementById(`${nash.id}-s${next}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return true;
  });

  const playAll = async () => {
    if (playing !== null) {
      stop();
      setPlaying(null);
      return;
    }
    setPlaying(0);
    await playTexts(sentences, { rate, onIndex: setPlaying });
    setPlaying(null);
  };

  const toggleSentence = (i: number) =>
    setShown((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="space-y-4">
      <TtsNotice />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={playAll}
          disabled={!sentences.some((s) => canPlay(s))}
          className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {playing !== null ? '⏹ Berhenti' : '▶ Putar seluruh teks'}
        </button>
        <SpeedToggle value={rate} onChange={setRate} />
        <ToggleSwitch label="Semua terjemahan" checked={showAll} onChange={setShowAll} />
      </div>
      <p className="text-sm text-muted">Ketuk kata yang bergaris bawah untuk melihat artinya.</p>

      <ol className="space-y-3">
        {sentences.map((sentence, si) => {
          const active = playing === si || (settings.classMode && focusIdx === si);
          const showTr = showAll || shown.has(si);
          const sel = selected?.s === si ? tokens[si][selected.t] : null;
          return (
            <li
              key={si}
              id={`${nash.id}-s${si}`}
              className={`rounded-2xl border p-3 transition-colors ${
                playing === si ? 'border-primary bg-primary/10' : active ? 'border-primary/40 bg-surface' : 'border-border bg-surface'
              }`}
            >
              <ArabicText as="p" size="para">
                {tokens[si].map((tok, ti) => (
                  <Fragment key={ti}>
                    {tok.entry ? (
                      <button
                        type="button"
                        onClick={() => setSelected(selected?.s === si && selected.t === ti ? null : { s: si, t: ti })}
                        aria-expanded={selected?.s === si && selected.t === ti}
                        className={`rounded-md px-1 underline decoration-primary/50 decoration-dotted underline-offset-[10px] hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary ${
                          selected?.s === si && selected.t === ti ? 'bg-primary/15' : ''
                        }`}
                      >
                        {tok.word}
                      </button>
                    ) : (
                      tok.word
                    )}
                    {tok.trailing}
                    {ti < tokens[si].length - 1 ? ' ' : ''}
                  </Fragment>
                ))}
              </ArabicText>
              {sel?.entry && <WordInfo word={sel.word} entry={sel.entry} onClose={() => setSelected(null)} />}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <AudioButton text={sentence} label={`kalimat ${si + 1}`} size="sm" rate={rate} />
                {paired && !showAll && (
                  <button
                    type="button"
                    aria-expanded={showTr}
                    onClick={() => toggleSentence(si)}
                    className="rounded-full border border-border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {showTr ? 'Sembunyikan arti' : 'Lihat arti'}
                  </button>
                )}
              </div>
              {paired && showTr && <p className="mt-2 text-muted">{translations[si]}</p>}
            </li>
          );
        })}
      </ol>
      {!paired && showAll && <p className="rounded-xl bg-surface p-3 text-muted">{nash.translation}</p>}
    </div>
  );
}
