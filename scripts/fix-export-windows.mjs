// Workaround bug Next.js static export di Windows: file prefetch segment ditulis sebagai
// `out/<route>/__next.<seg>/__PAGE__.txt` (karena path.relative memakai "\"), padahal router
// meminta `out/<route>/__next.<seg>.__PAGE__.txt`. Di Linux/macOS skrip ini tidak melakukan apa-apa.
import { readdirSync, renameSync, rmdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'out';
let fixed = 0;

function flatten(dir, prefix, parent) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) flatten(full, `${prefix}.${name}`, parent);
    else {
      renameSync(full, join(parent, `${prefix}.${name}`));
      fixed++;
    }
  }
  rmdirSync(dir);
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory() || name === '_next') continue;
    if (name.startsWith('__next.')) flatten(full, name, dir);
    else walk(full);
  }
}

try {
  walk(OUT);
  if (fixed) console.log(`fix-export-windows: ${fixed} file segment dirapikan.`);
} catch (e) {
  if (e.code !== 'ENOENT') throw e;
}
