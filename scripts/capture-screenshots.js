const CDP = require('chrome-remote-interface');
const fs = require('node:fs');
const path = require('node:path');

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  let client;
  try {
    client = await CDP({ host: '127.0.0.1', port: 9222 });
    const { Page, Performance, Runtime, Emulation } = client;

    await Promise.all([Page.enable(), Performance.enable()]);

    // === Screenshot 1: Desktop homepage ===
    console.log('[1/5] Capturing desktop homepage...');
    await Emulation.setDeviceMetricsOverride({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await Page.navigate({ url: 'https://speed-test-app-nu.vercel.app/en' });
    await Page.loadEventFired();
    await new Promise((r) => setTimeout(r, 2000));
    const { data: desktopPng } = await Page.captureScreenshot({
      format: 'png',
    });
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'homepage-desktop.png'),
      Buffer.from(desktopPng, 'base64')
    );
    console.log('  Saved: homepage-desktop.png');

    // === Screenshot 2: Mobile homepage ===
    console.log('[2/5] Capturing mobile homepage...');
    await Emulation.setDeviceMetricsOverride({
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await Page.navigate({ url: 'https://speed-test-app-nu.vercel.app/en' });
    await Page.loadEventFired();
    await new Promise((r) => setTimeout(r, 2000));
    const { data: mobilePng } = await Page.captureScreenshot({ format: 'png' });
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'homepage-mobile.png'),
      Buffer.from(mobilePng, 'base64')
    );
    console.log('  Saved: homepage-mobile.png');

    // === Screenshot 3: History page ===
    console.log('[3/5] Capturing history page...');
    await Emulation.setDeviceMetricsOverride({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await Page.navigate({
      url: 'https://speed-test-app-nu.vercel.app/en/history',
    });
    await Page.loadEventFired();
    await new Promise((r) => setTimeout(r, 1000));
    const { data: historyPng } = await Page.captureScreenshot({
      format: 'png',
    });
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'history-page.png'),
      Buffer.from(historyPng, 'base64')
    );
    console.log('  Saved: history-page.png');

    // === Screenshot 4: About page ===
    console.log('[4/5] Capturing about page...');
    await Page.navigate({
      url: 'https://speed-test-app-nu.vercel.app/en/about',
    });
    await Page.loadEventFired();
    await new Promise((r) => setTimeout(r, 1000));
    const { data: aboutPng } = await Page.captureScreenshot({ format: 'png' });
    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'about-page.png'),
      Buffer.from(aboutPng, 'base64')
    );
    console.log('  Saved: about-page.png');

    // === Performance Audit ===
    console.log('[5/5] Running performance audit...');
    await Page.navigate({ url: 'https://speed-test-app-nu.vercel.app/en' });
    await Page.loadEventFired();

    const metrics = await Performance.getMetrics();
    const perfData = {};
    for (const m of metrics.metrics) {
      perfData[m.name] = m.value;
    }

    // Get LCP, FCP, CLS via Performance Timeline
    const timingResult = await Runtime.evaluate({
      expression: `(() => {
        const entries = performance.getEntriesByType('navigation');
        const paint = performance.getEntriesByType('paint');
        const nav = entries[0] || {};
        return {
          domContentLoaded: nav.domContentLoadedEventEnd || 0,
          loadComplete: nav.loadEventEnd || 0,
          domInteractive: nav.domInteractive || 0,
          fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          transferSize: nav.transferSize || 0,
          encodedBodySize: nav.encodedBodySize || 0,
          decodedBodySize: nav.decodedBodySize || 0,
        };
      })()`,
      returnByValue: true,
    });

    const perfReport = {
      timestamp: new Date().toISOString(),
      url: 'https://speed-test-app-nu.vercel.app/en',
      viewport: '1280x800',
      navigationTiming: timingResult.result.value ?? {},
      runtimeMetrics: {
        jsHeapSizeUsed: perfData.JSHeapUsedSize
          ? `${(perfData.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`
          : 'N/A',
        jsHeapTotal: perfData.JSHeapTotalSize
          ? `${(perfData.JSHeapTotalSize / 1024 / 1024).toFixed(2)} MB`
          : 'N/A',
        domNodes: perfData.Nodes ?? 'N/A',
        layoutCount: perfData.LayoutCount ?? 'N/A',
        recalcStyleCount: perfData.RecalcStyleCount ?? 'N/A',
        layoutDuration: perfData.LayoutDuration
          ? `${(perfData.LayoutDuration * 1000).toFixed(2)} ms`
          : 'N/A',
        scriptDuration: perfData.ScriptDuration
          ? `${(perfData.ScriptDuration * 1000).toFixed(2)} ms`
          : 'N/A',
        taskDuration: perfData.TaskDuration
          ? `${(perfData.TaskDuration * 1000).toFixed(2)} ms`
          : 'N/A',
        fps:
          perfData.FramesCount && perfData.Duration
            ? `${(perfData.FramesCount / perfData.Duration).toFixed(1)} fps`
            : 'N/A',
      },
    };

    fs.writeFileSync(
      path.join(SCREENSHOTS_DIR, 'performance-report.json'),
      JSON.stringify(perfReport, null, 2)
    );
    console.log('  Saved: performance-report.json');

    console.log('\n=== Performance Report ===');
    console.log(JSON.stringify(perfReport, null, 2));

    console.log('\nAll done! Screenshots saved to screenshots/');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (client) {await client.close();}
  }
}

run();
