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
import { annotate, Lexicon, type LookupEntry } from '@/lib/lookup';
import { splitSentences } from '@/lib/text';
import type { Nash } from '@/types/content';

const lexicon = new Lexicon(content);

/** Teks bacaan (F3): kata bisa diklik, terjemahan per kalimat/semua, audio dengan highlight kalimat. */
export function NashReader({ nash }: { nash: Nash }) {
  const sentences = useMemo(() => splitSentences(nash.ar), [nash.ar]);
  const translations = useMemo(() => splitSentences(nash.translation), [nash.translation]);
  const paired = sentences.length === translations.length;
  const tokens = useMemo(() => sentences.map((s) => annotate(lexicon, s)), [sentences]);
  // Kosakata Bab 3 yang muncul di teks (unik, urut kemunculan).
  const keyWords = useMemo(() => {
    const seen = new Map<string, LookupEntry>();
    for (const tok of tokens.flat()) {
      if (tok.entry?.kind === 'vocab' && !seen.has(tok.entry.ar)) seen.set(tok.entry.ar, tok.entry);
    }
    return [...seen.values()];
  }, [tokens]);

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
      <div className="hero-gradient flex flex-wrap items-center gap-3 rounded-2xl p-3 text-white shadow-md">
        <button
          type="button"
          onClick={playAll}
          disabled={!sentences.some((s) => canPlay(s))}
          aria-label={playing !== null ? 'Berhenti' : 'Putar seluruh teks'}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-xl text-accent-foreground shadow-md active:scale-95 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span aria-hidden="true">{playing !== null ? '⏹' : '▶'}</span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{playing !== null ? 'Sedang dibacakan…' : 'Putar seluruh teks'}</p>
          <p className="text-xs text-emerald-100/90" aria-live="polite">
            {playing !== null ? `Kalimat ${playing + 1} dari ${sentences.length}` : `${sentences.length} kalimat · kalimat aktif disorot`}
          </p>
        </div>
        <SpeedToggle value={rate} onChange={setRate} />
      </div>

      <section className="card space-y-2 rounded-3xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-primary uppercase">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary" />
            {nash.title}
          </h2>
          <ToggleSwitch label="Semua terjemahan" checked={showAll} onChange={setShowAll} />
        </div>
        <p className="text-xs text-muted">👆 Ketuk kata yang disorot untuk melihat artinya.</p>

        <ol className="divide-y divide-border">
          {sentences.map((sentence, si) => {
            const active = playing === si || (settings.classMode && focusIdx === si);
            const showTr = showAll || shown.has(si);
            const sel = selected?.s === si ? tokens[si][selected.t] : null;
            return (
              <li
                key={si}
                id={`${nash.id}-s${si}`}
                className={`-mx-2 rounded-2xl px-2 py-3 transition-colors ${
                  playing === si ? 'bg-primary-soft' : active ? 'bg-surface-alt' : ''
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
                          className={`rounded-md px-1 underline decoration-primary/50 decoration-dotted underline-offset-[10px] hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-primary ${
                            selected?.s === si && selected.t === ti ? 'bg-primary/20' : 'bg-primary-soft/70'
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
                      className="rounded-full bg-surface-alt px-3 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      {showTr ? 'Sembunyikan arti' : 'Lihat arti'}
                    </button>
                  )}
                </div>
                {paired && showTr && (
                  <p className="mt-2 rounded-xl bg-primary-soft px-3 py-2 text-sm leading-relaxed">
                    <span className="block text-xs font-bold text-primary">🌐 Terjemahan</span>
                    {translations[si]}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
        {!paired && showAll && <p className="rounded-xl bg-primary-soft p-3 text-sm">{nash.translation}</p>}
      </section>

      {keyWords.length > 0 && (
        <section aria-labelledby={`${nash.id}-kosakata`} className="card rounded-3xl p-4 sm:p-5">
          <h2 id={`${nash.id}-kosakata`} className="mb-3 font-display text-lg font-semibold">
            📌 Kosakata di teks ini
          </h2>
          <ul className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3">
            {keyWords.map((e) => (
              <li key={e.ar} className="flex flex-col items-center rounded-2xl bg-surface-alt px-2 py-2 text-center">
                <ArabicText size="word" className="text-primary">
                  {e.ar}
                </ArabicText>
                <span className="text-xs text-muted">{e.meaning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
