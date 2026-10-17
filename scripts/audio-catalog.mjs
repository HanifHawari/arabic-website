// Katalog teks yang bisa direkam (satu sumber untuk app, halaman /rekam, API simpan, dan generator TTS).
// Ditulis sebagai .mjs tanpa dependensi supaya bisa dijalankan langsung oleh Node di scripts/.

/** Pecah paragraf jadi kalimat (setelah . ؟ ? !); sama dengan splitSentences di lib/text.ts. */
export const splitSentences = (text) =>
  text
    .split(/(?<=[.؟?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * @param {import('../types/content').Bab3Content} c
 * @returns {{ key: string; group: 'vocab' | 'warna' | 'inda' | 'nash' | 'hiwar'; text: string; label: string }[]}
 */
export function buildAudioCatalog(c) {
  const items = [];
  for (const v of [...c.vocab.sekolah, ...c.vocab.kelas]) {
    items.push({ key: `vocab/${v.id}`, group: 'vocab', text: v.ar, label: v.id_meaning });
  }
  for (const col of c.colors) {
    items.push({ key: `warna/${col.id}-m`, group: 'warna', text: col.m, label: `${col.id_meaning} (mudzakkar)` });
    items.push({ key: `warna/${col.id}-f`, group: 'warna', text: col.f, label: `${col.id_meaning} (mu'annats)` });
  }
  for (const p of c.pronouns) {
    items.push({ key: `inda/${p.id}`, group: 'inda', text: p.inda, label: `${p.id_meaning} punya` });
  }
  for (const n of c.texts.nash) {
    splitSentences(n.ar).forEach((s, i) => {
      items.push({ key: `nash/${n.id}-${i + 1}`, group: 'nash', text: s, label: `${n.title}, kalimat ${i + 1}` });
    });
  }
  for (const h of c.texts.hiwar) {
    h.lines.forEach((l, i) => {
      const n = String(i + 1).padStart(2, '0');
      items.push({ key: `hiwar/${h.id}-${n}`, group: 'hiwar', text: l.ar, label: `${h.title}, baris ${i + 1}` });
    });
  }
  return items;
}
