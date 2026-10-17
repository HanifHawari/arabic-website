// Buat rekaman otomatis (suara sintetis Microsoft Edge TTS) untuk semua teks di katalog audio.
// Hasil: public/audio/<key>.mp3. Teks yang SUDAH punya rekaman (mis. rekaman guru) dilewati,
// kecuali dengan --force. Hasil suara AI tetap perlu didengar guru (halaman /rekam, tombol P).
//
// Prasyarat: Python + `pip install edge-tts` (CLI `edge-tts` ada di PATH, atau beri --edge-tts <path>).
// Pemakaian:
//   node scripts/generate-tts-audio.mjs [--voice ar-SA-HamedNeural] [--rate=-10%] [--force] [--only vocab/haqibah,...]
// Catatan: edge-tts memakai layanan online Microsoft (teks Arab dikirim ke server Microsoft).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { buildAudioCatalog } from './audio-catalog.mjs';
import { listAudioFiles, writeAudioManifest } from './audio-manifest.mjs';

function arg(name, fallback) {
  const i = process.argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i === -1) return fallback;
  const a = process.argv[i];
  return a.includes('=') ? a.slice(a.indexOf('=') + 1) : (process.argv[i + 1] ?? fallback);
}
const flag = (name) => process.argv.includes(`--${name}`);

const voice = arg('voice', 'ar-SA-HamedNeural');
const rate = arg('rate', '-10%');
const edgeTts = arg('edge-tts', 'edge-tts');
const force = flag('force');
const only = arg('only', '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const content = JSON.parse(readFileSync('content/bab3.json', 'utf8'));
const existing = new Set(listAudioFiles().map((f) => f.slice(0, f.lastIndexOf('.'))));
const items = buildAudioCatalog(content).filter((i) => (only.length ? only.includes(i.key) : true));

const check = spawnSync(edgeTts, ['--version'], { encoding: 'utf8' });
if (check.status !== 0) {
  console.error(`Tidak menemukan "${edgeTts}". Pasang dulu: pip install edge-tts (atau beri --edge-tts <path>).`);
  process.exit(1);
}

let made = 0;
let skipped = 0;
const failed = [];
for (const [n, item] of items.entries()) {
  const target = join('public', 'audio', `${item.key}.mp3`);
  if (existing.has(item.key) && !force) {
    skipped++;
    continue;
  }
  mkdirSync(dirname(target), { recursive: true });
  // Teks dikirim lewat argumen (UTF-8); --rate=… harus satu argumen karena nilainya diawali "-".
  // Layanan kadang gagal sesaat ("No audio was received"), jadi coba sampai 3 kali.
  let r;
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    r = spawnSync(edgeTts, ['--voice', voice, `--rate=${rate}`, '--text', item.text, '--write-media', target], {
      encoding: 'utf8',
    });
    ok = r.status === 0 && existsSync(target) && statSync(target).size > 1000;
  }
  if (!ok) {
    failed.push(`${item.key}: ${(r.stderr || r.error?.message || 'file kosong').trim().split('\n').pop()}`);
    if (existsSync(target)) unlinkSync(target);
    continue;
  }
  // --force: buang format lain untuk key yang sama supaya hanya ada satu versi.
  for (const ext of ['m4a', 'webm', 'ogg', 'wav']) {
    const other = join('public', 'audio', `${item.key}.${ext}`);
    if (existsSync(other)) unlinkSync(other);
  }
  made++;
  console.log(`[${n + 1}/${items.length}] ${item.key}  ${item.label}`);
}

const files = writeAudioManifest();
console.log(`\nSelesai: ${made} dibuat, ${skipped} dilewati (sudah ada), ${failed.length} gagal. Total rekaman: ${files.length}.`);
if (failed.length) {
  console.log('Gagal:\n- ' + failed.join('\n- '));
  process.exitCode = 1;
}
console.log('Jangan lupa: dengarkan hasilnya (npm run dev → /rekam, tombol P) lalu npm run build.');
