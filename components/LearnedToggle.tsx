'use client';

interface LearnedToggleProps {
  learned: boolean;
  onToggle: () => void;
  label: string;
}

/** Tombol "sudah hafal" (aria-pressed). */
export function LearnedToggle({ learned, onToggle, label }: LearnedToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={learned}
      aria-label={`Tandai sudah hafal: ${label}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`min-h-9 rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        learned
          ? 'border-emerald-600 bg-emerald-600 text-white'
          : 'border-border bg-surface text-foreground hover:border-emerald-600'
      }`}
    >
      {learned ? '✓ Hafal' : 'Sudah hafal?'}
    </button>
  );
}
