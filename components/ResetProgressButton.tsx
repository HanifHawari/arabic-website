'use client';

import { useState } from 'react';
import { useProgress } from '@/hooks/useProgress';

/** Reset progres dengan konfirmasi dua langkah. */
export function ResetProgressButton() {
  const { reset } = useProgress();
  const [confirming, setConfirming] = useState(false);
  const [doneMsg, setDoneMsg] = useState(false);

  if (confirming) {
    return (
      <div role="alertdialog" aria-label="Konfirmasi reset progres" className="flex flex-wrap items-center gap-2 text-sm">
        <span>Yakin hapus semua progres? Ini tidak bisa dibatalkan.</span>
        <button
          type="button"
          autoFocus
          onClick={() => {
            reset();
            setConfirming(false);
            setDoneMsg(true);
          }}
          className="rounded-full bg-red-700 px-3 py-1.5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        >
          Ya, hapus
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-border px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-primary"
        >
          Batal
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <button
        type="button"
        onClick={() => {
          setDoneMsg(false);
          setConfirming(true);
        }}
        className="rounded-full border border-border px-3 py-1.5 text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
      >
        Reset progres
      </button>
      {doneMsg && <span role="status">Progres sudah dihapus.</span>}
    </div>
  );
}
