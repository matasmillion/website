# Foreign Resource — Website

Custom Shopify Online Store 2.0 theme for foreignresource.com. Full build spec lives in
`FR_Shopify_Theme_Claude_Code_Prompt_V2.md`.

## Standing rules

### The homepage never shows prices

Products on the homepage are displayed, not sold. A homepage product card is **image + product
name only**.

Never render on the homepage:

- price, compare-at price, sale price, "was/now" pairs
- discount percentages or "% OFF" text
- SALE / NEW / badge overlays of any kind
- wishlist hearts, quick-add or add-to-cart buttons

This is a hard rule, not a customizer toggle — the homepage card is built without a price element.
Price lives on the collection page and the PDP, where it belongs.

Implementation: `snippets/product-card.liquid` takes a `show_price` parameter. Every homepage
section passes `show_price: false`:

```liquid
{% render 'product-card', product: product, show_price: false %}
```

## Working on this repo

- Develop on `claude/homepage-product-display-wylacw`.
- Every section must be Online Store 2.0 compliant with a configurable schema — nothing hardcoded.
- Vanilla JS only. No React, no Vue, no CSS frameworks.
