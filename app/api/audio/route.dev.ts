// API simpan rekaman guru — HANYA saat `next dev` (ekstensi .dev.ts, lihat next.config.ts).
// Menulis file ke public/audio/<key>.<ext>, lalu memperbarui lib/audio-files.generated.json.

import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { AUDIO_FORMATS, audioCatalog, extForMime, KEY_PATTERN } from '@/lib/audio';
import { content } from '@/lib/content';
import { listAudioFiles, writeAudioManifest } from '@/scripts/audio-manifest.mjs';

const KEYS = new Set(audioCatalog(content).map((i) => i.key));
const MAX_BYTES = 5 * 1024 * 1024;
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

/** Hanya terima permintaan dari komputer ini (bukan dari HP lain di jaringan yang sama). */
function isLocal(req: Request): boolean {
  const local = (h: string) => ['localhost', '127.0.0.1', '[::1]', '::1'].includes(h);
  try {
    if (!local(new URL(req.url).hostname)) return false;
    const origin = req.headers.get('origin');
    // Origin "null" (mis. dari file lokal) atau tidak valid → ditolak.
    return !origin || local(new URL(origin).hostname);
  } catch {
    return false;
  }
}

const json = (body: unknown, status = 200) => Response.json(body, { status });

async function removeVariants(key: string) {
  await Promise.all(
    AUDIO_FORMATS.map((f) => unlink(path.join(AUDIO_DIR, `${key}.${f.ext}`)).catch(() => undefined)),
  );
}

function validKey(key: string | null): key is string {
  return !!key && KEY_PATTERN.test(key) && KEYS.has(key);
}

export async function GET(req: Request) {
  if (!isLocal(req)) return json({ error: 'Hanya bisa dari localhost.' }, 403);
  return json({ files: listAudioFiles() });
}

export async function POST(req: Request) {
  if (!isLocal(req)) return json({ error: 'Hanya bisa dari localhost.' }, 403);
  const key = req.headers.get('x-audio-key');
  if (!validKey(key)) return json({ error: 'Key rekaman tidak dikenal.' }, 400);
  const ext = extForMime(req.headers.get('content-type') ?? '');
  if (!ext) return json({ error: 'Format audio tidak didukung.' }, 415);
  const data = Buffer.from(await req.arrayBuffer());
  if (data.length === 0) return json({ error: 'Rekaman kosong.' }, 400);
  if (data.length > MAX_BYTES) return json({ error: 'Rekaman terlalu besar (maks. 5 MB).' }, 413);

  const target = path.join(AUDIO_DIR, `${key}.${ext}`);
  await mkdir(path.dirname(target), { recursive: true });
  await removeVariants(key);
  await writeFile(target, data);
  return json({ file: `${key}.${ext}`, files: writeAudioManifest() });
}

export async function DELETE(req: Request) {
  if (!isLocal(req)) return json({ error: 'Hanya bisa dari localhost.' }, 403);
  const key = new URL(req.url).searchParams.get('key');
  if (!validKey(key)) return json({ error: 'Key rekaman tidak dikenal.' }, 400);
  await removeVariants(key);
  return json({ files: writeAudioManifest() });
}
