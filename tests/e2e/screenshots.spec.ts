import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = join(__dirname, '..', 'test-screenshots', '2026-03-31');

test.describe('Screenshot Capture', () => {
  test('01-dashboard-initial-load', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'dashboard', '01-dashboard-initial-load.png'),
      fullPage: true,
    });
  });

  test('02-start-test-button', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const button = page.locator('button:has-text("Start Test")');
    await button.screenshot({
      path: join(SCREENSHOT_DIR, 'dashboard', '02-start-test-button.png'),
    });
  });

  test('03-speed-gauge', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const gauge = page.locator('svg[aria-label*="Speed gauge"]').locator('..');
    await gauge.screenshot({
      path: join(SCREENSHOT_DIR, 'dashboard', '03-speed-gauge.png'),
    });
  });

  test('04-isp-info-card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    const card = page.locator('text=Connection Info').locator('..');
    await card.screenshot({
      path: join(SCREENSHOT_DIR, 'dashboard', '04-isp-info-card.png'),
    });
  });

  test('05-history-empty-state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/history`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'history', '05-history-empty-state.png'),
      fullPage: true,
    });
  });

  test('06-history-date-filter', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/history`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const filter = page.locator('text=7D').locator('..');
    await filter.screenshot({
      path: join(SCREENSHOT_DIR, 'history', '06-history-date-filter.png'),
    });
  });

  test('07-servers-list', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/servers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'servers', '07-servers-list.png'),
      fullPage: true,
    });
  });

  test('08-servers-test-latency', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/servers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const btn = page.locator('button:has-text("Test Latency")');
    await btn.screenshot({
      path: join(SCREENSHOT_DIR, 'servers', '08-servers-test-latency.png'),
    });
  });

  test('09-settings-overview', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'settings', '09-settings-overview.png'),
      fullPage: true,
    });
  });

  test('10-settings-theme-options', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const section = page.locator('text=Appearance').locator('..');
    await section.screenshot({
      path: join(SCREENSHOT_DIR, 'settings', '10-settings-theme-options.png'),
    });
  });

  test('11-settings-sliders', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const section = page.locator('text=Test Settings').locator('..');
    await section.screenshot({
      path: join(SCREENSHOT_DIR, 'settings', '11-settings-sliders.png'),
    });
  });

  test('12-settings-save-confirmation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Save Settings")');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: join(
        SCREENSHOT_DIR,
        'settings',
        '12-settings-save-confirmation.png'
      ),
    });
  });

  test('13-responsive-mobile-375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(
        SCREENSHOT_DIR,
        'responsive',
        '13-responsive-mobile-375px.png'
      ),
      fullPage: true,
    });
  });

  test('14-responsive-tablet-768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(
        SCREENSHOT_DIR,
        'responsive',
        '14-responsive-tablet-768px.png'
      ),
      fullPage: true,
    });
  });

  test('15-responsive-desktop-1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(
        SCREENSHOT_DIR,
        'responsive',
        '15-responsive-desktop-1440px.png'
      ),
      fullPage: true,
    });
  });

  test('16-navigation-flow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("History")');
    await page.waitForURL('**/history');
    await page.waitForTimeout(1000);
    await page.click('a:has-text("Servers")');
    await page.waitForURL('**/servers');
    await page.waitForTimeout(1000);
    await page.click('a:has-text("Settings")');
    await page.waitForURL('**/settings');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(
        SCREENSHOT_DIR,
        'dashboard',
        '16-navigation-flow-settings.png'
      ),
      fullPage: true,
    });
  });
});
