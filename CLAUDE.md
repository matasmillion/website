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

This survives the colourway work: `colorway-cards.liquid` forwards all four flags, so an
image-only card stays image-only however many colours it stands for.

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

**This repo is the theme** — `assets/`, `sections/`, `snippets/`, `layout/`, `templates/`,
`config/`, `locales/`. It syncs to Shopify through the GitHub integration. (An earlier version of
this file said the theme was not in the repo; that has not been true for some time.)

Two themes exist on the store:

- `JACQUEMUS 1.1` (unpublished) — what this repo builds.
- `STILLETO 2.2` (published / MAIN) — the old theme still serving foreignresource.com.

The connected theme tracks a branch, so work on a feature branch changes nothing on Shopify until
it is merged into that branch. See `SHOPIFY_SETUP.md` for the deploy path.

## Colourways

A colourway is a (product, colour) pair, and it is a first-class thing: its own images, its own
card, its own URL, its own wishlist entry. It arrives two ways — a Colour option on one product,
or separate products linked by `custom.colorway_siblings` — and the theme treats both the same.
Shopify's native answer to the second case, Combined Listings, is Plus-only and this store is on
Basic, which is why it is hand-rolled.

- `snippets/colorway-hex.liquid` is the **only** place a colour becomes a hex. Don't add a second
  name→hex ladder; there used to be two and they disagreed.
- Per-colour galleries read `image.variants` — attach a colour's photos to that colour's variants
  in admin. Liquid cannot ask a variant for its images, only the reverse.
- A colour with no images of its own shows the whole gallery rather than an empty one. Keep that
  fallback: most of the catalogue is still in that state.
- Wishlist keys are `handle` or `handle::colour`. A bare handle is a pre-colourway save and must
  keep working.

## Working on this repo

- Develop on the feature branch named in the task, never on `main`.
- Every section must be Online Store 2.0 compliant with a configurable schema — nothing hardcoded.
- Vanilla JS only. No React, no Vue, no CSS frameworks.
