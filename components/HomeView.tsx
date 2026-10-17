'use client';

import Link from 'next/link';
import { ArabicText } from '@/components/ArabicText';
import { MixedText } from '@/components/MixedText';
import { ProgressBar } from '@/components/ProgressBar';
import { ResetProgressButton } from '@/components/ResetProgressButton';
import { StatusChip } from '@/components/StatusChip';
import { useProgress } from '@/hooks/useProgress';
import { content } from '@/lib/content';
import { MODULES, moduleById } from '@/lib/modules';
import { moduleStatus, overallPercent } from '@/lib/progress';

export function HomeView() {
  const { progress } = useProgress();
  const last = progress.lastModule ? moduleById(progress.lastModule) : null;
  const target = last ?? MODULES[0];

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-border bg-surface px-5 py-8 text-center">
        <ArabicText as="h1" size="hero" className="font-bold">
          {content.meta.title_ar}
        </ArabicText>
        <p className="mt-1 text-lg text-muted">Bab 3 — {content.meta.title_id}</p>
        <div className="mx-auto mt-6 max-w-md text-left">
          <ProgressBar value={overallPercent(progress)} label="Progres keseluruhan" />
        </div>
        <Link
          href={target.href}
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {last ? `Lanjut belajar: ${last.title} →` : 'Mulai belajar →'}
        </Link>
      </section>

      <section aria-labelledby="modul-heading">
        <h2 id="modul-heading" className="mb-4 text-xl font-bold">
          Modul
        </h2>
        <ul className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <li key={m.id}>
              <Link
                href={m.href}
                className="flex h-full items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span aria-hidden="true" className="text-3xl">
                  {m.icon}
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">{m.title}</span>
                  <span className="block text-sm text-muted">{m.subtitle}</span>
                </span>
                <StatusChip status={moduleStatus(progress, m.id)} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pengantar-heading" className="space-y-4">
        <h2 id="pengantar-heading" className="text-xl font-bold">
          Pengantar
        </h2>
        <details className="rounded-2xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold">Kompetensi Dasar</summary>
          <ul className="mt-3 space-y-3 text-sm">
            {content.kompetensi.kd.map((kd) => (
              <li key={kd.kode}>
                <span className="font-semibold">KD {kd.kode}</span> — <MixedText text={kd.teks} />
              </li>
            ))}
          </ul>
        </details>
        <details className="rounded-2xl border border-border bg-surface p-4">
          <summary className="cursor-pointer font-semibold">Peta konsep bab</summary>
          <ol className="mt-3 space-y-4 text-sm">
            {content.book_structure.map((s) => (
              <li key={s.section}>
                <p className="font-semibold">
                  <MixedText text={s.section} />
                </p>
                <ul className="mt-1 list-disc space-y-1 ps-5">
                  {s.parts.map((p) => (
                    <li key={p}>
                      <MixedText text={p} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </details>
      </section>

      <section className="space-y-2 border-t border-border pt-6 text-sm text-muted">
        <p>Progres tersimpan di perangkat ini saja (tanpa akun).</p>
        <ResetProgressButton />
      </section>
    </div>
  );
}
