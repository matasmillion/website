// Usage: QA_URL=<preview-url> node scripts/qa/run.mjs [flow ...]
// Writes screenshots + qa-report.json to $QA_OUT (default ./qa-out).
// Exits non-zero when any finding is recorded, so the loop can gate on it.
import { mkdirSync, writeFileSync } from 'fs';
import { launch, openPage, settle, hidePreviewBar, VIEWPORTS } from './driver.mjs';
import * as home from './flows/home.mjs';
import * as cart from './flows/cart.mjs';

const ALL = { home, cart };
const OUT = process.env.QA_OUT || 'qa-out';
const wanted = process.argv.slice(2).filter(a => !a.startsWith('-'));
const flows = wanted.length ? wanted.map(n => ALL[n]).filter(Boolean) : Object.values(ALL);

if (!process.env.QA_URL) { console.error('QA_URL is required'); process.exit(2); }
mkdirSync(OUT, { recursive: true });

const browser = await launch();
const report = { url: process.env.QA_URL, flows: [] };

for (const flow of flows) {
  for (const viewport of Object.keys(VIEWPORTS)) {
    const { ctx, page, consoleErrors, failedRequests } = await openPage(browser, viewport);
    const entry = { flow: flow.name, viewport, findings: [], consoleErrors: [], failedRequests: [] };
    try {
      const shot = async label => {
        await settle(page);
        await hidePreviewBar(page);
        await page.screenshot({ path: `${OUT}/${label}-${viewport}.png`, fullPage: true });
      };
      entry.findings = await flow.run({ page, shot, settle: () => settle(page), viewport });
    } catch (e) {
      entry.findings.push({ check: 'flow-crashed', severity: 'critical', detail: String(e.message).split('\n')[0] });
    }
    entry.consoleErrors = consoleErrors.slice(0, 20);
    entry.failedRequests = failedRequests.slice(0, 20);
    report.flows.push(entry);
    console.log(`${flow.name}/${viewport}: ${entry.findings.length} finding(s), ${entry.failedRequests.length} failed request(s)`);
    for (const f of entry.findings) console.log(`   [${f.severity}] ${f.check}: ${f.detail}`);
    await ctx.close();
  }
}

await browser.close();
writeFileSync(`${OUT}/qa-report.json`, JSON.stringify(report, null, 2));
const total = report.flows.reduce((n, f) => n + f.findings.length, 0);
console.log(`\n${total} finding(s) total -> ${OUT}/qa-report.json`);
process.exit(total ? 1 : 0);
