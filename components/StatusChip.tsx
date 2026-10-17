import type { ModuleStatus } from '@/lib/progress';

const STYLE: Record<ModuleStatus, { text: string; cls: string }> = {
  belum: { text: 'Belum', cls: 'border-border text-muted' },
  sedang: { text: 'Sedang', cls: 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-200' },
  selesai: { text: 'Selesai ✓', cls: 'border-emerald-600/50 bg-emerald-600/10 text-emerald-800 dark:text-emerald-200' },
};

export function StatusChip({ status }: { status: ModuleStatus }) {
  const s = STYLE[status];
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.text}</span>;
}
