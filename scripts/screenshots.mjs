// Screenshot halaman (light+dark, 360px) untuk QA visual harakat. Server: node scripts/serve-out.mjs
// Pakai: node scripts/screenshots.mjs <outDir> <path1> <path2> ...
import { chromium } from '@playwright/test';

const [outDir, ...paths] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, colorScheme: scheme, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && !m.text().startsWith('Failed to load resource') && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('response', (r) => r.status() >= 400 && errors.push(`HTTP ${r.status()} ${r.url()}`));
  for (const p of paths) {
    await page.goto(`http://localhost:4173${p}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const name = `${outDir}/${scheme}${p.replace(/\//g, '_') || '_home'}.png`;
    await page.screenshot({ path: name, fullPage: true });
    await page.screenshot({ path: name.replace('.png', '-top.png') });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(scheme, p, 'overflowX=', overflow);
  }
  if (errors.length) console.log('ERRORS', scheme, errors);
  await ctx.close();
}
await browser.close();
