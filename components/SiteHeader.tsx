'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { MODULES } from '@/lib/modules';

const NAV = [{ href: '/', title: 'Beranda', id: 'home' }, ...MODULES];

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
  const current = NAV.find((m) => isActive(m.href));

  return (
    <header
      className="sticky top-0 z-40 border-b border-border backdrop-blur-xl print:hidden"
      style={{ background: 'var(--header-bg)' }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 pt-2.5 pb-1.5">
        <Link
          href="/"
          className="mr-auto flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.5C10 5 7.5 4.5 4 4.8v13c3.5-.3 6 .2 8 1.7 2-1.5 4.5-2 8-1.7v-13c-3.5-.3-6 .2-8 1.7Z" />
              <path d="M12 6.5v13" />
            </svg>
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[11px] font-bold tracking-wider text-accent-strong uppercase">
              <span className="hidden min-[400px]:inline">Bahasa Arab · </span>Bab 3
            </span>
            <span className="truncate font-display text-lg leading-tight font-semibold text-primary">
              {current?.title ?? 'Beranda'}
            </span>
          </span>
        </Link>
        <button
          type="button"
          role="switch"
          aria-checked={settings.showHarakat}
          onClick={() => update({ showHarakat: !settings.showHarakat })}
          className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            settings.showHarakat ? 'bg-primary-soft text-primary' : 'bg-surface-alt text-muted'
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${settings.showHarakat ? 'bg-primary' : 'border border-muted'}`}
          />
          Harakat
        </button>
        <button
          type="button"
          aria-label="Mode Kelas (tampilan proyektor)"
          onClick={() => update({ classMode: true })}
          className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full bg-accent px-3 text-xs font-bold text-accent-foreground transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span aria-hidden="true">🎓</span>
          <span className="hidden min-[400px]:inline">Mode </span>Kelas
        </button>
      </div>
      <nav ref={navRef} aria-label="Modul" className="scrollbar-none relative mx-auto max-w-5xl overflow-x-auto px-4">
        <ul className="flex gap-1.5 pt-1 pb-2.5">
          {NAV.map((m) => (
            <li key={m.id}>
              <Link
                href={m.href}
                aria-current={isActive(m.href) ? 'page' : undefined}
                className={`flex h-8 items-center whitespace-nowrap rounded-full px-3.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                  isActive(m.href)
                    ? 'bg-primary font-semibold text-primary-foreground shadow-sm'
                    : 'bg-surface-alt font-medium text-muted hover:text-foreground'
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
