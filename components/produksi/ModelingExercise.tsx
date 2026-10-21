'use client';

import { useState } from 'react';
import { ArabicText } from '@/components/ArabicText';
import { content } from '@/lib/content';
import { splitSentences } from '@/lib/text';

const PARTS = [
  { id: 'pembuka', label: 'Pembuka', cls: 'border-sky-600 bg-sky-600/10' },
  { id: 'isi', label: 'Isi', cls: 'border-amber-600 bg-amber-600/10' },
  { id: 'penutup', label: 'Penutup', cls: 'border-emerald-600 bg-emerald-600/10' },
] as const;
type Part = (typeof PARTS)[number]['id'];

/** Pemodelan teks (F8): siswa menandai struktur teks sendiri. Tidak ada kunci jawaban otomatis. */
export function ModelingExercise() {
  const [tags, setTags] = useState<Record<string, Part>>({});

  return (
    <div className="space-y-4">
      <div className="space-y-1 card rounded-2xl p-4 text-sm">
        <p className="font-semibold">Struktur teks deskripsi:</p>
        <ul className="list-disc space-y-1 ps-5">
          <li>
            <strong>Pembuka</strong> — perkenalan: siapa/apa yang dibicarakan.
          </li>
          <li>
            <strong>Isi</strong> — deskripsi benda dan warnanya.
          </li>
          <li>
            <strong>Penutup</strong> — kesimpulan atau kesan (kadang tidak ada!).
          </li>
        </ul>
        <p className="text-muted">Tandai setiap kalimat. Kalau tidak ada penutupnya, coba tulis sendiri di tab &quot;Mandiri&quot;.</p>
      </div>
      {content.texts.nash.map((n) => (
        <section key={n.id} className="space-y-2">
          <h2 className="font-bold">{n.title}</h2>
          <ol className="space-y-2">
            {splitSentences(n.ar).map((s, i) => {
              const key = `${n.id}-${i}`;
              const tag = tags[key];
              const part = PARTS.find((p) => p.id === tag);
              return (
                <li key={key} className={`space-y-2 rounded-xl border-2 p-3 ${part ? part.cls : 'border-border bg-surface'}`}>
                  <ArabicText as="p" size="para">
                    {s}
                  </ArabicText>
                  <div role="group" aria-label={`Bagian untuk kalimat ${i + 1}`} className="flex flex-wrap gap-1">
                    {PARTS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={tag === p.id}
                        onClick={() => setTags((t) => ({ ...t, [key]: p.id }))}
                        className={`rounded-full border px-3 py-1 text-sm focus-visible:outline-2 focus-visible:outline-primary ${
                          tag === p.id ? 'border-foreground bg-foreground text-background' : 'border-border bg-surface'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
