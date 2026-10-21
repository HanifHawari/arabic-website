'use client';

import { useEffect, useState } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { MixedText } from '@/components/MixedText';
import { NextModuleLink } from '@/components/NextModuleLink';
import { PageHero } from '@/components/PageHero';
import { ProgressBar } from '@/components/ProgressBar';
import { MiniQuiz } from '@/components/quiz/MiniQuiz';
import { Tabs } from '@/components/Tabs';
import { ColorSimulator } from '@/components/tarkib/ColorSimulator';
import { DhamirBuilder } from '@/components/tarkib/DhamirBuilder';
import { useModuleVisit, useProgress } from '@/hooks/useProgress';
import { content } from '@/lib/content';
import { isDone } from '@/lib/progress';
import type { DhamirGrammar, LawnGrammar } from '@/types/content';

const dhamir = content.grammar.find((g): g is DhamirGrammar => g.id === 'dhamir_muttashil')!;
const lawn = content.grammar.find((g): g is LawnGrammar => g.id === 'lawn')!;

const FLAG_DHAMIR = 'tarkib:dhamir';
const FLAG_WARNA = 'tarkib:warna';

const TABS = [
  { id: 'dhamir', label: '1. Dhamir' },
  { id: 'warna', label: '2. Warna' },
  { id: 'isyarah', label: '3. Isyarah' },
] as const;
type TarkibTab = (typeof TABS)[number]['id'];
const isTab = (s: string): s is TarkibTab => TABS.some((t) => t.id === s);

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-xl font-semibold text-primary">
      {children}
    </h2>
  );
}

export function TarkibView() {
  useModuleVisit('tarkib');
  const { progress, markDone, setModuleStatus } = useProgress();
  const doneDhamir = isDone(progress, FLAG_DHAMIR);
  const doneWarna = isDone(progress, FLAG_WARNA);
  const [tab, setTab] = useState<TarkibTab>('dhamir');

  useEffect(() => {
    if (doneDhamir && doneWarna) setModuleStatus('tarkib', 'selesai');
  }, [doneDhamir, doneWarna, setModuleStatus]);

  // Tautan lama #dhamir / #warna / #isyarah tetap membuka tab yang sesuai.
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.slice(1);
      if (isTab(h)) setTab(h);
    };
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const doneCount = Number(doneDhamir) + Number(doneWarna);
  const example = dhamir.rows[0];

  return (
    <div className="space-y-5">
      <PageHero moduleId="tarkib" title="Tarkib (Kaidah)" description="Dhamir muttashil, cara menyatakan warna, dan isim isyarah.">
        <ProgressBar value={(doneCount / 2) * 100} label={`Mini-quiz kaidah selesai: ${doneCount} dari 2`} tone="onDark" />
      </PageHero>

      <Tabs tabs={TABS} value={tab} onChange={setTab} label="Bagian kaidah" idPrefix="tarkib" />

      <div id="tarkib-panel" role="tabpanel" aria-labelledby={`tarkib-tab-${tab}`}>
        {tab === 'dhamir' && (
          <section id="dhamir" aria-labelledby="dhamir-h" className="space-y-4">
            <SectionHeading id="dhamir-h">
              <MixedText text={dhamir.title} />
            </SectionHeading>

            <div className="card rounded-3xl p-4">
              <p className="text-xs font-bold tracking-wide text-primary uppercase">Σ Rumus kepemilikan</p>
              <div dir="rtl" className="mt-2 flex items-start justify-center gap-2 rounded-2xl bg-surface-alt px-2 py-2 text-center">
                <div>
                  <ArabicText as="p" size="word">
                    {dhamir.table_example_base}
                  </ArabicText>
                  <p dir="ltr" className="text-xs text-muted">Kata benda</p>
                </div>
                <span aria-hidden="true" className="pt-3 text-2xl text-muted">+</span>
                <div>
                  <ArabicText as="p" size="word" className="text-accent-strong">
                    {example.suffix}
                  </ArabicText>
                  <p dir="ltr" className="text-xs text-muted">Dhamir</p>
                </div>
                <span aria-hidden="true" className="pt-3 text-2xl text-muted">=</span>
                <div>
                  <ArabicText as="p" size="word" className="font-bold text-primary">
                    {example.result}
                  </ArabicText>
                  <p dir="ltr" className="text-xs text-muted">{example.id_meaning}</p>
                </div>
              </div>
              <p className="mt-2 text-sm">{dhamir.summary}</p>
            </div>

            <div className="card rounded-3xl p-4">
              <h3 className="font-display text-lg font-semibold">Tabel dhamir</h3>
              <p className="mb-3 text-sm text-muted">
                Contoh dengan kata{' '}
                <ArabicText as="bdi" className="text-xl text-foreground">
                  {dhamir.table_example_base}
                </ArabicText>
              </p>
              <ul className="space-y-2">
                {dhamir.rows.map((r) => (
                  <li key={r.pronoun} className="flex items-center gap-3 rounded-2xl bg-surface-alt p-2 pe-3">
                    <span className="flex h-14 min-w-14 shrink-0 items-center justify-center rounded-xl bg-surface px-1 shadow-sm">
                      <ArabicText size="word">{r.pronoun}</ArabicText>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{r.id_meaning}</span>
                      <span className="text-xs text-muted">
                        Akhiran:{' '}
                        <ArabicText as="bdi" className="text-lg text-accent-strong">
                          {r.suffix}
                        </ArabicText>
                      </span>
                    </span>
                    <ArabicText size="word" className="font-bold text-primary">
                      {r.result}
                    </ArabicText>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 rounded-3xl border border-amber-500/40 bg-accent-soft/70 p-4">
              <h3 className="text-sm font-bold tracking-wide text-accent-strong uppercase">⚠️ Aturan & kesalahan umum</h3>
              <ul className="space-y-2 text-sm">
                {dhamir.rules.map((rule) => (
                  <li key={rule} className="flex gap-2">
                    <span aria-hidden="true">✔️</span>
                    <span>
                      <MixedText text={rule} />
                    </span>
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl bg-surface p-3">
                <h4 className="mb-1 text-sm font-semibold">Salah vs Benar: kata ber-dhamir tanpa alif-lam</h4>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th scope="col" className="border-b border-border px-2 py-1 text-left text-sm font-semibold">
                        ❌ Salah
                      </th>
                      <th scope="col" className="border-b border-border px-2 py-1 text-left text-sm font-semibold">
                        ✅ Benar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dhamir.wrong_right.map(([wrong, right]) => (
                      <tr key={wrong}>
                        <td className="border-b border-border px-2 py-0.5">
                          <ArabicText size="word" className="text-red-700 line-through decoration-2 dark:text-red-300">
                            {wrong}
                          </ArabicText>
                        </td>
                        <td className="border-b border-border px-2 py-0.5">
                          <ArabicText size="word" className="font-bold text-emerald-700 dark:text-emerald-300">
                            {right}
                          </ArabicText>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <DhamirBuilder />
            <MiniQuiz
              title="Mini-quiz: Dhamir"
              types={['dhamir_choose', 'dhamir_identify', 'fix_al']}
              done={doneDhamir}
              onFinish={() => markDone(FLAG_DHAMIR)}
            />
          </section>
        )}

        {tab === 'warna' && (
          <section id="warna" aria-labelledby="warna-h" className="space-y-4">
            <SectionHeading id="warna-h">
              <MixedText text={lawn.title} />
            </SectionHeading>
            <p className="rounded-2xl border border-amber-500/40 bg-accent-soft/70 p-3 text-sm">
              <MixedText text={lawn.color_form_rule} />
            </p>
            <ol className="space-y-3">
              {lawn.patterns.map((p, i) => (
                <li key={p.name} className="card space-y-1 rounded-3xl p-4">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                    >
                      {i + 1}
                    </span>
                    <MixedText text={p.name} />
                  </h3>
                  <ArabicText as="p" size="word" className="rounded-2xl bg-surface-alt px-3 text-primary">
                    {p.example}
                  </ArabicText>
                  <p className="text-sm text-muted italic">{p.id_meaning}</p>
                  <p className="text-sm">
                    <MixedText text={p.rule} />
                  </p>
                </li>
              ))}
            </ol>
            <ColorSimulator />
            <MiniQuiz
              title="Mini-quiz: Warna"
              types={['lawn_pronoun', 'color_form']}
              done={doneWarna}
              onFinish={() => markDone(FLAG_WARNA)}
            />
          </section>
        )}

        {tab === 'isyarah' && (
          <section id="isyarah" aria-labelledby="isyarah-h" className="space-y-4">
            <SectionHeading id="isyarah-h">Isim Isyarah (kata tunjuk)</SectionHeading>
            <p>Pilih kata tunjuk sesuai gender bendanya: mudzakkar atau mu&apos;annats, dekat atau jauh.</p>
            <ul className="grid grid-cols-2 gap-2">
              {(['m', 'f'] as const).flatMap((g) =>
                (['dekat', 'jauh'] as const).map((d) => {
                  const item = content.demonstratives.find((x) => x.gender === g && x.distance === d);
                  return (
                    <li key={`${g}-${d}`} className="card flex flex-col items-center rounded-2xl p-3 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          g === 'm' ? 'bg-primary-soft text-primary' : 'bg-accent-soft text-accent-strong'
                        }`}
                      >
                        {g === 'm' ? 'Mudzakkar' : "Mu'annats"} · {d}
                      </span>
                      {item && (
                        <>
                          <ArabicText size="word" className="font-bold">
                            {item.ar}
                          </ArabicText>
                          <span className="text-xs text-muted">{item.id_meaning}</span>
                        </>
                      )}
                    </li>
                  );
                }),
              )}
            </ul>
          </section>
        )}
      </div>

      <NextModuleLink href="/latihan" label="Lanjut ke Latihan" sub="10 soal campuran dengan pembahasan" />
    </div>
  );
}
