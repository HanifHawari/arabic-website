'use client';

import { useEffect, useState } from 'react';
import { TadribPlayer } from '@/components/istima/TadribPlayer';
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
      <div>
        <h1 className="text-2xl font-bold">Istima&apos; (Menyimak)</h1>
        <p className="text-muted">Dengarkan baik-baik, lalu pilih jawaban yang tepat. Bisa diputar ulang dan diperlambat.</p>
      </div>
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
    </div>
  );
}
