const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const reportHtmlPath = path.resolve(__dirname, '..', 'ENTERPRISE_DEMO_REPORT.html');
  const reportPdfPath = path.resolve(__dirname, '..', 'artifacts', 'ENTERPRISE_DEMO_REPORT.pdf');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 980 } });
  await page.goto(`file:///${reportHtmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
  await page.pdf({
    path: reportPdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
  });
  await browser.close();
  console.log(reportPdfPath);
})();
