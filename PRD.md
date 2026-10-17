# PRD — Website Pembelajaran Bahasa Arab Bab 3: الْأَدَوَاتُ الْمَدْرَسِيَّةُ (Peralatan Sekolah)

| Item | Isi |
|---|---|
| Versi | 1.0 (draft) |
| Sumber materi | Buku Siswa Bahasa Arab MTs Kelas VII, Kemenag RI 2020 — Ad-Dars ats-Tsalits (hal. buku 50–73 / hal. PDF 56–79) |
| Data konten | `content/bab3.json` (single source of truth) |
| Dokumen pendamping | `AGENTS.md` (aturan kerja agent), `.claude/skills/arabic-bab3/SKILL.md` (aturan domain bahasa Arab) |

---

## 1. Latar Belakang

Bab 3 buku Bahasa Arab MTs Kelas VII mengajarkan kosakata peralatan sekolah & perangkat kelas, 12 warna (bentuk mudzakkar & mu'annats), ungkapan kepemilikan dengan عِنْدَ, serta kaidah **isim dhamir muttashil** dan **cara menyatakan warna dengan لَوْنٌ**. Di buku, latihannya statis (isi titik-titik, jodohkan). Website ini mengubah materi tersebut jadi pengalaman belajar interaktif: flashcard bersuara, latihan dengan feedback langsung, dan progres yang tersimpan.

## 2. Tujuan

1. Siswa menguasai 45 kosakata Bab 3 (arti, cara baca, gender).
2. Siswa bisa memilih bentuk warna yang benar (mudzakkar/mu'annats) sesuai pola kalimat.
3. Siswa bisa menempelkan dhamir muttashil ke kata benda dengan benar (termasuk aturan ال dan ta marbuthah).
4. Siswa bisa membaca & memahami teks naratif dan hiwar pendek bertema peralatan sekolah.
5. Siswa bisa memproduksi kalimat/paragraf pendek sendiri (Nasyath 3–4 buku).

### Non-goals (v1)
- Bab lain selain Bab 3.
- Login/akun, backend, database, leaderboard online.
- Penilaian otomatis untuk tulisan bebas (produksi teks) — cuma checklist mandiri.
- Dashboard guru.

## 3. Target Pengguna

| Persona | Kebutuhan |
|---|---|
| Siswa MTs kelas VII (12–13 th) | UI simpel, teks Arab besar & berharakat, feedback jelas dalam Bahasa Indonesia, bisa dipakai di HP murah |
| Guru Bahasa Arab | Tampilkan materi di proyektor kelas (mode presentasi), bacakan istima' pakai audio |

Asumsi perangkat: mayoritas Android low–mid range, koneksi tidak stabil → wajib ringan dan bisa dipakai offline setelah dibuka sekali (PWA, opsional v1.1).

## 4. Struktur Konten (dari buku)

Mengikuti alur buku supaya selaras dengan pembelajaran di kelas:

1. **Pengantar** — judul bab, KD 3.5, 3.6, 4.5, 4.6, peta konsep.
2. **Mufradat**
   - الأدوات المدرسية (15 kata) — alat sekolah
   - الأدوات في الفصل (30 kata) — perangkat kelas
   - الألوان (12 warna × 2 bentuk)
   - المفردات الأخرى — عِنْدَهُ / عِنْدَهَا / عِنْدَكَ / عِنْدَكِ / عِنْدِي / عِنْدَنَا
3. **Nushush** — 2 teks naratif (tas & isinya, kelas & perangkatnya).
4. **Hiwar** — dialog tentang barang & warnanya.
5. **Tarkib**
   - Dhamir muttashil (tabel, aturan tanpa ال, ta marbuthah → ta)
   - Warna: 3 pola (لَوْنُ + benda, benda + لَوْنُهُ/لَوْنُهَا, tanpa لَوْنُ)
   - Pendukung: isim isyarah هَذَا / هَذِهِ / ذَلِكَ / تِلْكَ
6. **Istima'** — tebak warna/mufradat/kalimat dari audio.
7. **Produksi Teks** — pemodelan teks, produksi berkelompok, produksi mandiri.

> **Catatan hak cipta & akurasi:** `content/bab3.json` berisi kosakata, kaidah, dan **teks/soal orisinal** pengganti. Teks bacaan & hiwar asli buku sengaja tidak disalin; kalau sekolah mau pakai teks asli, isi field `book_text` dari buku (buku ini milik negara, tapi tetap cantumkan sumber). Semua harakat ditranskripsi dari gambar PDF → **wajib dicek guru** sebelum rilis.

## 5. Fitur & Requirement

### F1. Beranda Bab
- Hero judul Arab besar + terjemahan, progres keseluruhan (%), tombol "Lanjut belajar" ke modul terakhir.
- Kartu modul: Mufradat, Nushush, Hiwar, Tarkib, Latihan, Istima', Produksi Teks — tiap kartu tampil status (belum / sedang / selesai).

### F2. Mufradat (Flashcard)
- Tab kategori: Alat Sekolah, Perangkat Kelas, Warna, Kosakata Lain.
- Mode **Grid** (semua kata) dan mode **Flashcard** (satu per satu, swipe/klik flip).
- Tiap kartu: kata Arab berharakat, arti, badge gender (مذكر/مؤنث), tombol 🔊 audio, ilustrasi.
- Kartu warna menampilkan swatch warna + bentuk mudzakkar & mu'annats berdampingan.
- Toggle tampil/sembunyi harakat.
- Tandai "sudah hafal" → tersimpan di progres.
- Tampilkan `note` dari data kalau ada (mis. kata ambigu).

**Ilustrasi:** jangan pakai foto dari buku. Pakai ikon/ilustrasi SVG sendiri atau aset berlisensi bebas; fallback emoji.

### F3. Nushush (Teks Bacaan)
- Teks Arab ukuran besar, RTL, line-height lega.
- Klik kata → popover arti (lookup ke data vocab; kalau kata ber-dhamir/ber-ال, normalisasi dulu, lihat SKILL.md).
- Toggle terjemahan per kalimat / seluruh teks.
- Tombol putar audio seluruh teks + highlight kalimat yang sedang dibaca (kalau pakai TTS: per kalimat).
- 5 soal pemahaman pilihan ganda per teks.

### F4. Hiwar (Dialog)
- Tampilan bubble chat dua tokoh, kanan-kiri (ingat RTL).
- Putar per baris / putar semua.
- Mode **Role-play**: user pilih jadi tokoh A/B; baris tokoh user disembunyikan, user baca keras lalu klik "lanjut".
- Latihan substitusi: ganti nama barang & warna di pola kalimat dialog.

### F5. Tarkib (Kaidah)
- Penjelasan singkat Bahasa Indonesia + tabel interaktif:
  - **Pembentuk dhamir**: pilih kata benda + pilih dhamir → hasil muncul dengan animasi (tanwin hilang, ة → ت, suffix menempel). Logika di SKILL.md.
  - **Tabel salah vs benar** (ال + dhamir).
  - **Simulator warna**: pilih benda + warna + pola (1/2/3) → kalimat jadi + penjelasan kenapa bentuk warnanya begitu.
- Mini-quiz 3 soal di akhir tiap kaidah.

### F6. Latihan (Quiz Engine)
Tipe soal (semua feedback langsung + penjelasan singkat):

| Tipe | Contoh | Sumber soal |
|---|---|---|
| Arab → arti | حَقِيْبَةٌ → tas | generator dari vocab |
| Arti → Arab | kapur tulis → طَبْشُوْرَةٌ | generator |
| Jodohkan warna | swatch ↔ kata warna | generator dari colors |
| Pilih لَوْنُهُ / لَوْنُهَا | هَذِهِ الْحَقِيْبَةُ ... بُنِّيٌّ | bank + generator |
| Bentuk warna | لَوْنُ الْمِمْسَحَةِ ... (أَبْيَضُ/بَيْضَاءُ) | bank + generator |
| Pilih dhamir | أَنَا → مَكْتَبِيْ | bank + generator |
| Tebak dhamir dari kata | بِطَاقَتُنَا → نَحْنُ | generator |
| Perbaiki kesalahan | الْكِتَابُكَ → كِتَابُكَ | bank |
| Susun kalimat | drag kata → لَوْنُ الْكِتَابِ أَصْفَرُ | generator pola |

- Satu sesi = 10 soal acak, campur tipe. Bisa pilih fokus (Mufradat / Warna / Dhamir).
- Skor akhir + daftar soal salah + tombol "ulangi yang salah".
- Soal salah masuk antrean review (spaced repetition sederhana: muncul lagi di sesi berikutnya).

### F7. Istima' (Menyimak)
- Tadrib 1: dengar kata warna → pilih dari 3 opsi.
- Tadrib 2: dengar mufradat → pilih dari 3–4 opsi.
- Tadrib 3: dengar kalimat warna → pilih kalimat yang benar.
- Tadrib 4: dengar teks pendek → isi titik-titik pilihan ganda (pakai teks orisinal; skrip asli buku tadrib 4 punya opsi yang salah cetak, lihat `istima.known_issue`).
- Tombol putar ulang, kecepatan 0.75× / 1×.
- **Audio:** v1 pakai Web Speech API (`speechSynthesis`, `lang="ar-SA"`). Ketersediaan suara Arab tergantung OS/browser → kalau tidak ada suara Arab, tampilkan pesan + teks tertulis sebagai fallback. v1.1: ganti ke rekaman MP3 dari guru (lebih akurat harakatnya).

### F8. Produksi Teks
- **Pemodelan**: tampilkan 2 teks, user tandai bagian struktur (pembuka/perkenalan, isi/deskripsi barang & warna, penutup).
- **Mandiri**: editor teks RTL dengan keyboard Arab virtual (huruf + harakat) + checklist tashih:
  - [ ] Kata ber-dhamir tidak diawali ال
  - [ ] Setelah لَوْنُ, warna bentuk mudzakkar
  - [ ] Tanpa لَوْنُ, warna sesuai gender benda
  - [ ] Pakai minimal 5 mufradat Bab 3
- Pengecekan otomatis ringan (regex): deteksi pola `ال...(ه|ها|ك|ي|نا)` dan hitung mufradat yang dipakai. Sifatnya saran, bukan nilai.
- **Berkelompok**: template tabel (nama, tugas, kalimat, koreksi) yang bisa diunduh/print (PDF via print CSS).
- Hasil tulisan bisa disalin / diunduh .txt.

### F9. Progres
- Disimpan di `localStorage` (try/catch; kalau gagal, app tetap jalan tanpa simpan).
- Data: kata yang sudah hafal, modul selesai, skor terbaik per tipe latihan, antrean review.
- Tombol reset progres (dengan konfirmasi).

### F10. Mode Guru / Presentasi
- Toggle "Mode Kelas": font Arab ekstra besar, sembunyikan navigasi, navigasi pakai panah keyboard.
- Cocok untuk ditampilkan di proyektor.

## 6. Requirement Non-Fungsional

| Aspek | Target |
|---|---|
| Performa | Lighthouse mobile Performance ≥ 90; halaman statis (SSG) |
| Ukuran | JS awal ≤ ~150 KB gzip (target, bukan hard limit) |
| Aksesibilitas | Kontras AA, semua tombol bisa keyboard, `lang="ar"` + `dir="rtl"` di setiap blok Arab, `aria-label` di tombol audio |
| Responsif | 360 px s/d desktop; flashcard nyaman di HP |
| Tipografi Arab | Font naskh yang mendukung harakat lengkap (Amiri / Noto Naskh Arabic / Scheherazade New), min 28 px untuk kata tunggal, 22 px untuk paragraf |
| Bahasa UI | Bahasa Indonesia; konten Arab |
| Tema | Light & dark mode |
| Offline | v1.1: PWA (cache semua halaman + data JSON) |

## 7. Arsitektur & Tech Stack

- **Framework:** Next.js (App Router) + TypeScript, `output: 'export'` (static) → deploy ke Vercel.
- **Styling:** Tailwind CSS.
- **State:** React state + hook `useProgress` (localStorage). Tidak perlu library state global.
- **Animasi:** Framer Motion (opsional, untuk flip card & pembentuk dhamir).
- **Font:** `next/font/google` (Amiri atau Noto Naskh Arabic) + font UI latin.
- **Audio:** Web Speech API (v1), file audio statis di `/public/audio` (v1.1).
- **Testing:** Vitest untuk logika (generator dhamir, normalisasi, quiz generator); Playwright untuk smoke test halaman (opsional).
- Versi library: pakai versi stabil terbaru saat init (`create-next-app@latest`), jangan pin dari ingatan.

### Struktur folder (usulan)
```
/app
  /page.tsx                  → beranda bab
  /mufradat/page.tsx
  /nushush/page.tsx
  /hiwar/page.tsx
  /tarkib/page.tsx
  /latihan/page.tsx
  /istima/page.tsx
  /produksi/page.tsx
/components
  ArabicText.tsx             → wrapper dir=rtl lang=ar + toggle harakat
  Flashcard.tsx, ColorSwatch.tsx, AudioButton.tsx
  quiz/ (QuizRunner, MCQ, Matching, SentenceBuilder)
  tarkib/ (DhamirBuilder, ColorSimulator)
/lib
  arabic.ts                  → attachDhamir, stripHarakat, normalize, removeAl
  quiz-generator.ts
  tts.ts
  progress.ts
/content/bab3.json
/types/content.ts            → tipe TS sesuai skema JSON
```

## 8. Model Data

Skema mengikuti `content/bab3.json`. Ringkasan:

```ts
type Gender = 'm' | 'f';
interface Vocab { id: string; ar: string; stem: string | null; id_meaning: string;
  gender: Gender; category: 'sekolah' | 'kelas'; attachable: boolean; note?: string }
interface Color { id: string; m: string; f: string; id_meaning: string; hex: string }
interface Pronoun { id: string; ar: string; suffix: string; vowel: string; id_meaning: string; inda: string }
```
- `stem` = kata tanpa tanwin; dipakai generator dhamir. `null` + `attachable:false` untuk frasa majemuk (كَشْفُ الْحُضُوْرِ, سَاعَةٌ حَائِطِيَّةٌ, dll.) dan kata serapan.
- Teks: `texts.nash[]`, `texts.hiwar[].lines[]` dengan field `ar`, `translation`, `book_text`.

## 9. Alur Pengguna Utama

1. Siswa buka web → Beranda → "Mulai" → Mufradat (flashcard) → tandai hafal.
2. Lanjut Tarkib → coba Pembentuk Dhamir & Simulator Warna → mini-quiz.
3. Baca Nushush + dengar audio → jawab soal pemahaman.
4. Latihan campuran 10 soal → lihat yang salah → ulangi.
5. Istima' → Produksi teks mandiri → salin hasil untuk dikumpulkan ke guru.

## 10. Metrik Keberhasilan

- ≥ 70% siswa uji coba menyelesaikan minimal 1 sesi latihan penuh.
- Rata-rata skor sesi latihan kedua > sesi pertama.
- Guru penguji menyatakan tidak ada kesalahan harakat/kaidah tersisa (checklist QA konten).
(Tanpa backend, metrik diambil lewat uji coba langsung di kelas / form feedback.)

## 11. Milestone

| Fase | Isi |
|---|---|
| M0 | Setup project, font Arab, komponen `ArabicText`, tipe data dari JSON, `lib/arabic.ts` + unit test |
| M1 | Beranda, Mufradat (grid + flashcard + audio), progres |
| M2 | Tarkib (DhamirBuilder, ColorSimulator) |
| M3 | Quiz engine + generator + halaman Latihan |
| M4 | Nushush, Hiwar (role-play), Istima' |
| M5 | Produksi teks, Mode Guru, polish a11y & performa, deploy |
| M6 (v1.1) | PWA offline, audio rekaman guru, teks asli buku (kalau diizinkan) |

## 12. Kriteria Penerimaan (ringkas)

- [ ] Semua 45 kosakata, 12 warna, 6 dhamir tampil benar dari JSON (tidak ada hardcode konten di komponen).
- [ ] `attachDhamir` lolos unit test untuk: kata biasa (بَاب), ta marbuthah (صُوْرَة), syaddah akhir (كُرْسِيّ, رَفّ, مِقَصّ), semua 6 dhamir.
- [ ] Simulator warna menghasilkan bentuk benar untuk ketiga pola, termasuk benda mu'annats dengan لَوْنُ (warna tetap mudzakkar).
- [ ] Semua blok Arab punya `dir="rtl"` dan `lang="ar"`; harakat tidak terpotong di mobile.
- [ ] Audio jalan di Chrome Android dengan suara Arab tersedia; fallback tampil kalau tidak tersedia.
- [ ] Progres bertahan setelah reload; app tetap jalan kalau localStorage diblok.
- [ ] Lighthouse mobile Performance & Accessibility ≥ 90.

## 13. Risiko & Pertanyaan Terbuka

| # | Isu | Usulan |
|---|---|---|
| 1 | قَلَمُ رَصَاصٍ: arti harfiah "pensil", tapi gambar buku = spidol; sementara buku juga pakai مِرْسَمٌ = pensil | Tampilkan `note`, konfirmasi ke guru |
| 2 | مُلْصَقٌ: gambar buku = lem, makna umum = poster/stiker | Ikuti buku (lem) + note |
| 3 | Istima' tadrib 4 no. 6 di buku opsi jawabannya tidak memuat jawaban skrip | Jangan salin; pakai soal orisinal |
| 4 | Transkripsi harakat dari gambar bisa keliru | QA oleh guru sebelum rilis |
| 5 | Suara TTS Arab tidak tersedia di semua perangkat & harakat kadang diabaikan TTS | Fallback teks; v1.1 rekaman guru |
| 6 | Pakai teks asli buku atau orisinal? | Default orisinal; field `book_text` disiapkan |
