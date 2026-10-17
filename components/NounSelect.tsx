'use client';

import { useId } from 'react';
import type { AttachableVocab } from '@/types/content';

interface NounSelectProps {
  nouns: AttachableVocab[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
}

/** Pilihan benda (pakai arti Indonesia; kata Arabnya ditampilkan besar di luar select). */
export function NounSelect({ nouns, value, onChange, label = 'Pilih benda' }: NounSelectProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 rounded-xl border border-border bg-surface px-3 py-2 focus-visible:outline-2 focus-visible:outline-primary"
      >
        {nouns.map((n) => (
          <option key={n.id} value={n.id}>
            {n.id_meaning} ({n.gender === 'm' ? 'mudzakkar' : "mu'annats"})
          </option>
        ))}
      </select>
    </div>
  );
}
