import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { trackErrors } from './helpers';

const PAGES = ['/', '/mufradat', '/nushush', '/hiwar', '/tarkib', '/latihan', '/istima', '/produksi'];

/** Semua node teks yang berisi huruf Arab harus berada di dalam elemen lang="ar" dir="rtl". */
async function arabicOutsideWrapper(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const bad: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent ?? '';
      if (!/[؀-ۿ]/.test(text)) continue;
      const el = n.parentElement;
      if (!el || el.closest('script, style, noscript')) continue;
      const ar = el.closest('[lang="ar"]');
      if (!ar || ar.closest('[dir]')?.getAttribute('dir') !== 'rtl') bad.push(text.trim().slice(0, 40));
    }
    return bad;
  });
}

/** Teks Arab yang terpotong oleh container ber-overflow hidden/clip. */
async function clippedArabic(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const bad: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('[lang="ar"]'))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (!/(hidden|clip)/.test(cs.overflowY + cs.overflowX)) continue;
        const ar = a.getBoundingClientRect();
        if (r.top < ar.top - 1 || r.bottom > ar.bottom + 1) bad.push((el.textContent ?? '').trim().slice(0, 40));
        break;
      }
    }
    return bad;
  });
}

for (const path of PAGES) {
  test(`audit ${path}: lang/dir Arab, tanpa overflow, tanpa error`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto(path, { waitUntil: 'networkidle' });
    expect(await page.locator('html').getAttribute('lang')).toBe('id');
    expect(await page.locator('html').getAttribute('dir')).toBeNull();
    await expect(page.locator('h1').first()).toBeVisible();
    expect(await arabicOutsideWrapper(page)).toEqual([]);
    expect(await clippedArabic(page)).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, 'scroll horizontal di 360px').toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

for (const width of [320, 768, 1440]) {
  test(`responsif ${width}px: tanpa scroll horizontal di semua halaman`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of PAGES) {
      await page.goto(path, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} @${width}px`).toBeLessThanOrEqual(0);
      expect(await clippedArabic(page), `${path} @${width}px`).toEqual([]);
    }
  });
}

test('state interaktif juga patuh aturan Arab (flashcard, popover, role-play, quiz, keyboard)', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/mufradat');
  await page.getByRole('button', { name: /Flashcard/ }).click();
  await page.getByRole('button', { name: /Balik kartu/ }).click();
  await page.getByRole('tab', { name: 'Warna' }).click();
  expect(await arabicOutsideWrapper(page)).toEqual([]);

  await page.goto('/nushush');
  await page.locator('ol li').first().getByRole('button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /Kerjakan 5 soal/ }).click();
  expect(await arabicOutsideWrapper(page)).toEqual([]);

  await page.goto('/hiwar');
  await page.getByRole('button', { name: /Role-play/ }).click();
  await page.getByRole('button', { name: 'زَيْدٌ' }).click();
  expect(await arabicOutsideWrapper(page)).toEqual([]);

  await page.goto('/tarkib');
  await page.locator('#warna').getByRole('button', { name: 'Mulai 3 soal' }).click();
  expect(await arabicOutsideWrapper(page)).toEqual([]);

  await page.goto('/produksi');
  await page.getByRole('tab', { name: 'Mandiri' }).click();
  for (const k of ['huruf alif', 'huruf lam', 'huruf kaf', 'huruf ta', 'huruf alif', 'huruf ba', 'huruf kaf']) {
    await page.getByRole('button', { name: k, exact: true }).click();
  }
  await expect(page.locator('#tulisan')).toHaveValue('الكتابك');
  await expect(page.getByText(/kata yang sudah ber-dhamir tidak pakai alif-lam/)).toBeVisible();
  expect(await arabicOutsideWrapper(page)).toEqual([]);
  expect(errors).toEqual([]);
});

test('halaman rekam guru & API-nya tidak ikut ke situs produksi', async ({ request }) => {
  expect((await request.get('/rekam')).status()).toBe(404);
  expect((await request.get('/api/audio')).status()).toBe(404);
});

test('rekaman di public/audio diputar walau perangkat tidak punya suara Arab', async ({ page }) => {
  const files: string[] = JSON.parse(readFileSync('lib/audio-files.generated.json', 'utf8'));
  const file = files.find((f) => f.startsWith('vocab/haqibah.'));
  test.skip(!file, 'Belum ada rekaman untuk vocab/haqibah');
  await page.goto('/mufradat');
  const btn = page.getByRole('button', { name: 'Putar audio: tas' });
  await expect(btn).toBeEnabled();
  const src = await page.evaluate(async () => {
    let played: string | null = null;
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      played = this.src;
      return orig.call(this);
    };
    document.querySelector<HTMLButtonElement>('button[aria-label="Putar audio: tas"]')!.click();
    await new Promise((r) => setTimeout(r, 500));
    return played;
  });
  expect(src).toContain(`/audio/${file}`);
});

test('progres bertahan setelah reload', async ({ page }) => {
  await page.goto('/mufradat');
  await page.getByRole('button', { name: 'Tandai sudah hafal: tas' }).click();
  await expect(page.getByText('Sudah hafal 1 dari 63 kosakata.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Sudah hafal 1 dari 63 kosakata.')).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Lanjut belajar: Mufradat/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Mufradat.*Sedang/ })).toBeVisible();
});

test('app tetap jalan kalau localStorage diblok', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Diblok', 'SecurityError');
      },
    });
  });
  const errors = trackErrors(page);
  await page.goto('/mufradat');
  await page.getByRole('button', { name: 'Tandai sudah hafal: tas' }).click();
  await expect(page.getByText('Sudah hafal 1 dari 63 kosakata.')).toBeVisible();
  await page.goto('/produksi');
  await page.getByRole('tab', { name: 'Mandiri' }).click();
  await page.locator('#tulisan').fill('هَذَا كِتَابٌ');
  await expect(page.getByText(/Mufradat Bab 3 yang terpakai/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('Mode Kelas: navigasi disembunyikan, panah pindah modul, Esc keluar', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Mode Kelas/ }).click();
  await expect(page.getByRole('navigation', { name: 'Modul' })).toBeHidden();
  expect(await page.locator('html').getAttribute('data-class-mode')).toBe('on');
  const word = page.locator('[lang="ar"]').first();
  const size = await word.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThan(60); // hero 2.75rem × 1.6
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/\/mufradat$/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Modul' })).toBeVisible();
});

test('ukuran minimum font Arab: kata ≥ 28px, paragraf ≥ 22px, line-height ≥ 1.9', async ({ page }) => {
  await page.goto('/mufradat');
  const word = await page.locator('.text-arabic-word').first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return { size: parseFloat(cs.fontSize), lh: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) };
  });
  expect(word.size).toBeGreaterThanOrEqual(28);
  expect(word.lh).toBeGreaterThanOrEqual(1.9);
  await page.goto('/nushush');
  const para = await page.locator('.text-arabic-para').first().evaluate((el) => {
    const cs = getComputedStyle(el);
    return { size: parseFloat(cs.fontSize), lh: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) };
  });
  expect(para.size).toBeGreaterThanOrEqual(22);
  expect(para.lh).toBeGreaterThanOrEqual(1.9);
});
