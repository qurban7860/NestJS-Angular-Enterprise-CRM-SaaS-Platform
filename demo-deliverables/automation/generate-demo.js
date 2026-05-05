const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:4200';
const EMAIL = 'enterprise@gmail.com';
const PASSWORD = 'Enterprise123!';

const outputRoot = path.resolve(__dirname, '..');
const screenshotsDir = path.join(outputRoot, 'screenshots');
const artifactsDir = path.join(outputRoot, 'artifacts');
const videoTempDir = path.join(artifactsDir, 'video-temp');
const reportHtmlPath = path.join(outputRoot, 'ENTERPRISE_DEMO_REPORT.html');
const reportPdfPath = path.join(artifactsDir, 'ENTERPRISE_DEMO_REPORT.pdf');
const finalVideoPath = path.join(artifactsDir, 'ENTERPRISE_DEMO_VIDEO.webm');

const pages = [
  { slug: '01-landing', title: 'Landing Page', detail: 'Hero section, proof points, and CTA blocks.', url: `${BASE_URL}/`, requiresAuth: false },
  { slug: '02-dashboard', title: 'Dashboard', detail: 'Executive KPI shell, global search, and quick actions.', url: `${BASE_URL}/dashboard`, requiresAuth: true },
  { slug: '03-contacts', title: 'CRM Contacts', detail: 'Customer directory with search and export controls.', url: `${BASE_URL}/crm/contacts`, requiresAuth: true },
  { slug: '04-deals', title: 'Deals Kanban', detail: 'Pipeline stages for deal flow and forecasting visibility.', url: `${BASE_URL}/crm/deals`, requiresAuth: true },
  { slug: '05-tasks', title: 'Tasks Pipeline', detail: 'Operational board/list with filtering and status tracking.', url: `${BASE_URL}/tasks`, requiresAuth: true },
  { slug: '06-audit-trail', title: 'Audit Trail', detail: 'Admin-grade change history and governance view.', url: `${BASE_URL}/system/audit-logs`, requiresAuth: true },
  { slug: '07-team', title: 'Team Management', detail: 'Member directory with scalable role assignment workflow.', url: `${BASE_URL}/premium/team`, requiresAuth: true },
  { slug: '08-custom-roles', title: 'Custom Roles', detail: 'Granular RBAC setup for enterprise permission control.', url: `${BASE_URL}/premium/roles`, requiresAuth: true },
  { slug: '09-workflows', title: 'Workflows', detail: 'Automation surface for business rule orchestration.', url: `${BASE_URL}/premium/workflows`, requiresAuth: true },
  { slug: '10-reports', title: 'Reports', detail: 'Intelligence builder for analytics and export reporting.', url: `${BASE_URL}/premium/reports`, requiresAuth: true },
  { slug: '11-broadcasting', title: 'Broadcasting', detail: 'Real-time signal center for announcements and alerts.', url: `${BASE_URL}/premium/broadcasting`, requiresAuth: true },
  { slug: '12-pricing', title: 'Pricing', detail: 'Tier comparison and upgrade conversion path.', url: `${BASE_URL}/billing/pricing`, requiresAuth: true },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function safeWait(page, ms = 1000) {
  await page.waitForTimeout(ms);
}

async function gotoStable(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await safeWait(page, 1400);
}

async function isLoginScreen(page) {
  const url = page.url().toLowerCase();
  if (url.includes('/auth/login')) return true;
  const emailFieldVisible = await page
    .locator('input[placeholder="admin@enterprise.com"], input[placeholder*="Email Address"]')
    .first()
    .isVisible()
    .catch(() => false);
  const passwordFieldVisible = await page
    .locator('input[placeholder="Enter your password"], input[type="password"]')
    .first()
    .isVisible()
    .catch(() => false);
  return emailFieldVisible && passwordFieldVisible;
}

async function loginUi(page) {
  await gotoStable(page, `${BASE_URL}/auth/login`);
  const emailInput = page.locator('input[type="email"], input[placeholder*="admin"], input[placeholder*="Email"]').first();
  const passwordInput = page.locator('input[type="password"], input[placeholder*="password"], input[placeholder*="Password"]').first();
  await emailInput.fill(EMAIL);
  await passwordInput.fill(PASSWORD);
  await page.locator('button:has-text("Sign In")').first().click();
  await page.waitForURL((url) => !url.toString().includes('/auth/login'), { timeout: 60000 });
  await safeWait(page, 1000);
}

async function ensurePageReady(page, target) {
  await gotoStable(page, target.url);
  if (target.requiresAuth && (await isLoginScreen(page))) {
    await loginUi(page);
    await gotoStable(page, target.url);
  }

  if (target.requiresAuth && (await isLoginScreen(page))) {
    throw new Error(`Auth check failed for ${target.slug}; still on login page.`);
  }
}

async function scrollForVideo(page) {
  const totalHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = page.viewportSize()?.height || 768;
  const step = Math.max(Math.floor(viewportHeight * 0.68), 420);
  for (let y = 0; y < totalHeight; y += step) {
    await page.evaluate((scrollY) => window.scrollTo({ top: scrollY, behavior: 'auto' }), y);
    await safeWait(page, 380);
  }
  await safeWait(page, 450);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  await safeWait(page, 700);
}

function makeReportHtml(shots) {
  const cards = shots
    .map(
      (s) => `
      <section class="card">
        <h2>${s.title}</h2>
        <img src="./screenshots/${s.file}" alt="${s.title}" />
        <p class="meta">${s.detail}</p>
      </section>
    `
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Enterprise Platform - Feature Visual Report</title>
  <style>
    @page { size: A4 landscape; margin: 8mm; }
    body { font-family: Arial, sans-serif; margin: 0; color: #0f172a; background: #060912; }
    .hero { background: linear-gradient(135deg, #0b1220 0%, #311b5e 45%, #6d28d9 100%); color: #f8fafc; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 12px 14px; margin: 0 0 8px 0; }
    .hero h1 { margin: 0 0 6px 0; font-size: 18px; }
    .hero p { margin: 0; font-size: 11px; line-height: 1.35; color: #dbe3ff; }
    .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin: 0 0 8px 0; }
    .pill { background: linear-gradient(145deg, #0f172a, #1e1b4b); color: #e2e8f0; border: 1px solid #334155; border-radius: 8px; padding: 7px 8px; font-size: 10px; line-height: 1.3; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .card { page-break-inside: avoid; break-inside: avoid; border: 1px solid #3f3f46; background: #0b1020; border-radius: 8px; padding: 8px; }
    .card h2 { margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #f1f5f9; }
    .card img { width: 100%; border: 1px solid #eceef2; border-radius: 6px; display: block; }
    .meta { margin: 5px 0 0 0; color: #cbd5e1; font-size: 10px; line-height: 1.25; }
  </style>
</head>
<body>
  <section class="hero">
    <h1>Enterprise Platform Executive Overview</h1>
    <p>A unified enterprise suite combining CRM, sales pipeline, task execution, governance, automation, intelligence reporting, and commercial scaling in one premium operating layer.</p>
  </section>
  <section class="summary">
    <div class="pill"><strong>Growth Engine:</strong> Lead-to-deal visibility, pipeline orchestration, and conversion-focused workflows.</div>
    <div class="pill"><strong>Operational Control:</strong> Team execution, auditability, and role-based governance for scale.</div>
    <div class="pill"><strong>Enterprise Readiness:</strong> Automation, reporting intelligence, and clear upgrade path for SaaS expansion.</div>
  </section>
  <div class="grid">${cards}</div>
</body>
</html>`;
}

async function main() {
  ensureDir(screenshotsDir);
  ensureDir(artifactsDir);
  ensureDir(videoTempDir);

  for (const file of [finalVideoPath, reportPdfPath, reportHtmlPath]) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    recordVideo: {
      dir: videoTempDir,
      size: { width: 1366, height: 768 },
    },
  });

  const page = await context.newPage();
  const video = page.video();
  const shots = [];

  for (const target of pages) {
    await ensurePageReady(page, target);
    await scrollForVideo(page);
    const file = `${target.slug}.png`;
    await page.screenshot({
      path: path.join(screenshotsDir, file),
      fullPage: true,
    });
    shots.push({ ...target, file });
  }

  await safeWait(page, 700);
  await context.close();
  const rawVideoPath = await video.path();
  fs.copyFileSync(rawVideoPath, finalVideoPath);
  await browser.close();

  const reportHtml = makeReportHtml(shots);
  fs.writeFileSync(reportHtmlPath, reportHtml, 'utf8');

  const pdfBrowser = await chromium.launch({ headless: true });
  const pdfPage = await pdfBrowser.newPage({ viewport: { width: 1400, height: 980 } });
  await pdfPage.goto(`file:///${reportHtmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
  await pdfPage.pdf({
    path: reportPdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
  });
  await pdfBrowser.close();

  console.log('Demo generation complete.');
  console.log(`Video: ${finalVideoPath}`);
  console.log(`PDF:   ${reportPdfPath}`);
  console.log(`HTML:  ${reportHtmlPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
