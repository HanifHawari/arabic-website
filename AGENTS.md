# AGENTS.md — Website Pembelajaran Bahasa Arab Bab 3 (الْأَدَوَاتُ الْمَدْرَسِيَّةُ)

Kamu adalah agent coding yang membangun website belajar Bab 3 buku Bahasa Arab MTs Kelas VII. Baca file ini dulu sebelum menulis kode.

## Dokumen wajib dibaca
1. `PRD.md` — fitur, scope, kriteria penerimaan.
2. `.claude/skills/arabic-bab3/SKILL.md` — aturan bahasa Arab (dhamir, warna, RTL, harakat). **Wajib** dibaca sebelum menyentuh `lib/arabic.ts`, quiz generator, atau komponen yang menampilkan teks Arab.
3. `content/bab3.json` — satu-satunya sumber konten.

## Stack
- Next.js App Router + TypeScript (strict) + Tailwind CSS, static export (`output: 'export'`).
- Init dengan `npx create-next-app@latest`. Jangan pin versi dari ingatan; cek `package.json` hasil init.
- Package manager: npm (kecuali user bilang lain).
- Tidak ada backend, tidak ada database, tidak ada auth.

## Aturan keras (jangan dilanggar)
1. **Jangan hardcode konten Arab di komponen.** Semua kata, kalimat, warna, soal diambil dari `content/bab3.json`. Kalau butuh konten baru, tambahkan ke JSON (dan tandai untuk dicek guru), bukan ke JSX.
2. **Jangan mengubah harakat** di JSON tanpa instruksi user. Kalau curiga salah, catat di `CONTENT_ISSUES.md`, jangan "benerin" sendiri.
3. **Jangan menyalin teks bacaan/hiwar/soal dari buku.** Field `book_text` hanya diisi user.
4. **Jangan pakai foto/gambar dari PDF buku.** Pakai ikon/ilustrasi SVG buatan sendiri atau aset berlisensi bebas (cantumkan atribusi kalau perlu).
5. Setiap elemen berisi teks Arab dibungkus komponen `<ArabicText>` (yang set `dir="rtl"` dan `lang="ar"`). Jangan pakai `dir="rtl"` di `<html>` — UI utama Bahasa Indonesia (LTR).
6. Jangan pakai `String.prototype.normalize('NFC'|'NFD')` pada teks berharakat lalu menampilkannya; normalisasi cuma untuk perbandingan/pencarian (lihat SKILL.md).
7. `localStorage` selalu dalam try/catch; app harus tetap jalan kalau gagal.
8. Jangan nambah dependency besar tanpa alasan. Yang diizinkan default: `framer-motion` (opsional), `vitest`, `@testing-library/react`, `@playwright/test` (opsional). Selain itu, tanya dulu.

## Konvensi kode
- Komponen: PascalCase, satu komponen per file, di `/components`.
- Logika murni (tanpa React) di `/lib`, wajib ada unit test di `/lib/__tests__`.
- Tipe konten di `/types/content.ts`, diturunkan dari skema JSON; import JSON dengan type assertion yang divalidasi (boleh pakai type guard sederhana, tanpa zod kecuali diminta).
- Teks UI Bahasa Indonesia, santai tapi sopan untuk anak SMP/MTs.
- Tailwind: pakai design token di `tailwind.config` / CSS variables untuk warna tema (light/dark). Swatch warna materi pakai `hex` dari JSON, bukan class Tailwind.
- Font Arab via `next/font/google` (Amiri atau Noto Naskh Arabic), expose sebagai CSS variable `--font-arabic`. Ukuran minimum: 28px kata tunggal, 22px paragraf, `line-height` ≥ 1.9 supaya harakat tidak bertabrakan.

## Urutan kerja
Ikuti milestone di PRD §11. Per milestone:
1. Tulis/ubah kode.
2. Jalankan `npm run lint`, `npx tsc --noEmit`, `npx vitest run`.
3. Jalankan `npm run build` (harus sukses untuk static export).
4. Ringkas apa yang dikerjakan + yang belum, dalam 3–6 baris.

Jangan lompat milestone. Jangan refactor besar di luar scope milestone.

## Definition of Done (per fitur)
- Sesuai requirement PRD dan lolos kriteria penerimaan terkait.
- Responsif di 360px, keyboard-accessible, dark mode tidak rusak.
- Tidak ada teks Arab yang terpotong / harakat hilang (cek visual di mobile viewport).
- Test lulus, build lulus.

## Kalau ragu
- Soal kaidah bahasa Arab → ikuti SKILL.md; kalau SKILL.md tidak mencakup, **tanya user**, jangan menebak.
- Soal fitur → ikuti PRD; kalau ambigu, pilih opsi paling sederhana dan tulis asumsinya.
