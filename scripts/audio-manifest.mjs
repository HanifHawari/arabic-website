// Tulis daftar file rekaman di public/audio ke lib/audio-files.generated.json.
// Dijalankan otomatis sebelum `npm run dev` dan `npm run build`, dan oleh API simpan rekaman (dev).
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

const EXTS = new Set(['mp3', 'm4a', 'webm', 'ogg', 'wav']);

export function listAudioFiles(projectDir = process.cwd()) {
  const root = join(projectDir, 'public', 'audio');
  if (!existsSync(root)) return [];
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (EXTS.has(name.split('.').pop()?.toLowerCase() ?? '')) out.push(relative(root, full).split(sep).join('/'));
    }
  };
  walk(root);
  return out.sort();
}

export function writeAudioManifest(projectDir = process.cwd()) {
  const files = listAudioFiles(projectDir);
  const target = join(projectDir, 'lib', 'audio-files.generated.json');
  const json = JSON.stringify(files, null, 2) + '\n';
  mkdirSync(join(projectDir, 'lib'), { recursive: true });
  // Jangan menulis ulang kalau sama (menghindari rebuild/HMR yang tidak perlu).
  if (!existsSync(target) || readFileSync(target, 'utf8') !== json) writeFileSync(target, json);
  return files;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const files = writeAudioManifest();
  console.log(`audio-manifest: ${files.length} file rekaman di public/audio.`);
}
