# Foreign Resource — Shopify theme

A custom Shopify Online Store 2.0 theme for **Foreign Resource** (foreignresource.com), an aspirational travel-lifestyle brand. Minimal, editorial, Jacquemus-inspired. Vanilla JS only, JSON templates, everything configurable through the theme customizer.

## What's inside

- **Customer portal** (`/account`) — orders (paginated, with detail pages), addresses (add/edit/delete, default, country/province selectors), hearted products, and the customer's **Foreign World profile** (display name, one-line bio, home base, places they've been) with a live mini-globe preview. Sections are customizer blocks, so the founder can reorder or remove any panel.
- **Hearted products (wishlist)** — heart buttons on product cards and product pages, saved in the shopper's browser (`localStorage`), heart count badge in the header, grid in the portal. No app required.
- **The Foreign World globe** (`/pages/foreign-world`) — an interactive, dependency-free canvas globe (drag to spin, auto-rotate, click pins) mapping three kinds of entries, each an editable customizer block:
  - **People** (terracotta pins) — Foreigners from the community
  - **Places** (sage pins) — cities and guides
  - **Properties** (ink diamond pins) — stays and hideaways
  Plus the signed-in customer's own pin with flight-path arcs to the places they've been. Every entry is also rendered as an accessible, crawlable index list under the globe.
- **Storefront** — homepage (hero + Foreign World teaser), collection, product (variant pills, quantity stepper, guarantees, accordions, `@app` block), cart, search, blog ("city guides"), 404, and utility page templates.

## Setup after installing the theme

1. **Navigation**: create the `main-menu` and `footer` menus (Online Store → Navigation).
2. **Foreign World page**: create a page with the handle `foreign-world` and assign the **page.foreign-world** template. The globe arrives pre-populated with example people/places/properties — edit or replace them in the customizer (each pin needs a name, latitude, longitude; find coordinates at latlong.net).
3. **Customer accounts**: enable customer accounts (Settings → Customer accounts → "Legacy" / classic accounts, since the portal uses Liquid customer templates).
4. **Logo, colors, fonts**: Theme settings → Logo / Colors / Typography.

## Notes on data

- Hearts and Foreign World profiles are stored in the shopper's browser (`fr:wishlist`, `fr:profile` in `localStorage`). They work without any app, but don't follow the customer across devices. To sync them to the customer record later, swap the storage layer in `assets/wishlist.js` / `assets/customer.js` for customer metafields via an app proxy (or apps like Smile.io) — the UI won't need to change.
- The globe's landmass dots (`assets/globe-land.js`) are generated from the public-domain Natural Earth data (via `world-atlas`); regenerate with a finer grid if you want denser dots.

## Structure

Standard OS 2.0 layout: `assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`. Each section loads its own `component-*.css` (conditional CSS) and declares a full schema — text, images, colors, spacing and blocks are all editable in the customizer with no code.

The original build brief lives in `FR_Shopify_Theme_Claude_Code_Prompt_V2.md`.
