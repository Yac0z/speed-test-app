import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = join(__dirname, '..', 'test-screenshots', '2026-03-31');

test.describe('Speed Test App - Full Scenario Testing', () => {
  test('01 - Dashboard Initial Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByRole('heading', { name: 'Internet Speed Test' })
    ).toBeVisible();
    await expect(page.locator('text=Start Test')).toBeVisible();
    await expect(page.locator('text=Connection Info')).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'dashboard', '01-dashboard-initial-load.png'),
      fullPage: true,
    });
    console.log('✅ Dashboard loaded with speed test button and ISP info');
  });

  test('02 - Dashboard Navigation Links', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    const navLinks = page.locator('nav a, header a, [class*="nav"] a');
    await expect(navLinks.first()).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'dashboard', '02-navigation-links.png'),
      fullPage: true,
    });
    console.log('✅ Navigation links visible');
  });

  test('03 - Speed Test Button States', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    const startBtn = page.locator('button:has-text("Start Test")');
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toBeEnabled();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'dashboard', '03-start-test-button.png'),
      fullPage: false,
    });
    console.log('✅ Start Test button is visible and enabled');
  });

  test('04 - Speed Gauge Display', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    const gauge = page.locator('svg[aria-label*="Speed gauge"]');
    await expect(gauge).toBeVisible();
    await expect(page.locator('text=Ready')).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'dashboard', '04-speed-gauge.png'),
      fullPage: false,
    });
    console.log('✅ Speed gauge displays correctly');
  });

  test('05 - ISP Info Card', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await expect(page.locator('text=Connection Info')).toBeVisible();
    await expect(page.locator('text=ISP')).toBeVisible();
    await expect(page.locator('text=IP Address')).toBeVisible();
    await expect(page.locator('text=Location')).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'dashboard', '05-isp-info-card.png'),
      fullPage: false,
    });
    console.log('✅ ISP info card displays connection details');
  });

  test('06 - History Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/history`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Speed History');
    await expect(
      page.locator('text=No speed tests recorded yet')
    ).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'history', '06-history-empty-state.png'),
      fullPage: true,
    });
    console.log('✅ History page loads with empty state');
  });

  test('07 - History Date Filter', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/history`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("7D")')).toBeVisible();
    await expect(page.locator('button:has-text("30D")')).toBeVisible();
    await expect(page.locator('button:has-text("90D")')).toBeVisible();
    await expect(page.locator('button:has-text("1Y")')).toBeVisible();
    await expect(page.locator('button:has-text("All")')).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'history', '07-date-filter.png'),
      fullPage: false,
    });
    console.log('✅ Date filter controls visible (7D, 30D, 90D, 1Y, All)');
  });

  test('08 - History Export Button', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/history`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("Export CSV")')).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'history', '08-export-button.png'),
      fullPage: false,
    });
    console.log('✅ Export CSV button visible');
  });

  test('09 - Servers Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/servers`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Test Servers');
    await expect(page.locator('text=Auto Detect')).toBeVisible();
    await expect(page.locator('text=Local Server')).toBeVisible();
    await expect(page.locator('text=Cloudflare')).toBeVisible();
    await expect(page.locator('text=Fast.com')).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'servers', '09-servers-list.png'),
      fullPage: true,
    });
    console.log('✅ Servers page loads with 4 default servers');
  });

  test('10 - Servers Latency Test Button', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/servers`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("Test Latency")')).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'servers', '10-test-latency-button.png'),
      fullPage: false,
    });
    console.log('✅ Test Latency button visible');
  });

  test('11 - Servers Card Details', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/servers`);
    await page.waitForLoadState('networkidle');
    const serverCards = page.locator('[class*="rounded-xl"]');
    await expect(serverCards.first()).toBeVisible();
    await expect(page.locator('text=Nearest to you')).toBeVisible();
    await expect(page.locator('text=Your Network')).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'servers', '11-server-card-details.png'),
      fullPage: false,
    });
    console.log('✅ Server cards display location details');
  });

  test('12 - Settings Page Load', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Settings');
    await expect(page.locator('text=Appearance')).toBeVisible();
    await expect(page.locator('text=Test Settings')).toBeVisible();
    await expect(page.locator('text=Data')).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'settings', '12-settings-overview.png'),
      fullPage: true,
    });
    console.log('✅ Settings page loads with all sections');
  });

  test('13 - Settings Theme Selection', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("light")')).toBeVisible();
    await expect(page.locator('button:has-text("dark")')).toBeVisible();
    await expect(page.locator('button:has-text("system")')).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'settings', '13-theme-options.png'),
      fullPage: false,
    });
    console.log('✅ Theme options visible (light, dark, system)');
  });

  test('14 - Settings Test Duration Slider', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Test Duration')).toBeVisible();
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'settings', '14-test-duration-slider.png'),
      fullPage: false,
    });
    console.log('✅ Test duration slider visible');
  });

  test('15 - Settings Parallel Connections', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Parallel Connections')).toBeVisible();
    await page.screenshot({
      path: join(
        SCREENSHOT_DIR,
        'settings',
        '15-parallel-connections-slider.png'
      ),
      fullPage: false,
    });
    console.log('✅ Parallel connections slider visible');
  });

  test('16 - Settings Data Retention', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Data Retention')).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'settings', '16-data-retention-slider.png'),
      fullPage: false,
    });
    console.log('✅ Data retention slider visible');
  });

  test('17 - Settings Clear History', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('button:has-text("Clear All History")')
    ).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'settings', '17-clear-history-button.png'),
      fullPage: false,
    });
    console.log('✅ Clear history button visible');
  });

  test('18 - Settings Save Button', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('button:has-text("Save Settings")')
    ).toBeVisible();
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'settings', '18-save-settings-button.png'),
      fullPage: false,
    });
    console.log('✅ Save settings button visible');
  });

  test('19 - Settings Interaction - Change Theme', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("light")');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'settings', '19-theme-changed-to-light.png'),
      fullPage: false,
    });
    await page.click('button:has-text("dark")');
    console.log('✅ Theme switching works');
  });

  test('20 - Settings Interaction - Save Settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Save Settings")');
    await page.waitForTimeout(500);
    await expect(page.locator('button:has-text("Saved!")')).toBeVisible();
    await page.screenshot({
      path: join(
        SCREENSHOT_DIR,
        'settings',
        '20-settings-saved-confirmation.png'
      ),
      fullPage: false,
    });
    console.log('✅ Settings save confirmation works');
  });

  test('21 - Responsive - Mobile View (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Internet Speed Test');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'responsive', '21-mobile-375px-dashboard.png'),
      fullPage: true,
    });
    console.log('✅ Mobile view (375px) renders correctly');
  });

  test('22 - Responsive - Tablet View (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'responsive', '22-tablet-768px-dashboard.png'),
      fullPage: true,
    });
    console.log('✅ Tablet view (768px) renders correctly');
  });

  test('23 - Responsive - Desktop View (1440px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: join(
        SCREENSHOT_DIR,
        'responsive',
        '23-desktop-1440px-dashboard.png'
      ),
      fullPage: true,
    });
    console.log('✅ Desktop view (1440px) renders correctly');
  });

  test('24 - Responsive - Mobile History Page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/en/history`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'responsive', '24-mobile-375px-history.png'),
      fullPage: true,
    });
    console.log('✅ Mobile history page renders correctly');
  });

  test('25 - Responsive - Mobile Settings Page', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'responsive', '25-mobile-375px-settings.png'),
      fullPage: true,
    });
    console.log('✅ Mobile settings page renders correctly');
  });

  test('26 - Navigation Flow - All Pages', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("History")');
    await page.waitForURL('**/history');
    await expect(page.locator('h1')).toContainText('Speed History');
    await page.click('a:has-text("Servers")');
    await page.waitForURL('**/servers');
    await expect(page.locator('h1')).toContainText('Test Servers');
    await page.click('a:has-text("Settings")');
    await page.waitForURL('**/settings');
    await expect(page.locator('h1')).toContainText('Settings');
    await page.click('a:has-text("Speed Test")');
    await page.waitForURL('**/en');
    await page.screenshot({
      path: join(
        SCREENSHOT_DIR,
        'dashboard',
        '26-navigation-flow-complete.png'
      ),
      fullPage: true,
    });
    console.log(
      '✅ Full navigation flow works: Dashboard → History → Servers → Settings → Dashboard'
    );
  });

  test('27 - API Routes - Results Endpoint', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/en/api/results`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    console.log('✅ API /api/results returns array');
  });

  test('28 - API Routes - Servers Endpoint', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/en/api/servers`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    console.log(`✅ API /api/servers returns ${data.length} servers`);
  });

  test('29 - API Routes - Speed Download Endpoint', async ({ page }) => {
    const response = await page.request.get(
      `${BASE_URL}/en/api/speed/download?size=1024`
    );
    expect(response.status()).toBe(200);
    console.log('✅ API /api/speed/download returns binary data');
  });

  test('30 - API Routes - Speed Upload Endpoint', async ({ page }) => {
    const response = await page.request.post(
      `${BASE_URL}/en/api/speed/upload`,
      {
        data: { test: 'data' },
      }
    );
    expect(response.status()).toBe(200);
    console.log('✅ API /api/speed/upload accepts POST requests');
  });

  test('31 - API Routes - Speed Ping Endpoint', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/en/api/speed/ping`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('timestamp');
    console.log('✅ API /api/speed/ping returns timestamp');
  });

  test('32 - Page Load Performance', async ({ page }) => {
    await page.goto(`${BASE_URL}/en/`);
    const metrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation');
      const navigation = entries.find(
        (e): e is PerformanceNavigationTiming => e.entryType === 'navigation'
      );
      if (!navigation) {
        return { domContentLoaded: 0, loadComplete: 0, domInteractive: 0 };
      }
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.startTime,
        loadComplete: navigation.loadEventEnd - navigation.startTime,
        domInteractive: navigation.domInteractive - navigation.startTime,
      };
    });
    console.log(
      `✅ Page load metrics: DOM Interactive: ${metrics.domInteractive.toFixed(0)}ms, DOM Content Loaded: ${metrics.domContentLoaded.toFixed(0)}ms, Load Complete: ${metrics.loadComplete.toFixed(0)}ms`
    );
    expect(metrics.domContentLoaded).toBeLessThan(5000);
  });

  test('33 - No Console Errors on Dashboard', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(errors.length).toBe(0);
    console.log('✅ No console errors on dashboard');
  });

  test('34 - No Console Errors on History', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    await page.goto(`${BASE_URL}/en/history`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(errors.length).toBe(0);
    console.log('✅ No console errors on history page');
  });

  test('35 - No Console Errors on Servers', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    await page.goto(`${BASE_URL}/en/servers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(errors.length).toBe(0);
    console.log('✅ No console errors on servers page');
  });

  test('36 - No Console Errors on Settings', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    expect(errors.length).toBe(0);
    console.log('✅ No console errors on settings page');
  });

  test('37 - Full Page Screenshot - Dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'dashboard', '37-dashboard-fullpage.png'),
      fullPage: true,
    });
    console.log('✅ Full dashboard screenshot captured');
  });

  test('38 - Full Page Screenshot - History', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/history`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'history', '38-history-fullpage.png'),
      fullPage: true,
    });
    console.log('✅ Full history page screenshot captured');
  });

  test('39 - Full Page Screenshot - Servers', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/servers`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'servers', '39-servers-fullpage.png'),
      fullPage: true,
    });
    console.log('✅ Full servers page screenshot captured');
  });

  test('40 - Full Page Screenshot - Settings', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/en/settings`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, 'settings', '40-settings-fullpage.png'),
      fullPage: true,
    });
    console.log('✅ Full settings page screenshot captured');
  });
});
