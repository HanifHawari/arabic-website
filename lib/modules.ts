import type { ModuleId } from '@/lib/progress';

export interface ModuleInfo {
  id: ModuleId;
  href: string;
  title: string;
  subtitle: string;
  icon: string;
}

/** Urutan kartu di beranda (PRD F1). */
export const MODULES: readonly ModuleInfo[] = [
  { id: 'mufradat', href: '/mufradat', title: 'Mufradat', subtitle: 'Kosakata & warna', icon: '🗂️' },
  { id: 'nushush', href: '/nushush', title: 'Nushush', subtitle: 'Teks bacaan', icon: '📖' },
  { id: 'hiwar', href: '/hiwar', title: 'Hiwar', subtitle: 'Dialog & role-play', icon: '💬' },
  { id: 'tarkib', href: '/tarkib', title: 'Tarkib', subtitle: 'Kaidah dhamir & warna', icon: '🧩' },
  { id: 'latihan', href: '/latihan', title: 'Latihan', subtitle: 'Kuis campuran', icon: '✅' },
  { id: 'istima', href: '/istima', title: "Istima'", subtitle: 'Menyimak', icon: '🎧' },
  { id: 'produksi', href: '/produksi', title: 'Produksi Teks', subtitle: 'Menulis sendiri', icon: '✍️' },
];

export const moduleById = (id: ModuleId): ModuleInfo => MODULES.find((m) => m.id === id)!;

/** Modul sebelum/sesudah (untuk navigasi panah di Mode Kelas). */
export function adjacentModule(href: string, dir: 1 | -1): ModuleInfo | null {
  const order = [{ href: '/' } as ModuleInfo, ...MODULES];
  const i = order.findIndex((m) => m.href === href);
  if (i === -1) return null;
  const next = order[i + dir];
  return next && next.href !== '/' ? next : null;
}
