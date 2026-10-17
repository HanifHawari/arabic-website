'use client';

import { useState } from 'react';
import { GroupTemplate } from '@/components/produksi/GroupTemplate';
import { ModelingExercise } from '@/components/produksi/ModelingExercise';
import { WritingEditor } from '@/components/produksi/WritingEditor';
import { Tabs } from '@/components/Tabs';
import { useModuleVisit } from '@/hooks/useProgress';

const TABS = [
  { id: 'pemodelan', label: 'Pemodelan' },
  { id: 'kelompok', label: 'Berkelompok' },
  { id: 'mandiri', label: 'Mandiri' },
] as const;
type Tab = (typeof TABS)[number]['id'];

export function ProduksiView() {
  useModuleVisit('produksi');
  const [tab, setTab] = useState<Tab>('pemodelan');

  return (
    <div className="space-y-5">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold">Produksi Teks</h1>
        <p className="text-muted">Pelajari struktur teks, menulis bersama kelompok, lalu menulis sendiri.</p>
      </div>
      <div className="print:hidden">
        <Tabs tabs={TABS} value={tab} onChange={setTab} label="Tahap produksi teks" idPrefix="produksi" />
      </div>
      <div id="produksi-panel" role="tabpanel" aria-labelledby={`produksi-tab-${tab}`}>
        {tab === 'pemodelan' && <ModelingExercise />}
        {tab === 'kelompok' && <GroupTemplate />}
        {tab === 'mandiri' && <WritingEditor />}
      </div>
    </div>
  );
}
