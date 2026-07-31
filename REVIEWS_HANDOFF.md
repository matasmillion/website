# Foreign Resource — Reviews Section: Claude Code Handoff

## Goal
Ship the "Masthead" reviews design as a live Shopify section on the product page. The look, the collapse behavior, and the filter/sort/search logic are **already built** in `product-reviews-masthead.liquid`. Your job is one thing: **wire real review data into `getReviews()`**, then QA against the mockup.

## Files you're getting
1. `product-reviews-masthead.liquid` — the section to install (drop into `/sections`). Complete except the data layer.
2. `fr_reviews_masthead_v2.html` — the **design target**. Open it in a browser; the finished section must look and behave like this (interactive: click filters, sorts, search, and the expand/collapse toggle).
3. The current theme export (`theme_export…jacquemus-1-1…zip`) — for conventions and to confirm tokens. Match its patterns.

## ⚠️ Resolve this FIRST (do not guess)
**Where do product reviews actually come from, and how is review data exposed on the front end?**

Two known conflicts to settle in the repo/account:
- The theme's existing `sections/product-reviews-container.liquid` is scaffolded for **Judge.me** (`#judgeme-reviews-container`), but the store is described as running **Klaviyo product reviews** (a Klaviyo onsite embed block is present in `settings_data.json`). Confirm which app is the live source of truth. Don't build against the wrong one.
- Once you know the app, confirm how it exposes reviews to the storefront on the current plan: a JSON/product feed, a Liquid object/metafield, or **only** its injected embed widget. This determines which strategy below you use.

## Review object contract (`getReviews()` must return `Promise<Review[]>`)
```js
{
  name:     "Damir H.",          // reviewer display name
  rating:   5,                   // number 1–5 (whole)
  verified: true,                // boolean
  media:    ["https://…/a.jpg"], // array of image URLs, [] if none
  date:     "22 DAYS AGO",       // display string
  ts:       120,                 // sortable number, higher = newer (epoch ms is ideal)
  title:    "One of a kind",     // optional
  body:     "These pants…",      // review text
  product:  "Eroded Cargos"      // optional
}
```
Optionally set `SUMMARY_OVERRIDE = { average, total, dist:{5,4,3,2,1 as %} }` if the source returns a true aggregate that differs from the loaded page. Otherwise the summary is computed from the returned reviews.

## Wiring strategies — pick based on what you confirmed
**A. Custom render from a review data feed/API (preferred).** If the app (Klaviyo or Judge.me) exposes reviews as JSON for the current product, `fetch` it in `getReviews()`, map fields to the contract, done. This is the only path that gives full control over Best/Worst + the collapse UX. Judge.me has a documented reviews API/widget-JSON; Klaviyo Reviews' front-end data access is plan/setup-dependent — verify before relying on it.

**B. Liquid/metafield render.** If reviews are synced into Shopify (e.g., product metafields or a metaobject), render them server-side in the `.liquid` and hand the array to JS via a `<script type="application/json">` block that `getReviews()` reads. No network call.

**C. DOM adapter (fallback, only if the app gives *only* an embed).** Let the app's widget render hidden, read its DOM into the contract, then render our markup and remove the original. Pragmatic but brittle — use only if A and B are impossible, and guard against the widget changing markup.

## Tokens & type (don't hardcode)
- Section already maps to theme tokens from `base.css`: `--color-primary` (Slate), `--color-secondary` (Salt), `--color-accent`, `--color-text-light`, `--space-*`, `--text-*`, `--border-thin`, `--ease-out`. Keep using them.
- It loads **Cormorant Garamond** (the big rating number + reviewer names) and **IBM Plex Mono** (dates/labels) itself, because `settings_data.json` currently has `use_custom_fonts:false` (fonts forced to Inter). If you enable Cormorant as the theme heading font, you can drop the section's font `<link>`. Confirm which you want — the display number must render in Cormorant either way.
- Everything is scoped to `#frr-{{ section.id }}`; safe to place multiple times.

## Acceptance criteria
- [ ] Visually matches `fr_reviews_masthead_v2.html` at desktop **and** ≤390px mobile.
- [ ] Summary (avg, count, distribution) reflects real data; stays visible (not collapsed).
- [ ] List holds a fixed height (default 480px, editable via section setting); overflow scrolls **inside** the panel with the bottom fade; **Expand all / Collapse** toggles full-length ↔ capped. Page height does not balloon.
- [ ] Filters (All / 5★ / 4★ / With Photos) and clickable distribution rows work.
- [ ] Sort (Most Relevant / Best / Worst / Newest) works. **Worst must actually surface the lowest-rated real reviews** — do not filter out critical reviews.
- [ ] Search filters live.
- [ ] "Write a Review" / "Ask a Question" wired to the app's real actions (form/modal), not `#`.
- [ ] Keyboard focus visible; `prefers-reduced-motion` respected; images lazy-load.

## Production caveat
The stock review widget likely won't expose a "Worst" sort or the exact collapse UX you can restyle — that's *why* this is a custom section (Strategy A/B). If you're forced into Strategy C, verify Best/Worst still order correctly off the adapted data.
