'use client';

import type { ElementType, ReactNode } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { stripHarakat } from '@/lib/arabic';

type ArabicSize = 'word' | 'para' | 'hero' | 'inherit';

const SIZE_CLASS: Record<ArabicSize, string> = {
  word: 'text-arabic-word',
  para: 'text-arabic-para',
  hero: 'text-arabic-hero',
  inherit: '',
};

interface ArabicTextProps {
  children: ReactNode;
  /** Elemen pembungkus; pakai 'bdi' untuk kata Arab di tengah kalimat Indonesia. */
  as?: ElementType;
  size?: ArabicSize;
  /**
   * Paksa tampil/sembunyi harakat. Default: ikut setelan global.
   * Hanya berlaku untuk children string; data tidak diubah.
   */
  showHarakat?: boolean;
  className?: string;
}

/** Wrapper wajib untuk semua teks Arab: dir="rtl", lang="ar", font naskh. */
export function ArabicText({ children, as: Tag = 'span', size = 'inherit', showHarakat, className = '' }: ArabicTextProps) {
  const { settings } = useSettings();
  const harakat = showHarakat ?? settings.showHarakat;
  const content = !harakat && typeof children === 'string' ? stripHarakat(children) : children;
  const classes = ['font-arabic', SIZE_CLASS[size], className].filter(Boolean).join(' ');
  return (
    <Tag dir="rtl" lang="ar" className={classes}>
      {content}
    </Tag>
  );
}
