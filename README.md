# Bahasa Arab Bab 3 — الْأَدَوَاتُ الْمَدْرَسِيَّةُ (Peralatan Sekolah)

Website belajar interaktif untuk Bab 3 Buku Siswa Bahasa Arab MTs Kelas VII (Kemenag RI 2020).
Isinya flashcard mufradat, kaidah dhamir & warna, teks bacaan, dialog (role-play), latihan dengan feedback langsung,
latihan menyimak, dan produksi teks. Situs ini tanpa backend: progres siswa tersimpan di perangkat masing-masing.

- Spesifikasi: [PRD.md](PRD.md) · Aturan kerja agent: [AGENTS.md](AGENTS.md) · Kaidah bahasa Arab: [.claude/skills/arabic-bab3/SKILL.md](.claude/skills/arabic-bab3/SKILL.md)
- **Sumber konten satu-satunya:** [content/bab3.json](content/bab3.json)
- **Perlu dicek guru sebelum rilis:** [CONTENT_ISSUES.md](CONTENT_ISSUES.md)

## Menjalankan

```bash
npm install
npm run dev          # http://localhost:3000 (mode pengembangan)
npm run build        # static export ke folder out/
npm start            # sajikan out/ di http://localhost:3000 (gzip, mirip hosting produksi)
```

| Perintah | Isi |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm test` | Unit test Vitest (`lib/__tests__`, `components/__tests__`) |
| `npm run test:e2e` | Smoke & audit Playwright pada hasil build (jalankan `npm run build` dulu). Memakai Chrome yang terpasang; set `PW_CHANNEL=chromium` dan `npx playwright install chromium` kalau tidak ada Chrome. |
| `node scripts/screenshots.mjs <folder> / /mufradat ...` | Screenshot 360px light/dark untuk QA visual harakat. Jalankan dulu `node scripts/serve-out.mjs 4173` setelah build. |

`postbuild` menjalankan `scripts/fix-export-windows.mjs`, workaround bug Next.js static export di Windows
(file prefetch segment ditulis ke folder yang salah). Di Linux/macOS (termasuk Vercel) skrip ini tidak melakukan apa-apa.

## Audio

Audio diputar dari file di `public/audio/` kalau ada, kalau tidak dari suara Text-to-Speech perangkat.

**Saat ini** ke-97 file di `public/audio/` adalah **suara sintetis** Microsoft Edge TTS (`ar-SA-HamedNeural`, kecepatan −10%),
dibuat dengan `scripts/generate-tts-audio.mjs`. Suara AI bisa salah membaca harakat, jadi **wajib didengar guru** (lihat di bawah)
dan yang keliru direkam ulang. Catatan: edge-tts memakai layanan online Microsoft secara tidak resmi; kalau sekolah ingin aman
soal izin, ganti semuanya dengan rekaman guru.

Membuat ulang suara sintetis (perlu Python + `pip install edge-tts`; file yang sudah ada dilewati, `--force` untuk menimpa):

```bash
node scripts/generate-tts-audio.mjs                               # suara laki-laki (default)
node scripts/generate-tts-audio.mjs --voice ar-SA-ZariyahNeural --force   # ganti semua ke suara perempuan
node scripts/generate-tts-audio.mjs --only vocab/haqibah --force          # buat ulang satu file
```

### Mendengar ulang & merekam suara guru

Guru bisa mendengar setiap file dan mengganti yang keliru dengan suaranya sendiri:

1. Jalankan `npm run dev` di komputer yang memegang kode proyek, lalu buka **http://localhost:3000/rekam** (Chrome/Edge/Safari terbaru).
2. Izinkan mikrofon. Tiap teks (97 total: kosakata, warna, عِنْدَ, kalimat nash, baris hiwar) tampil satu per satu.
   Pintasan: **R** rekam/berhenti · **P** dengar · **S** simpan & lanjut · **← →** pindah teks.
3. Rekaman tersimpan otomatis ke `public/audio/<kelompok>/<id>.m4a` dengan nama yang benar (menggantikan file suara sintetis untuk teks itu).
   Teks yang sudah punya file tampil "✓ Tersimpan"; tekan **P** untuk mendengarnya.
4. Setelah selesai: `npm run build`, lalu deploy ulang. Situs murid otomatis memutar rekaman; teks yang belum direkam tetap memakai suara perangkat.

Halaman `/rekam` dan API penyimpannya (`*.dev.tsx` / `*.dev.ts`) **hanya ada saat `next dev`** dan hanya menerima permintaan dari localhost,
jadi tidak pernah muncul di situs untuk murid. Rekaman juga bisa dibuat dengan aplikasi lain asal nama file mengikuti pola di atas
(format: mp3, m4a, webm, ogg, wav; daftar key ada di `lib/audio.ts` → `audioCatalog`).
Kalimat yang dibuat otomatis (Simulator Warna, Pembentuk Dhamir, substitusi hiwar, Istima' tadrib 3) tetap memakai suara perangkat.

## Deploy

Situs ini statis (`output: 'export'`), jadi:

- **Vercel:** import repo, preset framework Next.js, tanpa pengaturan tambahan.
- **Hosting statis lain** (Netlify, GitHub Pages, server sekolah): unggah isi folder `out/` setelah `npm run build`.

## Struktur

```
app/            halaman (/, /mufradat, /nushush, /hiwar, /tarkib, /latihan, /istima, /produksi)
components/     komponen UI; semua teks Arab lewat <ArabicText> (dir="rtl" lang="ar")
  quiz/         QuizRunner, McqView, MatchView, SentenceBuilder, MiniQuiz
  tarkib/       DhamirBuilder, ColorSimulator
  hiwar/        HiwarBubble, RolePlay, SubstitutionPractice
  istima/       TadribPlayer
  produksi/     WritingEditor, ArabicKeyboard, ModelingExercise, GroupTemplate
hooks/          useProgress, useSettings, useAudio (rekaman → TTS), useArrowNav
lib/            logika murni + unit test
  arabic.ts         attachDhamir, makeDefinite, removeAl, stripHarakat, sameArabic
  sentences.ts      kalimat warna pola 1/2/3, لَوْنُهُ/لَوْنُهَا, isim isyarah
  quiz*.ts          tipe soal, generator, sesi + antrean review
  lookup.ts         arti kata di teks (popover Nushush)
  substitution.ts   latihan substitusi hiwar
  istima.ts         ronde menyimak
  produksi.ts       saran otomatis tulisan siswa
  progress.ts, persistent-store.ts, stores.ts   progres & localStorage (aman kalau diblok)
  tts.ts            Web Speech API
  audio.ts          katalog teks yang bisa direkam, indeks teks → file rekaman
app/rekam/page.dev.tsx, app/api/audio/route.dev.ts   perekam guru (hanya `next dev`)
public/audio/      rekaman guru (daftar file dibuat otomatis: lib/audio-files.generated.json)
content/bab3.json  konten
types/content.ts   tipe konten
e2e/               test Playwright
```

## Catatan

- **Audio:** rekaman guru di `public/audio/` kalau ada, kalau tidak suara Text-to-Speech perangkat (`ar-SA`). Kalau keduanya tidak ada, muncul pesan dan siswa tetap bisa membaca teksnya.
- **Mode Kelas** (tombol di header): teks Arab 1,6× lebih besar, navigasi disembunyikan, ← → untuk pindah, Esc untuk keluar.
- **Progres** (kata hafal, modul selesai, skor terbaik, antrean soal yang salah) tersimpan di `localStorage` perangkat. Tombol reset ada di Beranda.
- **Belum dikerjakan (M6 / v1.1):** PWA offline, teks asli buku (`book_text`). Audio saat ini suara sintetis; rekaman guru bisa menggantikannya kapan saja (lihat bagian Audio).
