// Add-to-cart journey. Verified against the live theme: the submit button carries
// no name="add" attribute, so select it by type+form rather than by name.
export const name = 'cart';

export async function run({ page, shot, settle }) {
  const findings = [];
  const base = process.env.QA_URL;

  const pdp = await page.evaluate(async () => {
    const r = await fetch('/products.json?limit=1');
    const j = await r.json().catch(() => ({}));
    return j.products?.[0]?.handle || null;
  }).catch(() => null) || await (async () => {
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
    const h = await page.locator('a[href*="/products/"]').first().getAttribute('href');
    return h?.split('/products/')[1]?.split('?')[0] || null;
  })();

  if (!pdp) {
    findings.push({ check: 'find-a-product', severity: 'critical', detail: 'No product link found from the homepage' });
    return findings;
  }

  await page.goto(new URL(`/products/${pdp}`, base).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // Settle before asserting. The product form renders after initial paint; asserting
  // too early produced a false "no /cart/add form" critical on a perfectly good page.
  await settle();

  // Wait for the form rather than sampling once: settle() alone was not enough and
  // produced an intermittent false critical on a page that renders the form fine.
  const form = page.locator('form[action*="/cart/add"]').first();
  try {
    await form.waitFor({ state: 'attached', timeout: 20000 });
  } catch {
    findings.push({ check: 'product-form-exists', severity: 'critical', detail: `No /cart/add form on /products/${pdp} after 20s` });
    return findings;
  }

  // Find the add-to-cart control the SHOPPER can actually see. The theme renders
  // more than one candidate and hides the unused one per breakpoint, so scoping to
  // the form's submit button reported a false critical on mobile, where the visible
  // button sits outside the form. Match on what is rendered, not on markup shape.
  const candidates = page.locator(
    'form[action*="/cart/add"] button[type="submit"], button[name="add"], ' +
    '[class*="add-to-cart"], [class*="product-form__submit"], button:has-text("Add to cart")');
  let submit = null;
  for (let i = 0; i < await candidates.count(); i++) {
    const c = candidates.nth(i);
    if (await c.isVisible().catch(() => false)) { submit = c; break; }
  }
  if (!submit) {
    findings.push({ check: 'add-to-cart-visible', severity: 'critical',
      detail: 'No visible add-to-cart control anywhere on the product page' });
    return findings;
  }

  const before = await page.evaluate(async () => (await (await fetch('/cart.js')).json()).item_count);
  await submit.click();
  await page.waitForTimeout(4000);
  const after = await page.evaluate(async () => (await (await fetch('/cart.js')).json()).item_count);

  if (after <= before) {
    findings.push({ check: 'add-to-cart-works', severity: 'critical',
      detail: `Clicking add-to-cart did not change the cart (${before} -> ${after})` });
  }

  // After adding, a shopper needs feedback: a drawer, or a cart count that moved.
  const drawerVisible = await page.locator('[class*="cart-drawer"], [id*="cart-drawer"], [class*="cart__drawer"]')
    .first().isVisible().catch(() => false);
  const badge = await page.locator('[class*="cart-count"], [class*="cart__count"], [class*="cart-bubble"]')
    .first().textContent().catch(() => null);
  if (!drawerVisible && !(badge && badge.trim())) {
    findings.push({ check: 'add-to-cart-feedback', severity: 'medium',
      detail: 'Nothing visibly confirmed the add: no cart drawer opened and no cart count is shown' });
  }

  await shot('cart-after-add');
  return findings;
}
