const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
(async () => {
  const reportHtmlPath = path.resolve(__dirname, '..', 'ENTERPRISE_DEMO_REPORT.html');
  const reportPdfPath = path.resolve(__dirname, '..', 'artifacts', 'ENTERPRISE_DEMO_REPORT.pdf');
  const artifactsDir = path.dirname(reportPdfPath);
  fs.mkdirSync(artifactsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 980 } });
  await page.goto(`file:///${reportHtmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
  await page.waitForLoadState('load');
  await page.evaluate(async () => {
    const images = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      images.map(async (img) => {
        if (img.complete && img.naturalWidth > 0) {
          return;
        }
        await new Promise((resolve, reject) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', () => reject(new Error(`Failed to load image: ${img.src}`)), { once: true });
        });
      })
    );
    await Promise.all(images.map((img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve())));
    document.fonts && (await document.fonts.ready);
  });
  await page.pdf({
    path: reportPdfPath,
    format: 'A4',
    landscape: true,
    preferCSSPageSize: true,
    scale: 1,
    printBackground: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
  });
  await browser.close();
  console.log(reportPdfPath);
})();
