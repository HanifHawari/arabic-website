'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { useSettings } from '@/hooks/useSettings';
import { MODULES } from '@/lib/modules';

export function SiteHeader() {
  const pathname = usePathname();
  const { settings, update } = useSettings();
  const navRef = useRef<HTMLElement>(null);

  // Di layar sempit menu bisa digeser; geser otomatis supaya halaman aktif terlihat di tengah.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active) return;
    nav.scrollTo({ left: active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2 });
  }, [pathname, settings.classMode]);

  if (settings.classMode) return null;

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="border-b border-border bg-surface print:hidden">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2">
        <Link href="/" className="mr-auto rounded-lg px-1 py-1 text-base font-bold text-primary focus-visible:outline-2 focus-visible:outline-primary">
          Bahasa Arab · Bab 3
        </Link>
        <ToggleSwitch label="Harakat" checked={settings.showHarakat} onChange={(v) => update({ showHarakat: v })} />
        <button
          type="button"
          aria-label="Mode Kelas (tampilan proyektor)"
          onClick={() => update({ classMode: true })}
          className="min-h-9 rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span aria-hidden="true">📽️ </span>
          <span className="hidden min-[400px]:inline">Mode </span>Kelas
        </button>
      </div>
      <nav ref={navRef} aria-label="Modul" className="scrollbar-none relative mx-auto max-w-5xl overflow-x-auto px-2">
        <ul className="flex gap-1 pb-2">
          {[{ href: '/', title: 'Beranda', id: 'home' }, ...MODULES].map((m) => (
            <li key={m.id}>
              <Link
                href={m.href}
                aria-current={isActive(m.href) ? 'page' : undefined}
                className={`block whitespace-nowrap rounded-full px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-primary ${
                  isActive(m.href) ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted hover:bg-background hover:text-foreground'
                }`}
              >
                {m.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
