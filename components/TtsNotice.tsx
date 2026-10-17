'use client';

import { useState } from 'react';
import { useAudio } from '@/hooks/useAudio';

// Disimpan di memori modul: sekali ditutup, tidak muncul lagi selama tab terbuka.
let dismissedThisSession = false;

/**
 * Pesan fallback kalau perangkat tidak punya suara Arab (PRD F7).
 * Tampil sebagai toast `fixed` supaya tidak menggeser layout saat muncul belakangan (CLS/LCP).
 */
export function TtsNotice() {
  const { ttsStatus, recordedCount } = useAudio();
  const [dismissed, setDismissed] = useState(dismissedThisSession);
  if (ttsStatus !== 'unavailable' || dismissed) return null;
  return (
    <div
      role="status"
      className="hide-in-class fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-start gap-2 rounded-xl border border-border bg-notice-bg px-3 py-2 text-xs text-notice-fg shadow-lg print:hidden"
    >
      <details className="flex-1">
        <summary className="cursor-pointer">
          {recordedCount > 0
            ? '🔇 Suara Arab perangkat tidak tersedia — hanya audio rekaman yang bisa diputar.'
            : '🔇 Suara Arab tidak tersedia di perangkat ini — baca teksnya ya.'}
        </summary>
        <p className="mt-1">Tips: pakai Chrome di Android, atau pasang suara &quot;Arabic&quot; di pengaturan Text-to-Speech HP.</p>
      </details>
      <button
        type="button"
        onClick={() => {
          dismissedThisSession = true;
          setDismissed(true);
        }}
        aria-label="Tutup pesan audio"
        className="-my-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base leading-none focus-visible:outline-2 focus-visible:outline-primary"
      >
        ✕
      </button>
    </div>
  );
}
