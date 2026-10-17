'use client';

import { useEffect } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { MixedText } from '@/components/MixedText';
import { MiniQuiz } from '@/components/quiz/MiniQuiz';
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

const th = 'border-b border-border px-3 py-2 text-left text-sm font-semibold';
const td = 'border-b border-border px-3 py-1 align-middle';

export function TarkibView() {
  useModuleVisit('tarkib');
  const { progress, markDone, setModuleStatus } = useProgress();
  const doneDhamir = isDone(progress, FLAG_DHAMIR);
  const doneWarna = isDone(progress, FLAG_WARNA);

  useEffect(() => {
    if (doneDhamir && doneWarna) setModuleStatus('tarkib', 'selesai');
  }, [doneDhamir, doneWarna, setModuleStatus]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Tarkib (Kaidah)</h1>
        <nav aria-label="Bagian kaidah" className="mt-2 flex flex-wrap gap-2 text-sm">
          <a href="#dhamir" className="rounded-full border border-border px-3 py-1 hover:border-primary">
            1. Dhamir muttashil
          </a>
          <a href="#warna" className="rounded-full border border-border px-3 py-1 hover:border-primary">
            2. Menyatakan warna
          </a>
          <a href="#isyarah" className="rounded-full border border-border px-3 py-1 hover:border-primary">
            3. Isim isyarah
          </a>
        </nav>
      </div>

      {/* 1. Dhamir muttashil */}
      <section id="dhamir" aria-labelledby="dhamir-h" className="scroll-mt-4 space-y-4">
        <h2 id="dhamir-h" className="text-xl font-bold">
          1. <MixedText text={dhamir.title} />
        </h2>
        <p>{dhamir.summary}</p>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full">
            <caption className="px-3 pt-3 text-left text-sm text-muted">
              Contoh dengan kata{' '}
              <ArabicText as="bdi" className="text-xl">
                {dhamir.table_example_base}
              </ArabicText>
            </caption>
            <thead>
              <tr>
                <th scope="col" className={th}>Dhamir</th>
                <th scope="col" className={th}>Akhiran</th>
                <th scope="col" className={th}>Hasil</th>
                <th scope="col" className={th}>Arti</th>
              </tr>
            </thead>
            <tbody>
              {dhamir.rows.map((r) => (
                <tr key={r.pronoun}>
                  <td className={td}>
                    <ArabicText className="text-2xl">{r.pronoun}</ArabicText>
                  </td>
                  <td className={td}>
                    <ArabicText className="text-2xl">{r.suffix}</ArabicText>
                  </td>
                  <td className={td}>
                    <ArabicText className="text-2xl font-bold">{r.result}</ArabicText>
                  </td>
                  <td className={`${td} text-sm`}>{r.id_meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="list-disc space-y-1 ps-5">
          {dhamir.rules.map((rule) => (
            <li key={rule}>
              <MixedText text={rule} />
            </li>
          ))}
        </ul>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-2 font-bold">Salah vs Benar: kata ber-dhamir tanpa alif-lam</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th scope="col" className={th}>❌ Salah</th>
                <th scope="col" className={th}>✅ Benar</th>
              </tr>
            </thead>
            <tbody>
              {dhamir.wrong_right.map(([wrong, right]) => (
                <tr key={wrong}>
                  <td className={td}>
                    <ArabicText className="text-2xl text-red-700 line-through decoration-2 dark:text-red-300">{wrong}</ArabicText>
                  </td>
                  <td className={td}>
                    <ArabicText className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{right}</ArabicText>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DhamirBuilder />
        <MiniQuiz
          title="Mini-quiz: Dhamir"
          types={['dhamir_choose', 'dhamir_identify', 'fix_al']}
          done={doneDhamir}
          onFinish={() => markDone(FLAG_DHAMIR)}
        />
      </section>

      {/* 2. Warna */}
      <section id="warna" aria-labelledby="warna-h" className="scroll-mt-4 space-y-4">
        <h2 id="warna-h" className="text-xl font-bold">
          2. <MixedText text={lawn.title} />
        </h2>
        <p className="rounded-xl bg-notice-bg p-3 text-sm text-notice-fg">
          <MixedText text={lawn.color_form_rule} />
        </p>
        <ol className="space-y-3">
          {lawn.patterns.map((p) => (
            <li key={p.name} className="space-y-1 rounded-2xl border border-border bg-surface p-4">
              <h3 className="font-semibold">
                <MixedText text={p.name} />
              </h3>
              <ArabicText as="p" size="word">
                {p.example}
              </ArabicText>
              <p className="text-sm text-muted">{p.id_meaning}</p>
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

      {/* 3. Isim isyarah */}
      <section id="isyarah" aria-labelledby="isyarah-h" className="scroll-mt-4 space-y-4">
        <h2 id="isyarah-h" className="text-xl font-bold">
          3. Isim Isyarah (kata tunjuk)
        </h2>
        <p>Pilih kata tunjuk sesuai gender bendanya: mudzakkar atau mu&apos;annats, dekat atau jauh.</p>
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full">
            <thead>
              <tr>
                <th scope="col" className={th}>Gender</th>
                <th scope="col" className={th}>Dekat</th>
                <th scope="col" className={th}>Jauh</th>
              </tr>
            </thead>
            <tbody>
              {(['m', 'f'] as const).map((g) => (
                <tr key={g}>
                  <th scope="row" className={`${td} text-left text-sm font-medium`}>
                    {g === 'm' ? 'Mudzakkar' : "Mu'annats"}
                  </th>
                  {(['dekat', 'jauh'] as const).map((d) => {
                    const item = content.demonstratives.find((x) => x.gender === g && x.distance === d);
                    return (
                      <td key={d} className={td}>
                        {item && (
                          <>
                            <ArabicText className="text-2xl">{item.ar}</ArabicText>
                            <span className="block text-xs text-muted">{item.id_meaning}</span>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
