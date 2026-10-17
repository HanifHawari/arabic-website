export function ProgressBar({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold">{v}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        className="h-3 w-full rounded-full bg-border"
      >
        <div className="h-3 rounded-full bg-primary transition-[width]" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
