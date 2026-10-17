// Layout keyboard Arab virtual (F8): huruf hijaiyah + harakat + tanda baca Arab.

export interface KeyDef {
  /** Karakter yang disisipkan. */
  value: string;
  /** Tampilan tombol. */
  label: string;
  /** Nama untuk pembaca layar. */
  name: string;
}

const letter = (ch: string, name: string): KeyDef => ({ value: ch, label: ch, name: `huruf ${name}` });
/** Harakat ditampilkan di atas lingkaran putus-putus (◌) supaya terlihat. */
const mark = (ch: string, name: string): KeyDef => ({ value: ch, label: `◌${ch}`, name });

export const LETTER_ROWS: KeyDef[][] = [
  [
    letter('ا', 'alif'),
    letter('ب', 'ba'),
    letter('ت', 'ta'),
    letter('ث', 'tsa'),
    letter('ج', 'jim'),
    letter('ح', 'ha'),
    letter('خ', 'kha'),
    letter('د', 'dal'),
  ],
  [
    letter('ذ', 'dzal'),
    letter('ر', 'ra'),
    letter('ز', 'zai'),
    letter('س', 'sin'),
    letter('ش', 'syin'),
    letter('ص', 'shad'),
    letter('ض', 'dhad'),
    letter('ط', 'tha'),
  ],
  [
    letter('ظ', 'zha'),
    letter('ع', 'ain'),
    letter('غ', 'ghain'),
    letter('ف', 'fa'),
    letter('ق', 'qaf'),
    letter('ك', 'kaf'),
    letter('ل', 'lam'),
    letter('م', 'mim'),
  ],
  [
    letter('ن', 'nun'),
    letter('ه', 'ha (kecil)'),
    letter('و', 'wau'),
    letter('ي', 'ya'),
    letter('ة', 'ta marbuthah'),
    letter('ى', 'alif maqshurah'),
    letter('ء', 'hamzah'),
    letter('أ', 'alif hamzah atas'),
  ],
  [letter('إ', 'alif hamzah bawah'), letter('آ', 'alif mad'), letter('ؤ', 'wau hamzah'), letter('ئ', 'ya hamzah')],
];

export const HARAKAT_KEYS: KeyDef[] = [
  mark('َ', 'fathah'),
  mark('ِ', 'kasrah'),
  mark('ُ', 'dhammah'),
  mark('ْ', 'sukun'),
  mark('ّ', 'syaddah'),
  mark('ً', 'tanwin fathah'),
  mark('ٍ', 'tanwin kasrah'),
  mark('ٌ', 'tanwin dhammah'),
];

export const PUNCT_KEYS: KeyDef[] = [
  { value: '،', label: '،', name: 'koma Arab' },
  { value: '.', label: '.', name: 'titik' },
  { value: '؟', label: '؟', name: 'tanda tanya Arab' },
];

/** Sisipkan teks di posisi kursor; kembalikan teks baru + posisi kursor. */
export function insertAt(text: string, start: number, end: number, insert: string): { text: string; caret: number } {
  const s = Math.max(0, Math.min(start, text.length));
  const e = Math.max(s, Math.min(end, text.length));
  return { text: text.slice(0, s) + insert + text.slice(e), caret: s + insert.length };
}

/** Hapus satu karakter (code point) sebelum kursor, atau seleksi. */
export function backspaceAt(text: string, start: number, end: number): { text: string; caret: number } {
  if (end > start) return { text: text.slice(0, start) + text.slice(end), caret: start };
  if (start <= 0) return { text, caret: 0 };
  const before = Array.from(text.slice(0, start));
  before.pop();
  const head = before.join('');
  return { text: head + text.slice(start), caret: head.length };
}
