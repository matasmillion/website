// Headless browser driver for storefront QA.
//
// Environment notes (discovered the hard way, do not "simplify"):
//  - Chromium is pre-installed; never run `playwright install`.
//  - The playwright lib is a GLOBAL npm package. ESM ignores NODE_PATH, so it is
//    loaded via createRequire against an absolute path.
//  - All egress goes through the session proxy, and Chromium's TLS 1.3 handshake
//    is reset by it. Capping at TLS 1.2 fixes it WITHOUT weakening certificate
//    verification. Do not swap this for ignoreHTTPSErrors: that was tested and
//    does not help, because this is not a certificate problem.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

export const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
export const ARGS = [
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--ssl-version-max=tls1.2',
  '--disable-background-networking',
  '--disable-component-update',
  '--no-first-run',
];

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

// Request noise that is NOT a site bug and must never be reported as a finding:
//  - hosts the environment's network allowlist blocks on purpose (analytics vendors)
//  - Shopify's own tracking and telemetry endpoints, which fail in preview sessions
//    regardless of theme health (web-pixels, otlp metrics, api/collect)
// Verified against a real run: every failed request on the homepage was one of these.
export const IGNORED_HOSTS = [
  'static.klaviyo.com', 'shop.app', 'googletagmanager.com', 'google-analytics.com',
  'web-pixels', 'shopifysvc.com', '/api/collect',
];

export async function launch() {
  return chromium.launch({
    executablePath: CHROME,
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    args: ARGS,
  });
}

export async function openPage(browser, viewport = 'desktop') {
  const ctx = await browser.newContext({ viewport: VIEWPORTS[viewport] });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('requestfailed', r => {
    const url = r.url();
    if (IGNORED_HOSTS.some(h => url.includes(h))) return;
    failedRequests.push({ url: url.slice(0, 160), error: r.failure()?.errorText });
  });
  return { ctx, page, consoleErrors, failedRequests };
}

// Settle a Shopify page: let lazy-loaded imagery in, then return to the top.
export async function settle(page) {
  await page.waitForTimeout(4000);
  await page.evaluate(() => new Promise(res => {
    let y = 0;
    const t = setInterval(() => {
      window.scrollBy(0, 900); y += 900;
      if (y > document.body.scrollHeight) { clearInterval(t); res(); }
    }, 120);
  }));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
}

// The Shopify preview banner is injected into preview sessions and lands in the
// middle of a full-page screenshot, obscuring real content. Hide it before capture.
export async function hidePreviewBar(page) {
  await page.addStyleTag({
    content: '#preview-bar-iframe,#admin-bar-iframe,.shopify-preview-bar{display:none !important}',
  }).catch(() => {});
}
