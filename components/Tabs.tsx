'use client';

import { useRef } from 'react';

interface TabsProps<T extends string> {
  tabs: readonly { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  idPrefix: string;
  /** 'segmented' = kotak terbagi rata; 'chips' = deretan pil yang bisa digeser (HP). */
  variant?: 'segmented' | 'chips';
}

/** Tablist ARIA dengan roving tabindex (panah kiri/kanan, Home/End). */
export function Tabs<T extends string>({ tabs, value, onChange, label, idPrefix, variant = 'segmented' }: TabsProps<T>) {
  const chips = variant === 'chips';
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === -1) return;
    e.preventDefault();
    e.stopPropagation();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={
        chips
          ? 'scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 py-0.5'
          : `grid gap-1 rounded-2xl bg-surface-alt p-1 sm:flex ${tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`
      }
    >
      {tabs.map((t, i) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
              chips ? 'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5' : 'flex-1 rounded-xl px-3 py-2'
            } ${
              selected
                ? `bg-primary font-semibold text-primary-foreground shadow-sm ${chips ? 'border-primary' : ''}`
                : `text-muted hover:text-foreground ${chips ? 'border-border bg-surface' : ''}`
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span
                className={`rounded-full px-1.5 text-xs font-bold ${selected ? 'bg-white/20 text-primary-foreground' : 'bg-surface-alt text-muted'}`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
