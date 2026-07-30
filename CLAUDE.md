# Foreign Resource — Website

Custom Shopify Online Store 2.0 theme for foreignresource.com. Full build spec lives in
`FR_Shopify_Theme_Claude_Code_Prompt_V2.md`.

## Standing rules

### Homepage product cards are the image, and nothing else

Products on the homepage are displayed, not sold. A homepage product card is **the image only** —
no text of any kind.

Never render on the homepage:

- product name / title
- price, compare-at price, sale price, "was/now" pairs
- discount percentages or "% OFF" text
- SALE / NEW / badge overlays of any kind
- wishlist hearts, quick-add or add-to-cart buttons

This is a hard rule, not a customizer toggle. Names and prices live on the collection page and the
PDP, where they belong. The image links through to the PDP.

Implementation: `snippets/product-card.liquid` takes `show_title`, `show_price`, `show_wishlist` and
`show_badge`, all defaulting to `true`. Every homepage section passes all four as `false`, which
makes the snippet skip the `.product-card__info` block entirely:

```liquid
{% render 'product-card', product: product,
   show_title: false, show_price: false, show_wishlist: false, show_badge: false %}
```

Two things to keep in mind when touching this:

- **Never gate these with `| default: true`.** Liquid's `default` filter treats `false` as missing,
  so it silently switches the element back on. Use an explicit `if x == nil` check.
- Accessibility is carried by the image link's `aria-label="{{ product.title }}"`, not by the
  visible title. Keep that label if you change the markup.

## Where the theme actually lives

The theme is **not in this repo** — this repo holds the build spec only. The live code is on Shopify:

- `JACQUEMUS 1.1` (unpublished) — the build described by the spec. Edit this one.
- `STILLETO 2.2` (published / MAIN) — the old theme still serving foreignresource.com.

Theme file writes via the Shopify MCP are allowed on unpublished themes only; the published theme
has to be changed through Shopify admin. Editing markdown in this repo changes nothing on the site.

## Working on this repo

- Develop on `claude/homepage-product-display-wylacw`.
- Every section must be Online Store 2.0 compliant with a configurable schema — nothing hardcoded.
- Vanilla JS only. No React, no Vue, no CSS frameworks.
