import type { ReactNode } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { ArchMotif } from '@/components/ArchMotif';
import { content } from '@/lib/content';
import type { ModuleId } from '@/lib/progress';

interface PageHeroProps {
  moduleId: ModuleId;
  /** Judul halaman (Bahasa Indonesia), jadi <h1>. */
  title: string;
  description?: ReactNode;
  /** Isi tambahan di bawah deskripsi (mis. ringkasan progres). */
  children?: ReactNode;
}

/** Banner judul tiap modul: gradasi zamrud + motif lengkung, judul Arab dari JSON. */
export function PageHero({ moduleId, title, description, children }: PageHeroProps) {
  return (
    <section className="hero-gradient relative overflow-hidden rounded-3xl px-5 py-5 text-white shadow-md sm:px-6">
      <ArchMotif className="pointer-events-none absolute -right-8 -bottom-10 h-40 w-40 text-white opacity-10" />
      <div className="relative">
        <ArabicText as="p" size="word" className="text-white">
          {content.module_titles[moduleId]}
        </ArabicText>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="mt-1 text-sm leading-relaxed text-emerald-50/85">{description}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </section>
  );
}
