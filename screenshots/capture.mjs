import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  // ===== 1. HOMEPAGE - IDLE STATE =====
  await page.goto('https://speed-test-app-nu.vercel.app', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: 'screenshots/homepage-idle.png',
    fullPage: true,
  });
  console.log('1. Captured: homepage-idle.png');

  // ===== 2. HOMEPAGE - AFTER TEST (with results) =====
  // Wait for page to fully load
  await page.goto('https://speed-test-app-nu.vercel.app', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(2000);

  // Click the start button to run a test
  const startButton = page.locator('button:has-text("INITIALIZE")');
  if (await startButton.isVisible()) {
    await startButton.click();
    console.log('   Running speed test...');
    // Wait for test to complete (usually ~15 seconds)
    await page.waitForTimeout(20_000);
  }

  await page.screenshot({
    path: 'screenshots/homepage-results.png',
    fullPage: true,
  });
  console.log(
    '2. Captured: homepage-results.png (with test results + quality score)'
  );

  // ===== 3. SHARE MODAL =====
  // Click share button if visible
  const shareButton = page.locator('button:has-text("Share")');
  if (await shareButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await shareButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'screenshots/share-modal.png',
      fullPage: false,
    });
    console.log('3. Captured: share-modal.png');
    // Close modal
    await page.keyboard.press('Escape');
  }

  // ===== 4. HISTORY PAGE (with data) =====
  await page.goto('https://speed-test-app-nu.vercel.app/en/history', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: 'screenshots/history-page.png',
    fullPage: true,
  });
  console.log('4. Captured: history-page.png');

  // ===== 5. HISTORY - DATE FILTER =====
  // Click on date filter dropdown
  const dateFilter = page
    .locator('button:has-text("30d"), button:has-text("7d")')
    .first();
  if (await dateFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
    await dateFilter.click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'screenshots/history-filter.png',
      fullPage: false,
    });
    console.log('5. Captured: history-filter.png (date filter dropdown)');
    await page.keyboard.press('Escape');
  }

  // ===== 6. SETTINGS PAGE =====
  await page.goto('https://speed-test-app-nu.vercel.app/en/settings', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: 'screenshots/settings-page.png',
    fullPage: true,
  });
  console.log('6. Captured: settings-page.png');

  // ===== 7. SETTINGS - THEME TOGGLE =====
  // Click on different theme options
  const themeButtons = page.locator(
    'button:has-text("Dark"), button:has-text("Light"), button:has-text("Auto")'
  );
  const themeCount = await themeButtons.count();
  if (themeCount > 1) {
    await themeButtons.nth(1).click(); // Click second theme option
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'screenshots/settings-theme.png',
      fullPage: true,
    });
    console.log('7. Captured: settings-theme.png (theme toggle)');
  }

  // ===== 8. SERVERS PAGE =====
  await page.goto('https://speed-test-app-nu.vercel.app/en/servers', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: 'screenshots/servers-page.png',
    fullPage: true,
  });
  console.log('8. Captured: servers-page.png');

  // ===== 9. MOBILE - IDLE =====
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('https://speed-test-app-nu.vercel.app', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: 'screenshots/mobile-idle.png',
    fullPage: true,
  });
  console.log('9. Captured: mobile-idle.png');

  // ===== 10. MOBILE - RESULTS =====
  // Try to click start on mobile
  const mobileStartButton = page
    .locator('button:has-text("INITIALIZE")')
    .first();
  if (await mobileStartButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await mobileStartButton.click();
    await page.waitForTimeout(20_000);
    await page.screenshot({
      path: 'screenshots/mobile-results.png',
      fullPage: true,
    });
    console.log('10. Captured: mobile-results.png');
  }

  // ===== 11. MOBILE - NAVIGATION MENU =====
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('https://speed-test-app-nu.vercel.app', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1000);
  // Take screenshot showing mobile navigation
  await page.screenshot({ path: 'screenshots/mobile-nav.png', fullPage: true });
  console.log('11. Captured: mobile-nav.png');

  // ===== 12. ABOUT PAGE =====
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('https://speed-test-app-nu.vercel.app/en/about', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screenshots/about-page.png', fullPage: true });
  console.log('12. Captured: about-page.png');

  // ===== 13. DARK MODE HOMEPAGE =====
  await page.goto('https://speed-test-app-nu.vercel.app/en', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: 'screenshots/homepage-dark.png',
    fullPage: true,
  });
  console.log('13. Captured: homepage-dark.png');

  // ===== 14. LIGHT MODE HOMEPAGE =====
  // Navigate to settings and switch to light mode, then go back home
  await page.goto('https://speed-test-app-nu.vercel.app/en/settings', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1000);
  // Switch to light mode if available
  const lightButton = page.locator('button:has-text("Light")');
  if (await lightButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await lightButton.click();
    await page.waitForTimeout(500);
  }
  await page.goto('https://speed-test-app-nu.vercel.app/en', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: 'screenshots/homepage-light.png',
    fullPage: true,
  });
  console.log('14. Captured: homepage-light.png');

  await browser.close();
  console.log('\n✅ All screenshots captured!');
})();
