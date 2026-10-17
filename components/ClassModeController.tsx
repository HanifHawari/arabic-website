'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { dispatchArrow } from '@/hooks/useArrowNav';
import { useSettings } from '@/hooks/useSettings';
import { adjacentModule } from '@/lib/modules';

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/**
 * Mode Kelas (F10): font Arab ekstra besar, navigasi disembunyikan,
 * panah kiri/kanan = sebelumnya/berikutnya (item di halaman, atau modul), Esc = keluar.
 */
export function ClassModeController() {
  const { settings, update } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const on = settings.classMode;

  useEffect(() => {
    const root = document.documentElement;
    if (on) root.dataset.classMode = 'on';
    else delete root.dataset.classMode;
  }, [on]);

  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || isTyping(e.target)) return;
      if (e.key === 'Escape') {
        update({ classMode: false });
        return;
      }
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      if (dispatchArrow(dir)) return;
      const next = adjacentModule(pathname, dir);
      if (next) router.push(next.href);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [on, pathname, router, update]);

  if (!on) return null;
  return (
    <div className="fixed right-3 bottom-3 z-50 flex items-center gap-2 print:hidden">
      <span className="hidden rounded-full bg-surface/90 px-3 py-1.5 text-xs text-muted shadow sm:inline">
        ← → pindah · Esc keluar
      </span>
      <button
        type="button"
        onClick={() => update({ classMode: false })}
        className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Keluar Mode Kelas
      </button>
    </div>
  );
}
