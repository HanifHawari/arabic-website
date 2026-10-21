'use client';

import { useEffect, useState } from 'react';
import { TadribPlayer } from '@/components/istima/TadribPlayer';
import { NextModuleLink } from '@/components/NextModuleLink';
import { PageHero } from '@/components/PageHero';
import { Tabs } from '@/components/Tabs';
import { TtsNotice } from '@/components/TtsNotice';
import { useModuleVisit, useProgress } from '@/hooks/useProgress';
import { TADRIB, type TadribId } from '@/lib/istima';
import { isDone } from '@/lib/progress';

const flag = (id: TadribId) => `istima:${id}`;

export function IstimaView() {
  useModuleVisit('istima');
  const { progress, markDone, recordScore, setModuleStatus } = useProgress();
  const [tab, setTab] = useState<TadribId>('t1');
  const current = TADRIB.find((t) => t.id === tab)!;
  const allDone = TADRIB.every((t) => isDone(progress, flag(t.id)));

  useEffect(() => {
    if (allDone) setModuleStatus('istima', 'selesai');
  }, [allDone, setModuleStatus]);

  return (
    <div className="space-y-5">
      <PageHero
        moduleId="istima"
        title="Istima' (Menyimak)"
        description="Dengarkan baik-baik, lalu pilih jawaban yang tepat. Bisa diputar ulang dan diperlambat."
      />
      <TtsNotice />
      <Tabs
        tabs={TADRIB.map((t) => ({ id: t.id, label: `${isDone(progress, flag(t.id)) ? '✓ ' : ''}${t.title}` }))}
        value={tab}
        onChange={setTab}
        label="Pilih tadrib"
        idPrefix="istima"
      />
      <div id="istima-panel" role="tabpanel" aria-labelledby={`istima-tab-${tab}`}>
        <TadribPlayer
          key={tab}
          id={tab}
          desc={current.desc}
          done={isDone(progress, flag(tab))}
          onFinish={(score, total) => {
            markDone(flag(tab));
            recordScore(flag(tab), (score / total) * 100);
          }}
        />
      </div>
      <NextModuleLink href="/produksi" label="Lanjut ke Produksi Teks" sub="Menulis teks pendekmu sendiri" />
    </div>
  );
}
