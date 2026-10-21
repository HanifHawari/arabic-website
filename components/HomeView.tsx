'use client';

import Link from 'next/link';
import { ArabicText } from '@/components/ArabicText';
import { ArchMotif } from '@/components/ArchMotif';
import { MixedText } from '@/components/MixedText';
import { ProgressBar } from '@/components/ProgressBar';
import { ResetProgressButton } from '@/components/ResetProgressButton';
import { StatusChip } from '@/components/StatusChip';
import { useProgress } from '@/hooks/useProgress';
import { content } from '@/lib/content';
import { MODULES, moduleById } from '@/lib/modules';
import { moduleStatus, overallPercent } from '@/lib/progress';

function SectionTitle({ id, children, aside }: { id: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 px-1">
      <h2 id={id} className="flex items-center gap-2 text-xl font-semibold text-primary">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-primary" />
        {children}
      </h2>
      {aside && <span className="text-xs font-medium text-muted">{aside}</span>}
    </div>
  );
}

const Chevron = ({ className = '' }: { className?: string }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-5 w-5 ${className}`}>
    <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function HomeView() {
  const { progress } = useProgress();
  const last = progress.lastModule ? moduleById(progress.lastModule) : null;
  const target = last ?? MODULES[0];

  return (
    <div className="space-y-8">
      <section className="hero-gradient relative overflow-hidden rounded-3xl px-5 py-6 text-white shadow-lg sm:px-8 sm:py-8">
        <ArchMotif className="pointer-events-none absolute -right-10 -bottom-10 h-52 w-52 text-white opacity-10" />
        <div className="relative space-y-5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 font-semibold tracking-wide text-emerald-50">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              MTs Kelas VII
            </span>
            <span className="font-medium text-emerald-100/80">Kemenag RI</span>
          </div>
          <div className="text-center">
            <ArabicText as="h1" size="hero" className="font-bold text-white">
              {content.meta.title_ar}
            </ArabicText>
            <p className="mt-1 font-display text-lg font-semibold text-emerald-100">Bab 3 — {content.meta.title_id}</p>
          </div>
          <div className="rounded-2xl bg-black/15 p-3">
            <ProgressBar value={overallPercent(progress)} label="Progres keseluruhan" tone="onDark" />
          </div>
          <Link
            href={target.href}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3 font-bold text-accent-foreground shadow-md transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {last ? `Lanjut belajar: ${last.title} →` : 'Mulai belajar →'}
          </Link>
        </div>
      </section>

      <section aria-labelledby="modul-heading">
        <SectionTitle id="modul-heading" aside={`${MODULES.length} modul`}>
          Modul Pembelajaran
        </SectionTitle>
        <ul className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {MODULES.map((m) => (
            <li key={m.id}>
              <Link
                href={m.href}
                className="group card flex h-full items-center gap-3 rounded-2xl p-3 transition hover:border-primary/40 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-2xl"
                >
                  {m.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg leading-snug font-semibold group-hover:text-primary">{m.title}</span>
                  <span className="block text-sm text-muted">{m.subtitle}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5">
                  <ArabicText size="word" className="leading-[1.9] text-primary">
                    {content.module_titles[m.id]}
                  </ArabicText>
                  <StatusChip status={moduleStatus(progress, m.id)} />
                </span>
                <Chevron className="hidden shrink-0 text-muted transition-transform group-hover:translate-x-0.5 min-[420px]:block" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pengantar-heading">
        <SectionTitle id="pengantar-heading">Pengantar</SectionTitle>
        <div className="space-y-3">
          <details className="group card rounded-2xl" open>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl bg-surface-alt/60 p-4 group-open:rounded-b-none font-display text-lg font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2.5">
                <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-base">
                  🎯
                </span>
                Kompetensi Dasar
              </span>
              <Chevron className="rotate-90 text-muted transition-transform group-open:-rotate-90" />
            </summary>
            <ul className="space-y-3 p-4 text-sm leading-relaxed">
              {content.kompetensi.kd.map((kd) => (
                <li key={kd.kode} className="flex gap-3">
                  <span
                    className={`h-fit shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${
                      kd.kode.startsWith('3') ? 'bg-accent-soft text-accent-strong' : 'bg-primary-soft text-primary'
                    }`}
                  >
                    KD {kd.kode}
                  </span>
                  <span>
                    <MixedText text={kd.teks} />
                  </span>
                </li>
              ))}
            </ul>
          </details>
          <details className="group card rounded-2xl">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl bg-surface-alt/60 p-4 group-open:rounded-b-none font-display text-lg font-semibold focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2.5">
                <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-base">
                  🗺️
                </span>
                Peta konsep bab
              </span>
              <Chevron className="rotate-90 text-muted transition-transform group-open:-rotate-90" />
            </summary>
            <ol className="space-y-5 p-4 text-sm">
              {content.book_structure.map((s, i) => (
                <li key={s.section} className="relative flex gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 border-s-2 border-dotted border-primary/30 ps-3">
                    <p className="font-semibold">
                      <MixedText text={s.section} />
                    </p>
                    <ul className="mt-1 list-disc space-y-1 ps-5 text-muted marker:text-primary">
                      {s.parts.map((p) => (
                        <li key={p}>
                          <MixedText text={p} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </details>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-surface-alt p-4 text-sm text-muted">
        <p>💾 Progres tersimpan di perangkat ini saja (tanpa akun).</p>
        <ResetProgressButton />
      </section>
    </div>
  );
}
