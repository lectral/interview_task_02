import { expect, test } from '@playwright/test';

test('homepage has expected heading', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Example Domain/);
  await expect(page.getByRole('heading', { name: 'Example Domain' })).toBeVisible();
});
