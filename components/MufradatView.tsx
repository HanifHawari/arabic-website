'use client';

import { useEffect, useMemo, useState } from 'react';
import { Flashcard } from '@/components/Flashcard';
import { LearnedToggle } from '@/components/LearnedToggle';
import { MufradatCard } from '@/components/MufradatCard';
import { Tabs } from '@/components/Tabs';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { TtsNotice } from '@/components/TtsNotice';
import { useArrowHandler } from '@/hooks/useArrowNav';
import { useModuleVisit, useProgress } from '@/hooks/useProgress';
import { useSettings } from '@/hooks/useSettings';
import { content } from '@/lib/content';
import { allMufradatKeys, itemsForTab, meaningOf, MUFRADAT_TABS, type MufradatTab } from '@/lib/mufradat';
import { isLearned } from '@/lib/progress';
import { randomSeed, createRng, shuffle } from '@/lib/rng';

type Mode = 'grid' | 'flashcard';

const ALL_KEYS = allMufradatKeys(content);

export function MufradatView() {
  useModuleVisit('mufradat');
  const { progress, toggleLearned, setModuleStatus } = useProgress();
  const { settings, update } = useSettings();
  const [tab, setTab] = useState<MufradatTab>('sekolah');
  const [mode, setMode] = useState<Mode>('grid');
  const [onlyUnlearned, setOnlyUnlearned] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const items = useMemo(() => {
    let list = itemsForTab(content, tab);
    if (onlyUnlearned) list = list.filter((i) => !progress.learned.includes(i.key));
    return shuffleSeed === null ? list : shuffle(list, createRng(shuffleSeed));
  },[tab, onlyUnlearned, shuffleSeed, progress.learned]);

  const learnedCount = ALL_KEYS.filter((k) => progress.learned.includes(k)).length;
  const tabLearned = itemsForTab(content, tab).filter((i) => progress.learned.includes(i.key)).length;
  const tabTotal = itemsForTab(content, tab).length;

  useEffect(() => {
    if (learnedCount === ALL_KEYS.length) setModuleStatus('mufradat', 'selesai');
  }, [learnedCount, setModuleStatus]);

  const safeIndex = Math.min(index, Math.max(0, items.length - 1));
  const current = items[safeIndex];

  const go = (dir: 1 | -1) => {
    if (items.length === 0) return false;
    const next = safeIndex + dir;
    if (next < 0 || next >= items.length) return false;
    setIndex(next);
    setFlipped(false);
    return true;
  };

  useArrowHandler(go, mode === 'flashcard');

  const resetView = () => {
    setIndex(0);
    setFlipped(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mufradat</h1>
          <p className="text-sm text-muted">
            Sudah hafal {learnedCount} dari {ALL_KEYS.length} kosakata.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ToggleSwitch label="Harakat" checked={settings.showHarakat} onChange={(v) => update({ showHarakat: v })} />
          <div role="group" aria-label="Mode tampilan" className="inline-flex rounded-full border border-border bg-surface p-0.5">
            {(['grid', 'flashcard'] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => {
                  setMode(m);
                  resetView();
                }}
                className={`rounded-full px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary ${
                  mode === m ? 'bg-primary text-primary-foreground' : 'text-muted'
                }`}
              >
                {m === 'grid' ? '▦ Grid' : '🃏 Flashcard'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <TtsNotice />

      <Tabs
        tabs={MUFRADAT_TABS}
        value={tab}
        onChange={(t) => {
          setTab(t);
          resetView();
        }}
        label="Kategori kosakata"
        idPrefix="mufradat"
      />

      <div
        id="mufradat-panel"
        role="tabpanel"
        aria-labelledby={`mufradat-tab-${tab}`}
        className="space-y-4"
      >
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">
            Hafal {tabLearned}/{tabTotal} di kategori ini
          </span>
          <span className="flex-1" />
          <ToggleSwitch
            label="Hanya yang belum hafal"
            checked={onlyUnlearned}
            onChange={(v) => {
              setOnlyUnlearned(v);
              resetView();
            }}
          />
          <button
            type="button"
            onClick={() => {
              setShuffleSeed(shuffleSeed === null ? randomSeed() : null);
              resetView();
            }}
            aria-pressed={shuffleSeed !== null}
            className="min-h-9 rounded-full border border-border bg-surface px-3 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-primary"
          >
            🔀 {shuffleSeed === null ? 'Acak' : 'Urutan asli'}
          </button>
        </div>

        {items.length === 0 && (
          <p className="rounded-2xl border border-border bg-surface p-6 text-center">
            🎉 Semua kata di kategori ini sudah kamu hafal!
          </p>
        )}

        {mode === 'grid' && items.length > 0 && (
          <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.key}>
                <MufradatCard
                  item={item}
                  learned={isLearned(progress, item.key)}
                  onToggleLearned={() => toggleLearned(item.key)}
                />
              </li>
            ))}
          </ul>
        )}

        {mode === 'flashcard' && current && (
          <div
            className="mx-auto max-w-md space-y-4"
            onKeyDown={(e) => {
              if (settings.classMode) return; // Mode Kelas sudah menangani panah secara global
              if (e.key === 'ArrowRight' && go(1)) e.preventDefault();
              if (e.key === 'ArrowLeft' && go(-1)) e.preventDefault();
            }}
          >
            <p className="text-center text-sm text-muted" aria-live="polite">
              Kartu {safeIndex + 1} dari {items.length}
            </p>
            <Flashcard key={current.key} item={current} flipped={flipped} onFlip={() => setFlipped((f) => !f)} onSwipe={go} />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                disabled={safeIndex === 0}
                aria-label="Kartu sebelumnya"
                className="shrink-0 rounded-full border border-border bg-surface px-4 py-2 font-medium disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary"
              >
                ←<span className="hidden min-[440px]:inline"> Sebelumnya</span>
              </button>
              <LearnedToggle
                learned={isLearned(progress, current.key)}
                onToggle={() => toggleLearned(current.key)}
                label={meaningOf(current)}
              />
              <button
                type="button"
                onClick={() => go(1)}
                disabled={safeIndex >= items.length - 1}
                aria-label="Kartu berikutnya"
                className="shrink-0 rounded-full border border-border bg-surface px-4 py-2 font-medium disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="hidden min-[440px]:inline">Berikutnya </span>→
              </button>
            </div>
            <p className="text-center text-xs text-muted">Tips: geser kartu ke kiri/kanan, atau pakai tombol panah keyboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}
