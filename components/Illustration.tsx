import { illustrationFor, type SvgIcon } from '@/lib/illustrations';

// Ikon SVG sederhana buatan sendiri untuk benda yang tidak punya emoji yang cocok.
const PATHS: Record<SvgIcon, React.ReactNode> = {
  blackboard: (
    <>
      <rect x="6" y="8" width="52" height="36" rx="3" fill="#1f5135" stroke="#7a4a21" strokeWidth="4" />
      <path d="M14 20h18M14 28h26" stroke="#e8f5e9" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 44l-6 12M42 44l6 12" stroke="#7a4a21" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  desk: (
    <>
      <rect x="6" y="20" width="52" height="8" rx="2" fill="#a0683a" />
      <rect x="10" y="28" width="18" height="18" rx="2" fill="#8a5a31" />
      <path d="M14 34h10M14 40h10" stroke="#f3d9b5" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 28v26M12 46v8" stroke="#8a5a31" strokeWidth="4" strokeLinecap="round" />
    </>
  ),
  sharpener: (
    <>
      <rect x="14" y="22" width="30" height="24" rx="4" fill="#e53935" />
      <rect x="44" y="26" width="8" height="16" rx="2" fill="#9e9e9e" />
      <circle cx="26" cy="34" r="5" fill="#212121" />
      <path d="M4 34h17" stroke="#fdd835" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  pencilCase: (
    <>
      <rect x="6" y="20" width="52" height="26" rx="10" fill="#1e63d6" />
      <path d="M12 24h40" stroke="#bbdefb" strokeWidth="3" strokeDasharray="3 3" />
      <circle cx="50" cy="33" r="3" fill="#fdd835" />
    </>
  ),
  eraser: (
    <>
      <g transform="rotate(-20 32 32)">
        <rect x="10" y="22" width="44" height="20" rx="4" fill="#ec407a" />
        <rect x="10" y="22" width="16" height="20" rx="4" fill="#f5f5f5" />
      </g>
    </>
  ),
  rug: (
    <>
      <rect x="8" y="16" width="48" height="32" rx="2" fill="#b71c1c" />
      <rect x="14" y="22" width="36" height="20" fill="none" stroke="#fdd835" strokeWidth="2.5" />
      <path d="M8 16v-4M16 16v-4M24 16v-4M32 16v-4M40 16v-4M48 16v-4M56 16v-4M8 48v4M16 48v4M24 48v4M32 48v4M40 48v4M48 48v4M56 48v4" stroke="#fdd835" strokeWidth="2" />
    </>
  ),
};

/** Ilustrasi dekoratif (aria-hidden); arti kata selalu ditulis terpisah. */
export function Illustration({ vocabId, className = '' }: { vocabId: string; className?: string }) {
  const spec = illustrationFor(vocabId);
  if (spec.kind === 'emoji') {
    return (
      <span aria-hidden="true" className={`inline-block text-4xl leading-none ${className}`}>
        {spec.value}
      </span>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" className={`inline-block h-10 w-10 ${className}`}>
      {PATHS[spec.value]}
    </svg>
  );
}
