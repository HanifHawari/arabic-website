// Utilitas teks campuran Indonesia/Arab. Tidak mengubah harakat.

/** Run Arab: mulai & berakhir dengan huruf Arab, boleh berisi spasi, titik-titik, dan tanda baca Arab. */
const ARABIC_RUN = /[؀-ۿݐ-ݿ](?:[؀-ۿݐ-ݿ\s.…]*[؀-ۿݐ-ݿ])?/g;

export interface TextRun {
  text: string;
  ar: boolean;
}

/** Pecah teks campuran jadi potongan Arab & non-Arab (untuk dibungkus <ArabicText>). */
export function splitArabicRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let last = 0;
  for (const m of text.matchAll(ARABIC_RUN)) {
    const start = m.index ?? 0;
    if (start > last) runs.push({ text: text.slice(last, start), ar: false });
    runs.push({ text: m[0], ar: true });
    last = start + m[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), ar: false });
  return runs;
}

/** Pecah paragraf jadi kalimat (setelah . ؟ ? !), tanda baca tetap ikut kalimatnya. */
export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.؟?!])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Arti ringkas untuk kalimat terjemahan: "meja (kerja/guru)" → "meja", "pena / pulpen" → "pena". */
export function shortMeaning(idMeaning: string): string {
  return idMeaning.replace(/\s*\([^)]*\)/g, '').split('/')[0].trim();
}

/** Huruf pertama kapital. */
export const capitalize = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1) : s);
