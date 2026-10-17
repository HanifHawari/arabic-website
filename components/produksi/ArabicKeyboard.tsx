'use client';

import { ArabicText } from '@/components/ArabicText';
import { HARAKAT_KEYS, LETTER_ROWS, PUNCT_KEYS, type KeyDef } from '@/lib/keyboard';

interface ArabicKeyboardProps {
  onInsert: (value: string) => void;
  onBackspace: () => void;
}

const keyCls =
  'flex min-h-11 min-w-0 items-center justify-center rounded-lg border border-border bg-surface text-2xl leading-none shadow-sm active:bg-primary/20 focus-visible:outline-2 focus-visible:outline-primary';

/** Keyboard Arab virtual (huruf + harakat). Tombol tidak mengambil fokus supaya kursor tetap di editor. */
export function ArabicKeyboard({ onInsert, onBackspace }: ArabicKeyboardProps) {
  const key = (k: KeyDef) => (
    <button
      key={k.name}
      type="button"
      aria-label={k.name}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onInsert(k.value)}
      className={keyCls}
    >
      <ArabicText showHarakat>{k.label}</ArabicText>
    </button>
  );

  return (
    <div role="group" aria-label="Keyboard Arab" dir="rtl" className="space-y-1.5 rounded-2xl border border-border bg-background p-2">
      {LETTER_ROWS.map((row, i) => (
        <div key={i} className="grid grid-cols-8 gap-1">
          {row.map(key)}
        </div>
      ))}
      <div className="grid grid-cols-8 gap-1 border-t border-border pt-1.5">{HARAKAT_KEYS.map(key)}</div>
      <div className="grid grid-cols-8 gap-1">
        {PUNCT_KEYS.map(key)}
        <button
          type="button"
          aria-label="spasi"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onInsert(' ')}
          className={`${keyCls} col-span-3 text-sm`}
        >
          spasi
        </button>
        <button
          type="button"
          aria-label="baris baru"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onInsert('\n')}
          className={`${keyCls} text-base`}
        >
          ↵
        </button>
        <button
          type="button"
          aria-label="hapus"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onBackspace}
          className={`${keyCls} text-base`}
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
