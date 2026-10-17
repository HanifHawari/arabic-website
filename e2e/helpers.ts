import { expect, type Page } from '@playwright/test';

/** Kumpulkan error konsol / halaman / HTTP selama test. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(`console: ${m.text()}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`);
  });
  return errors;
}

/** Jawab satu soal kuis apa adanya (tidak harus benar), lalu lanjut. */
export async function answerCurrentQuestion(page: Page) {
  const runner = page.locator('main');
  const periksa = runner.getByRole('button', { name: 'Periksa' });
  const lanjut = runner.getByRole('button', { name: /Lanjut →|Lihat hasil/ });

  if (await page.getByLabel('Baris jawaban').count()) {
    // Susun kalimat: ketuk semua kata yang tersisa.
    const pool = page.getByLabel('Pilihan kata').getByRole('button');
    while ((await pool.count()) > 0) await pool.first().click();
    await periksa.click();
  } else if (await page.getByRole('list', { name: 'Warna', exact: true }).count()) {
    // Jodohkan: pasangkan tiap swatch dengan kata ke-i.
    const swatches = page.getByRole('list', { name: 'Warna', exact: true }).getByRole('button');
    const words = page.getByRole('list', { name: 'Kata warna' }).getByRole('button');
    const n = await swatches.count();
    for (let i = 0; i < n; i++) {
      await swatches.nth(i).click();
      await words.nth(i).click();
    }
    await periksa.click();
  } else {
    await runner.locator('ul button[aria-pressed]').first().click();
  }
  await expect(page.getByRole('status').filter({ hasText: /Benar|Belum tepat/ })).toBeVisible();
  await lanjut.click();
}
