const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // Wait for page to fully load
  await page.goto('https://speed-test-app-nu.vercel.app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Screenshot 1: Homepage (idle state)
  await page.screenshot({ path: 'screenshots/homepage-idle.png', fullPage: true });
  console.log('Captured: homepage-idle.png');

  // Screenshot 2: Mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/homepage-mobile.png', fullPage: true });
  console.log('Captured: homepage-mobile.png');

  // Screenshot 3: History page
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('https://speed-test-app-nu.vercel.app/en/history', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/history-page.png', fullPage: true });
  console.log('Captured: history-page.png');

  await browser.close();
  console.log('All screenshots captured!');
})();
