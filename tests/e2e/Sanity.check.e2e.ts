import { expect, test } from '@playwright/test';

test.describe('Sanity', () => {
  test.describe('Static pages', () => {
    test('should display the homepage', async ({ page }) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', {
          name: 'Speed Test',
        })
      ).toBeVisible();
    });

    test('should navigate to the about page', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('link', { name: 'About' }).click();

      await expect(page).toHaveURL(/about$/);

      await expect(
        page.getByText('Welcome to our About page', { exact: false })
      ).toBeVisible();
    });

    test('should navigate to the portfolio page', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('link', { name: 'Portfolio' }).click();

      await expect(page).toHaveURL(/portfolio$/);

      await expect(
        page.locator('main').getByRole('link', { name: /^Portfolio/ })
      ).toHaveCount(6);
    });
  });
});
