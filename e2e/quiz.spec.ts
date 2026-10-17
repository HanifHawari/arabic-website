import { expect, test } from '@playwright/test';
import { answerCurrentQuestion, trackErrors } from './helpers';

test('latihan campuran: 10 soal → hasil → ulangi yang salah → skor tersimpan', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/latihan');
  await page.getByRole('button', { name: /Mulai 10 soal/ }).click();

  for (let i = 0; i < 10; i++) {
    await expect(page.getByText(`Soal ${i + 1} dari 10`)).toBeVisible();
    await answerCurrentQuestion(page);
  }
  await expect(page.getByRole('heading', { name: /Hasil: \d+\/10/ })).toBeVisible();

  const retry = page.getByRole('button', { name: /Ulangi yang salah/ });
  if (await retry.count()) {
    await retry.click();
    await expect(page.getByText(/Soal 1 dari \d+/)).toBeVisible();
  }

  await page.goto('/latihan');
  await expect(page.getByText(/Skor terbaik: \d+%/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('tarkib: mini-quiz dhamir selesai ditandai', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/tarkib');
  const section = page.locator('#dhamir');
  await section.getByRole('button', { name: 'Mulai 3 soal' }).click();
  for (let i = 0; i < 3; i++) await answerCurrentQuestion(page);
  await expect(section.getByText('✓ Sudah dikerjakan')).toBeVisible();
  expect(errors).toEqual([]);
});
