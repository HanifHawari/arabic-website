interface ProgressBarProps {
  value: number;
  label: string;
  /** 'onDark' untuk dipakai di atas banner hijau (isi bar emas). */
  tone?: 'default' | 'onDark';
}

export function ProgressBar({ value, label, tone = 'default' }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const dark = tone === 'onDark';
  return (
    <div>
      <div className={`mb-1.5 flex justify-between gap-3 text-sm ${dark ? 'text-emerald-50' : ''}`}>
        <span>{label}</span>
        <span className={`font-bold ${dark ? 'text-amber-200' : 'text-primary'}`}>{v}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        className={`h-2.5 w-full overflow-hidden rounded-full ${dark ? 'bg-white/20' : 'bg-surface-alt'}`}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${dark ? 'bg-accent' : 'bg-primary'}`}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
