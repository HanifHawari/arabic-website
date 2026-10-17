// Indeks rekaman yang tersedia di build ini. Daftar file dibuat oleh scripts/audio-manifest.mjs.

import files from '@/lib/audio-files.generated.json';
import { AudioIndex, audioCatalog } from '@/lib/audio';
import { content } from '@/lib/content';

export const audioIndex = new AudioIndex(audioCatalog(content), files as string[]);
