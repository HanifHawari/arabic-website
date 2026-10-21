/** Motif lengkung mihrab + bintang (SVG buatan sendiri) untuk latar banner. */
export function ArchMotif({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" fill="none" stroke="currentColor" className={className}>
      <path d="M100 0C145 0 180 35 180 80V200H20V80C20 35 55 0 100 0Z" strokeWidth="4" />
      <path d="M100 24C132 24 158 50 158 84V190H42V84C42 50 68 24 100 24Z" strokeWidth="2" />
      <circle cx="100" cy="110" r="32" strokeWidth="2" strokeDasharray="4 4" />
      <path
        d="M100 50L108 72H130L112 86L118 108L100 94L82 108L88 86L70 72H92Z"
        fill="currentColor"
        stroke="none"
        opacity="0.4"
      />
    </svg>
  );
}
