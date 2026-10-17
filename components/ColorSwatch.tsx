/** Kotak warna materi; warnanya dari `hex` JSON (bukan class Tailwind). */
export function ColorSwatch({ hex, label, className = 'h-12 w-12' }: { hex: string; label?: string; className?: string }) {
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block shrink-0 rounded-xl border-2 border-foreground/20 ${className}`}
      style={{ backgroundColor: hex }}
    />
  );
}
