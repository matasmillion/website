# Fixes: search price formatting + logo rendering

Theme: **JACQUEMUS 1.1** (unpublished draft), Shopify theme id `154396164261`.
Applied via the Shopify Admin API (`themeFilesUpsert`) and verified by re-fetching each file.
The live theme (STILLETO 2.2) was not touched.

## 1. Search results dropped the currency symbol and showed decimals (`57.00` → `$57`)

**File:** `assets/global.js` (inside `initSearchDrawer`, predictive results branch)

The typed-search results printed the raw `price` string that Shopify's
`/search/suggest.json` returns (a bare decimal like `"57.00"`), while the
"Most viewed" list already ran its value through the `money()` helper. That
inconsistency is why only the search results lost the `$` and gained `.00`.

```diff
- ? products.map((p) => itemHTML(p.url, p.image || p.featured_image, p.title, p.price)).join('')
+ ? products.map((p) => itemHTML(p.url, p.image || p.featured_image, p.title, p.price != null ? money(Math.round(parseFloat(p.price) * 100)) : '')).join('')
```

`money(cents)` divides by 100, applies the store currency, and strips a
trailing `.00`. `suggest.json` returns price in dollars, so `* 100` converts
to cents. Result now matches the rest of the site (`$57`).

## 2. Header logo rendered as a broken image

**File:** `sections/header.liquid` (centered header logo)

The `| times: 2` was applied to the image **URL string** returned by
`image_url`, not to the width number — producing an invalid `src`.

```diff
-          <img
-            src="{{ settings.logo | image_url: width: settings.logo_width | times: 2 }}"
-            alt="{{ shop.name }}"
-            width="{{ settings.logo_width }}"
-            height="{{ settings.logo_width | divided_by: settings.logo.aspect_ratio }}"
-            loading="eager"
-          >
+          {%- assign logo_width_2x = settings.logo_width | times: 2 -%}
+          <img
+            src="{{ settings.logo | image_url: width: logo_width_2x }}"
+            alt="{{ shop.name }}"
+            width="{{ settings.logo_width }}"
+            height="{{ settings.logo_width | divided_by: settings.logo.aspect_ratio | round }}"
+            loading="eager"
+          >
```

The separate mobile-menu logo `<img>` was already correct and left untouched.

## 3. Footer logo was squished/stretched

**File:** `sections/footer.liquid` (inline `<style>`)

`.footer__bottom-logo img` capped `max-height` but never set `width: auto`,
so the image's native width attribute stretched it out of proportion.

```diff
  .footer__bottom-logo img {
    max-height: 20px;
+   width: auto;
  }
```

## To go live

These changes are in the JACQUEMUS 1.1 **draft**. They appear on that theme's
preview now; publishing JACQUEMUS as the live theme (Shopify admin →
Online Store → Themes → Publish) is what makes them visible to shoppers.
