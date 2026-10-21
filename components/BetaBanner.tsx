/** Banner sementara (SKILL.md §10): harakat hasil transkripsi, belum dicek guru. */
export function BetaBanner() {
  return (
    <div role="note" className="hide-in-class bg-notice-bg text-notice-fg print:hidden">
      <div className="mx-auto flex max-w-5xl items-start gap-2 px-4 py-2 text-xs leading-relaxed sm:items-center">
        <span aria-hidden="true" className="text-sm">
          📝
        </span>
        <p>
          <span className="font-bold tracking-wide uppercase">Catatan · </span>
          Konten beta — harakat & arti sedang dicek guru. Kalau nemu yang aneh, kasih tahu gurumu ya.
        </p>
      </div>
    </div>
  );
}
