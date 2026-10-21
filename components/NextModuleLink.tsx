import Link from 'next/link';

/** Tombol besar di akhir halaman menuju modul berikutnya (alur belajar PRD §9). */
export function NextModuleLink({ href, label, sub }: { href: string; label: string; sub?: string }) {
  return (
    <Link
      href={href}
      className="hide-in-class hero-gradient flex items-center justify-between gap-3 rounded-2xl px-5 py-4 text-white shadow-md active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary print:hidden"
    >
      <span className="min-w-0">
        <span className="block font-display text-lg font-bold">{label}</span>
        {sub && <span className="block text-xs text-emerald-100/90">{sub}</span>}
      </span>
      <span aria-hidden="true" className="text-2xl">
        →
      </span>
    </Link>
  );
}
