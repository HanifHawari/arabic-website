'use client';

export const SPEEDS = [0.75, 1] as const;
export type Speed = (typeof SPEEDS)[number];

/** Pilihan kecepatan audio 0.75× / 1×. */
export function SpeedToggle({ value, onChange }: { value: Speed; onChange: (s: Speed) => void }) {
  return (
    <div role="group" aria-label="Kecepatan audio" className="inline-flex rounded-full border border-border bg-surface p-0.5 text-sm">
      {SPEEDS.map((s) => (
        <button
          key={s}
          type="button"
          aria-pressed={value === s}
          onClick={() => onChange(s)}
          className={`rounded-full px-3 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-primary ${
            value === s ? 'bg-primary text-primary-foreground' : 'text-muted'
          }`}
        >
          {s}×
        </button>
      ))}
    </div>
  );
}
