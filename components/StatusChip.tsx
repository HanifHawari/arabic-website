import type { ModuleStatus } from '@/lib/progress';

const STYLE: Record<ModuleStatus, { text: string; cls: string }> = {
  belum: { text: 'Belum', cls: 'bg-surface-alt text-muted' },
  sedang: { text: 'Sedang', cls: 'bg-accent-soft text-accent-strong' },
  selesai: { text: 'Selesai ✓', cls: 'bg-primary-soft text-primary' },
};

export function StatusChip({ status }: { status: ModuleStatus }) {
  const s = STYLE[status];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${s.cls}`}>{s.text}</span>;
}
