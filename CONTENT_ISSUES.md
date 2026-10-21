# Catatan Konten untuk Dicek Guru

Daftar hal di `content/bab3.json` dan perilaku aplikasi yang perlu dicek guru sebelum rilis.
Sesuai AGENTS.md, harakat yang sudah ada **tidak diubah** oleh agent. Hal yang meragukan dicatat di sini.

Setelah semua poin dicek, banner "Konten beta" bisa dihapus dari `app/layout.tsx` (komponen `BetaBanner`).

## A. Konten baru yang ditambahkan agent (wajib dicek)

| Lokasi di JSON | Isi | Catatan |
|---|---|---|
| `grammar_words.lawn` / `lawn_stem` | لَوْنٌ / لَوْن | Dipakai generator kalimat warna (لَوْنُ، لَوْنُهُ، لَوْنُهَا). |
| `grammar_words.mudzakkar` / `muannats` | مُذَكَّرٌ / مُؤَنَّثٌ | Label badge gender di kartu mufradat. |
| `module_titles` | الْمُفْرَدَاتُ، النُّصُوْصُ، الْحِوَارُ، التَّرْكِيْبُ، التَّدْرِيْبَاتُ، الِاسْتِمَاعُ، إِنْتَاجُ النَّصِّ | Judul Arab di kartu modul beranda & banner tiap halaman. Penulisan sukun pada huruf mad mengikuti gaya buku (حَقِيْبَةٌ). |
| `comprehension.nash1`, `comprehension.nash2` | 10 soal pemahaman (5 per teks) | Pertanyaannya dalam bahasa Indonesia. Opsi berbahasa Arab **disalin otomatis** dari `vocab` / `colors` (tidak diketik ulang), dan kutipan Arab di `why` sudah dicek otomatis sebagai potongan persis dari teks nash. Mohon cek apakah soal dan kunci jawabannya sudah tepat. |

## B. Inkonsistensi penulisan (tidak diubah)

1. **Sukun pada ي dhamir أَنَا.** Tabel kaidah & generator menulis ي dengan sukun (بَابِيْ، خَرِيْطَتِيْ, sesuai SKILL.md), sedangkan teks nash/hiwar dan `pronouns[].inda` menulis tanpa sukun (حَقِيْبَتِي، قَلَمِي، عِنْدِي). Keduanya benar; mohon pilih satu konvensi supaya siswa tidak bingung.
2. **Harakat i'rab selain marfu'.** SKILL.md hanya mengatur bentuk marfu' (dhammah) untuk kata ber-dhamir. Di hiwar ada bentuk majrur setelah لَوْنُ: مَا لَوْنُ حَقِيْبَتِكَ (kasrah). Akibatnya:
   - Generator soal dhamir (Latihan, Tarkib) **hanya** membuat bentuk marfu'.
   - Latihan substitusi di Hiwar **mempertahankan harakat asli** kalimat dialog (حَقِيْبَتِكَ → كُرْسِيِّكَ, bukan كُرْسِيُّكَ). Mohon cek apakah perilaku ini sesuai.

## C. Kata di teks yang tidak punya arti di data

Popover arti di Nushush sengaja **tidak** muncul untuk kata yang tidak ada di data (tidak mengarang arti), misalnya:
كَرَاسِيُّ (jamak dari كُرْسِيٌّ; jamak di luar cakupan Bab 3), تِلْمِيْذٌ، صَدِيْقَتِي، نَظِيْفٌ، جَمِيْلٌ، السَّابِعِ.
Kalau mau diberi arti, tambahkan ke JSON (misalnya bagian kosakata pendukung).

## D. Catatan yang sudah ada di JSON (tetap tampil di kartu)

- `qalam_rashash` (قَلَمُ رَصَاصٍ): arti harfiah "pensil", tapi gambar buku hal. 52 menunjukkan spidol.
- `mulshaq` (مُلْصَقٌ): di buku = lem; makna umum = poster/stiker.
- `mirsam` (مِرْسَمٌ) = pensil menurut buku.
- `marodh` (مَعْرَضٌ): arti diambil dari gambar buku (lemari kaca).
- `massahah`: buku juga menulis sinonim طَلَّاسَةٌ.
- `brojektor`: kata serapan, generator dhamir dimatikan.

## E. Istima'

- Skrip buku tadrib 4 no. 6 (لَوْنُ الْحَائِطِ) tidak disalin karena opsi jawabannya tidak memuat jawaban skrip (`istima.known_issue`). Tadrib 4 di web memakai kalimat dari teks nash orisinal.
- **Audio saat ini suara sintetis (AI)**: 97 file di `public/audio/` dibuat dengan Microsoft Edge TTS (`ar-SA-HamedNeural`). Suara AI bisa salah membaca harakat, terutama tanwin, syaddah, dan akhiran dhamir. **Mohon guru mendengar semuanya** (`npm run dev` → `/rekam`, tombol P) dan merekam ulang yang keliru. Rekaman guru otomatis menggantikan file AI untuk teks itu.
- edge-tts memakai layanan online Microsoft secara tidak resmi. Kalau sekolah butuh kepastian izin, ganti semua dengan rekaman guru.

## F. Pemodelan teks

Kedua teks nash orisinal tidak punya kalimat penutup yang jelas, jadi latihan "tandai struktur" sengaja **tanpa kunci jawaban otomatis**. Siswa diarahkan menulis penutup sendiri di tab Mandiri.

## G. Umum

Semua harakat di JSON adalah hasil transkripsi dari gambar PDF (`meta.transcription_note`), jadi perlu dicek ulang terhadap buku.
