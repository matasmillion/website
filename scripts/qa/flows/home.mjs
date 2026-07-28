// Homepage checks. Each flow exports `name` and `run({ page, shot })` and
// returns an array of findings. A finding means "a human would call this broken".
export const name = 'home';

export async function run({ page, shot }) {
  const findings = [];

  await page.goto(process.env.QA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  const title = await page.title();
  if (!title || /404|not found|password/i.test(title)) {
    findings.push({ check: 'page-loads', severity: 'critical', detail: `Unexpected title: "${title}"` });
  }

  // Product cards: the title/price must sit clear of the product image, not on top
  // of it. Overlap here reads to a shopper as clipped, unreadable text.
  const overlaps = await page.evaluate(() => {
    const out = [];
    for (const card of document.querySelectorAll('.card, .product-card, [class*="product-card"], .card-wrapper')) {
      const img = card.querySelector('img');
      const label = card.querySelector('[class*="title"], [class*="heading"], h3, h2');
      if (!img || !label) continue;
      const i = img.getBoundingClientRect(), l = label.getBoundingClientRect();
      if (!i.height || !l.height) continue;
      const overlap = Math.min(i.bottom, l.bottom) - Math.max(i.top, l.top);
      if (overlap > 4) out.push({ text: (label.textContent || '').trim().slice(0, 60), overlapPx: Math.round(overlap) });
    }
    return out;
  });
  for (const o of overlaps) {
    findings.push({ check: 'card-text-overlaps-image', severity: 'high',
      detail: `Product card text "${o.text}" overlaps its image by ${o.overlapPx}px` });
  }

  // Text clipped by its own container (horizontal overflow inside a card).
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll('.card *, [class*="product-card"] *')]
      .filter(el => el.children.length === 0 && el.textContent.trim())
      .filter(el => el.scrollWidth > el.clientWidth + 2)
      .map(el => el.textContent.trim().slice(0, 60)).slice(0, 10));
  for (const t of clipped) {
    findings.push({ check: 'text-clipped', severity: 'medium', detail: `Text is cut off by its container: "${t}"` });
  }

  // Images that resolved but rendered at zero size, or never resolved at all.
  const brokenImgs = await page.evaluate(() =>
    [...document.images].filter(i => i.complete && i.naturalWidth === 0)
      .map(i => (i.currentSrc || i.src || '').slice(0, 120)).slice(0, 10));
  for (const src of brokenImgs) {
    findings.push({ check: 'broken-image', severity: 'high', detail: `Image failed to render: ${src}` });
  }

  // Horizontal page scroll is almost always a layout bug, especially on mobile.
  const hScroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (hScroll > 2) {
    findings.push({ check: 'horizontal-scroll', severity: 'high', detail: `Page scrolls sideways by ${hScroll}px` });
  }

  await shot('home');
  return findings;
}
