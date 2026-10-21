'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Flashcard } from '@/components/Flashcard';
import { LearnedToggle } from '@/components/LearnedToggle';
import { MufradatCard } from '@/components/MufradatCard';
import { PageHero } from '@/components/PageHero';
import { ProgressBar } from '@/components/ProgressBar';
import { Tabs } from '@/components/Tabs';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { TtsNotice } from '@/components/TtsNotice';
import { useArrowHandler } from '@/hooks/useArrowNav';
import { useModuleVisit, useProgress } from '@/hooks/useProgress';
import { useSettings } from '@/hooks/useSettings';
import { content } from '@/lib/content';
import { allMufradatKeys, itemsForTab, meaningOf, MUFRADAT_TABS, searchItems, type MufradatTab } from '@/lib/mufradat';
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
  const [query, setQuery] = useState('');

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

  const searching = query.trim().length > 0;
  const shown = searching ? searchItems(content, query) : items;

  return (
    <div className="space-y-5">
      <PageHero moduleId="mufradat" title="Mufradat" description="Kosakata peralatan sekolah, perangkat kelas, dan warna.">
        <ProgressBar value={(learnedCount / ALL_KEYS.length) * 100} label={`Sudah hafal ${learnedCount} dari ${ALL_KEYS.length} kosakata.`} tone="onDark" />
      </PageHero>

      <section
        aria-label="Mode kartu"
        className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-700 to-orange-700 p-3 text-white shadow-md sm:p-4"
      >
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">
          🃏
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base leading-tight font-bold sm:text-lg">Mode Kartu</p>
          <p className="text-xs text-white/90">
            {MUFRADAT_TABS.find((t) => t.id === tab)?.label}: hafal {tabLearned}/{tabTotal}
          </p>
          <div aria-hidden="true" className="mt-1.5 h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${tabTotal ? (tabLearned / tabTotal) * 100 : 0}%` }} />
          </div>
        </div>
        <button
          type="button"
          aria-pressed={mode === 'flashcard'}
          onClick={() => {
            setMode(mode === 'flashcard' ? 'grid' : 'flashcard');
            setQuery('');
            resetView();
          }}
          className="shrink-0 rounded-xl bg-white px-3 py-2 text-sm font-bold text-orange-800 shadow-sm active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {mode === 'flashcard' ? '▦ Daftar' : '▶ Flashcard'}
        </button>
      </section>

      <TtsNotice />

      {mode === 'grid' && (
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kosakata Arab atau Indonesia…"
            aria-label="Cari kosakata"
            className="w-full rounded-2xl border border-border bg-surface-alt py-3 pr-4 pl-10 text-sm placeholder:text-muted focus:border-primary focus:outline-2 focus:outline-primary/30"
          />
        </div>
      )}

      {!searching && (
        <Tabs
          tabs={MUFRADAT_TABS.map((t) => ({ ...t, count: itemsForTab(content, t.id).length }))}
          value={tab}
          onChange={(t) => {
            setTab(t);
            resetView();
          }}
          label="Kategori kosakata"
          idPrefix="mufradat"
          variant="chips"
        />
      )}

      <div
        id="mufradat-panel"
        role={searching ? undefined : 'tabpanel'}
        aria-labelledby={searching ? undefined : `mufradat-tab-${tab}`}
        className="space-y-4"
      >
        {searching ? (
          <p className="text-sm text-muted" aria-live="polite">
            {shown.length} hasil untuk &ldquo;{query.trim()}&rdquo; di semua kategori.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-primary" />
              {mode === 'flashcard' ? 'Kartu Hafalan' : 'Daftar Kosakata'}
            </h2>
            <span className="flex-1" />
            <ToggleSwitch label="Harakat" checked={settings.showHarakat} onChange={(v) => update({ showHarakat: v })} />
            <ToggleSwitch
              label="Belum hafal saja"
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
              className="min-h-9 rounded-full bg-surface-alt px-3 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-primary"
            >
              🔀 {shuffleSeed === null ? 'Acak' : 'Urutan asli'}
            </button>
          </div>
        )}

        {!searching && items.length === 0 && (
          <p className="card rounded-2xl p-6 text-center">
            🎉 Semua kata di kategori ini sudah kamu hafal!
          </p>
        )}

        {(mode === 'grid' || searching) && shown.length > 0 && (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {shown.map((item) => (
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

        {mode === 'flashcard' && !searching && current && (
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

      <section className="card rounded-2xl p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">📝 Tadrib Mufradat</h2>
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-bold text-primary">10 soal</span>
        </div>
        <p className="mt-1 text-sm text-muted">Uji hafalan arti kata dan bentuk warna (mudzakkar &amp; mu&apos;annats) dengan soal acak.</p>
        <Link
          href="/latihan"
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Mulai latihan →
        </Link>
      </section>
    </div>
  );
}
