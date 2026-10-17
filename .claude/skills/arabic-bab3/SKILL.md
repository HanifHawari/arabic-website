---
name: arabic-bab3
description: Aturan domain bahasa Arab untuk website Bab 3 (الأدوات المدرسية) — menampilkan teks Arab berharakat (RTL, font, perbandingan string), membentuk isim dhamir muttashil, menyusun kalimat warna dengan/tanpa لَوْنٌ, isim isyarah, dan membuat soal latihan otomatis dari content/bab3.json. Pakai skill ini setiap kali menulis lib/arabic.ts, quiz generator, DhamirBuilder, ColorSimulator, lookup kata di Nushush, atau komponen apa pun yang merender teks Arab.
---

# Skill: Bahasa Arab Bab 3 — الْأَدَوَاتُ الْمَدْرَسِيَّةُ

Sumber kebenaran konten: `content/bab3.json`. Skill ini menjelaskan **aturan** dan **algoritma**; jangan mengarang kaidah di luar yang tertulis di sini. Kalau butuh kaidah lain, tanya user.

---

## 1. Menampilkan teks Arab

- Bungkus dengan `<ArabicText>`:
  ```tsx
  export function ArabicText({ children, as: Tag = 'span', className = '' }: {...}) {
    return <Tag dir="rtl" lang="ar" className={`font-arabic ${className}`}>{children}</Tag>;
  }
  ```
- Font: Amiri / Noto Naskh Arabic / Scheherazade New via `next/font/google`. Jangan pakai font Arab tanpa dukungan harakat.
- `line-height` ≥ 1.9; jangan `overflow: hidden` pada container teks Arab (harakat atas/bawah bisa terpotong).
- Dalam kalimat campuran (Indonesia + kata Arab), bungkus kata Arabnya saja; `<bdi>` boleh dipakai agar urutan bidi tidak kacau.
- Tanda baca Arab: koma `،`, tanda tanya `؟`.
- Toggle "sembunyikan harakat" = tampilkan `stripHarakat(text)`, jangan ubah data.

### Perbandingan string
Urutan codepoint harakat bisa beda tapi tampilannya sama (mis. syaddah+dhammah vs dhammah+syaddah). **Selalu** bandingkan pakai:
```ts
export const sameArabic = (a: string, b: string) => a.normalize('NFC') === b.normalize('NFC');
```
Untuk pencarian/lookup longgar (abaikan harakat):
```ts
const HARAKAT = /[\u064B-\u0652\u0670\u0640]/g; // tanwin, fathah, dhammah, kasrah, syaddah, sukun, alif khanjariyah, tatweel
export const stripHarakat = (s: string) => s.replace(HARAKAT, '');
export const normalizeForCompare = (s: string) =>
  stripHarakat(s).replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').trim();
```
Normalisasi hanya untuk membandingkan; yang ditampilkan tetap string asli dari JSON.

---

## 2. Gender kata benda

- Setiap vocab punya `gender: 'm' | 'f'` di JSON. **Pakai field itu**, jangan menebak dari akhiran.
- Di Bab 3, semua kata mu'annats berakhiran ة, tapi jangan jadikan itu aturan di kode.

## 3. Isim isyarah (pendukung)

| | dekat | jauh |
|---|---|---|
| mudzakkar | هَذَا | ذَلِكَ |
| mu'annats | هَذِهِ | تِلْكَ |

Pilih berdasarkan `gender` benda.

---

## 4. Isim dhamir muttashil (kepemilikan)

| Dhamir | Suffix | Harakat huruf akhir benda | Contoh (بَاب) | Arti |
|---|---|---|---|---|
| هُوَ | هُ | dhammah | بَابُهُ | pintunya (lk) |
| هِيَ | هَا | dhammah | بَابُهَا | pintunya (pr) |
| أَنْتَ | كَ | dhammah | بَابُكَ | pintumu (lk) |
| أَنْتِ | كِ | dhammah | بَابُكِ | pintumu (pr) |
| أَنَا | يْ | **kasrah** | بَابِيْ | pintuku |
| نَحْنُ | نَا | dhammah | بَابُنَا | pintu kami/kita |

(Harakat dhammah = bentuk marfu' seperti di buku. Konteks lain tidak dibahas di Bab 3.)

### Aturan
1. Tanwin dihapus → pakai field `stem` (sudah tanpa tanwin).
2. Ta marbuthah `ة` → `ت`.
3. Kata ber-dhamir **tidak boleh** diberi ال. ❌ الْكِتَابُكَ ✅ كِتَابُكَ.
4. Hanya kata dengan `attachable: true` (frasa majemuk & kata serapan dikecualikan).

### Algoritma
```ts
export function attachDhamir(stem: string, p: Pronoun): string {
  const base = stem.endsWith('ة') ? stem.slice(0, -1) + 'ت' : stem;
  return base + p.vowel + p.suffix; // p.vowel: 'ُ' atau 'ِ' (untuk أَنَا), dari JSON
}
```

### Test case wajib (bandingkan dengan `sameArabic`)
| stem | dhamir | hasil |
|---|---|---|
| بَاب | هُوَ | بَابُهُ |
| بَاب | أَنَا | بَابِيْ |
| بَاب | نَحْنُ | بَابُنَا |
| صُوْرَة | أَنْتَ | صُوْرَتُكَ |
| سَبُّوْرَة | أَنْتِ | سَبُّوْرَتُكِ |
| خَرِيْطَة | أَنَا | خَرِيْطَتِيْ |
| كُرْسِيّ | هُوَ | كُرْسِيُّهُ |
| كُرْسِيّ | أَنَا | كُرْسِيِّيْ |
| حِبْر | أَنَا | حِبْرِيْ |

### Deteksi dhamir dari kata (untuk soal "tebak dhamir")
Cek akhiran setelah `stripHarakat`, urutan dari yang terpanjang: `ها`→هِيَ, `نا`→نَحْنُ, `ه`→هُوَ, `ك`→ambigu أَنْتَ/أَنْتِ (bedakan dari harakat terakhir: fathah → أَنْتَ, kasrah → أَنْتِ), `ي`→أَنَا. Lebih aman: generate soal dari pasangan (stem, dhamir) yang sudah diketahui, jangan parsing balik.

---

## 5. Menyatakan warna

### Bentuk warna (dari JSON `colors`)
- Warna dasar: mudzakkar pola أَفْعَلُ ↔ mu'annats pola فَعْلَاءُ (أَحْمَرُ ↔ حَمْرَاءُ). Keduanya tanpa tanwin.
- Warna nisbah (ـِيٌّ): mu'annats = + ة (بُنِّيٌّ ↔ بُنِّيَّةٌ).
- Selalu ambil dari field `m` / `f`, jangan diturunkan otomatis.

### Tiga pola kalimat

| Pola | Struktur | Bentuk warna | Contoh |
|---|---|---|---|
| 1 | لَوْنُ + benda (ber-ال, kasrah) + warna | **selalu `m`** | لَوْنُ الْوَرْدَةِ أَحْمَرُ |
| 2 | benda (ber-ال, dhammah) + لَوْنُهُ/لَوْنُهَا + warna | **selalu `m`**; dhamir: ـهُ jika benda `m`, ـهَا jika `f` | السَّاعَةُ لَوْنُهَا أَسْوَدُ |
| 3 | benda + warna (tanpa لَوْنُ) | **ikut gender benda** | الْوَرْدَةُ حَمْرَاءُ / هَذِهِ سَبُّوْرَةٌ سَوْدَاءُ |

Alasan pola 1 & 2: warna jadi khabar bagi لَوْنٌ yang mudzakkar. Ini kesalahan paling sering siswa — tampilkan penjelasan ini di feedback.

### Membentuk kata benda ber-ال
Huruf syamsiyah: ت ث د ذ ر ز س ش ص ض ط ظ ل ن → lam tidak dibaca, huruf pertama dapat syaddah. Lainnya (qamariyah) → `الْ`.
```ts
const SUN = new Set([...'تثدذرزسشصضطظلن']);
export function makeDefinite(stem: string): string {
  const first = stem[0];
  return SUN.has(first) ? 'ال' + first + '\u0651' + stem.slice(1) : 'الْ' + stem;
}
// kasrah (setelah لَوْنُ): makeDefinite(stem) + 'ِ'   → السَّبُّوْرَةِ, الْكِتَابِ, الرَّفِّ
// dhammah (subjek):       makeDefinite(stem) + 'ُ'   → السَّبُّوْرَةُ
```
Hanya untuk `attachable: true` (stem tidak null). Frasa majemuk jangan dipakai di generator kalimat.

### Generator kalimat
```ts
function pattern1(n: Vocab, c: Color) { return `لَوْنُ ${makeDefinite(n.stem!)}ِ ${c.m}`; }
function pattern2(n: Vocab, c: Color) {
  return `${makeDefinite(n.stem!)}ُ ${n.gender === 'm' ? 'لَوْنُهُ' : 'لَوْنُهَا'} ${c.m}`;
}
function pattern3(n: Vocab, c: Color) { // indefinit + sifat
  const isyarah = n.gender === 'm' ? 'هَذَا' : 'هَذِهِ';
  return `${isyarah} ${n.ar} ${n.gender === 'm' ? c.m : c.f}`;
}
```
Catatan: hasil template literal di atas menempelkan harakat setelah string; itu disengaja.

---

## 6. Ungkapan kepemilikan عِنْدَ
Dari `pronouns[].inda`: عِنْدَهُ، عِنْدَهَا، عِنْدَكَ، عِنْدَكِ، عِنْدِي، عِنْدَنَا + benda indefinit dengan tanwin (`n.ar`). Contoh: عِنْدِي فِرْجَارٌ = saya punya jangka.

---

## 7. Quiz generator

Prinsip:
- Distraktor diambil dari kategori yang sama (alat sekolah dengan alat sekolah).
- Untuk soal bentuk warna, opsinya **selalu** pasangan `m` vs `f` warna yang sama (yang diuji kaidahnya, bukan hafalan warna).
- Untuk soal dhamir, opsinya 4 hasil `attachDhamir` dari stem yang sama dengan dhamir berbeda.
- Opsi diacak (Fisher–Yates); jawaban dicek dengan `sameArabic`.
- Setiap soal punya `explanation` Bahasa Indonesia, mis.: "Setelah لَوْنُ, warna selalu mudzakkar karena لَوْنٌ itu mudzakkar."
- Gabungkan dengan `quiz_bank` dari JSON (soal tulisan tangan).
- Jangan generate soal dari item `attachable: false` kecuali tipe Arab→arti / arti→Arab.

Tipe & resep:
| Tipe | Resep |
|---|---|
| `vocab_ar_to_id` | soal `n.ar`, opsi 4 `id_meaning` (1 benar + 3 kategori sama) |
| `vocab_id_to_ar` | kebalikan |
| `color_match` | swatch `hex` ↔ `c.m` |
| `lawn_pronoun` | `isyarah + makeDefinite(stem)+'ُ' + ' ... ' + c.m`, opsi [لَوْنُهُ, لَوْنُهَا] |
| `color_form` | pola 1/2/3 dengan warna dikosongkan, opsi [c.m, c.f] |
| `dhamir_choose` | soal dhamir (`p.ar`) + benda, opsi 4 bentuk |
| `dhamir_identify` | soal `attachDhamir(stem,p)`, opsi 4 dhamir |
| `fix_al` | tampilkan `'ال' + attachDhamir(...)` (salah), user pilih bentuk benar |
| `sentence_builder` | pecah hasil pattern1/2/3 per spasi → acak → user susun |

---

## 8. Lookup kata di teks (popover arti)
1. Tokenisasi per spasi, buang tanda baca (`، . ؟ !`).
2. `normalizeForCompare(token)`.
3. Coba cocokkan berurutan dengan stem vocab (juga di-normalize):
   - persis sama;
   - buang awalan `و` / `ف` / `ب` lalu ulang;
   - buang `ال`;
   - buang akhiran `ها|نا|ه|ك|ي`, lalu kalau berakhir `ت` coba juga versi `ة`.
4. Kalau tidak ketemu, cek `colors` (m & f) dan `pronouns`. Kalau tetap tidak ada, jangan tampilkan popover (jangan mengarang arti).

---

## 9. Hal yang JANGAN dilakukan
- Mengubah harakat/arti di JSON tanpa izin user.
- Menurunkan bentuk mu'annats warna secara otomatis.
- Menebak gender dari akhiran kata.
- Mengarang kaidah tambahan (i'rab lanjutan, jamak, dll.) — di luar Bab 3.
- Menampilkan string hasil `normalize()`/`stripHarakat()` sebagai konten utama.

## 10. Known issues konten (jangan "dibenerin" diam-diam)
- `qalam_rashash`: makna vs gambar buku tidak cocok (lihat `note`).
- `mulshaq`: buku = lem; makna umum = poster/stiker.
- Istima' tadrib 4 no. 6 di buku: opsi tidak memuat jawaban skrip.
- Semua harakat hasil transkripsi gambar → tampilkan banner kecil "Konten beta, sedang dicek guru" sampai user menghapusnya.
