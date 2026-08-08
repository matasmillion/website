# Foreign Resource — Shopify Store Setup Checklist

The theme code is only half the picture: several links and pages only work
once the matching **pages, menus, and settings exist in Shopify admin**.
Work through this checklist once and everything connects.

## 1. Pages to create (Online Store → Pages)

Create each page below. The **handle must match exactly** (the handle is the
URL slug — edit it under "Search engine listing" if Shopify auto-generates a
different one). Then, in the page's **Theme template** dropdown (right-hand
sidebar), assign the listed template.

| Page title | Handle (exact) | Theme template | Linked from |
|---|---|---|---|
| Contact | `contact` | `contact` | Footer "Contact form", product page |
| Track an order | `track-order` | `track-order` | Footer "Track an order" |
| Returns & Exchanges | `returns` | `returns` | Footer "Register a return" |
| Foreign World | `foreign-world` | `foreign-world` | Header nav |
| Foreign Fund | `foreign-fund` | `foreign-fund` | Header nav |
| Foreign Resource | `foreign-resource` | `foreign-resource` | Header nav |
| Globe | `globe-embed` | `globe-embed` | Embedded inside Foreign World |
| Saved items | `wishlist` | `wishlist` | Wishlist drawer "View all saved items" |
| About | `about` | `about` | Menus (optional) |
| FAQ | `faq` | `faq` | Menus (optional) |
| Lookbook | `lookbook` | `lookbook` | Menus (optional) |
| Color Codex | `color-codex` | `color-codex` | Menus (optional) |
| Early Access | `early-access` | `early-access` | Menus (optional) |
| Stockists | `stockists` | `stockists` | Menus (optional) |
| Tutorial | `tutorial` | `tutorial` | Menus (optional) |

Notes:
- The **Globe** page (`globe-embed`) renders the interactive globe app
  full-screen; the Foreign World page embeds it automatically. Don't link it
  in menus — it's an embed target.
- Footer contact links hide themselves automatically until the matching
  page exists, so nothing looks broken in the meantime.

## 2. Menus (Online Store → Navigation)

| Menu handle | Used by | Suggested items |
|---|---|---|
| `main-menu` | Header "Shop" dropdown, mobile menu, search suggestions | Your collections (e.g. Technical Traveler, Staples, New Arrivals) |
| `footer` | Footer "Company" column | About, Foreign Fund, Stockists |
| `footer-1` | Footer "Customer Care" column | Contact, Track an order, Returns, FAQ |
| A legal menu (any handle) | Footer bottom bar — select it in the footer's theme-editor settings | Privacy policy, Terms of service |

## 3. Customer accounts (Settings → Customer accounts)

Turn on customer accounts and choose **"Legacy"** (classic) so the theme's
login/register/account pages at `/account/...` are used. The header account
icon links there.

## 4. Theme settings worth reviewing (Customize → Theme settings)

- **Colors** — now actually applied site-wide (they previously did nothing).
- **Typography** — brand default is Cormorant Garamond + Inter; tick
  "Use custom fonts" to pick from Shopify's font library instead.
- **Cart** — "Cart type": Drawer (default) or Dedicated page. The
  "Free shipping threshold" now shows a quiet progress note in the cart
  drawer; set it to 0 to hide it.
- The announcement bar is currently **disabled** in the header group —
  enable it in the customizer if you want the shipping message back.

## 5. Product metafields

| Field (in the product editor) | Namespace / key | Drives |
|---|---|---|
| **Main Collection** | `custom.main_collection` | The small grey collection line above the product name — mobile add-to-cart band and desktop details column |

Pick the collection the product really belongs to (e.g. `BORDERLESS BASICS`), even though the
product also sits in `ALL` and in whatever sale or seasonal collections it has been added to. This
is the only thing that decides what the PDP says.

Leave it empty and the theme falls back to the first collection whose handle is **not** on the
ignore list in *Customize → Theme settings → Product page* — `all-products` and
`for-shopify-performance-tracking` (Faire) by default — and finally to the label `ALL`. Add any
other catch-all or internal collection to that list rather than editing the theme.

## 6. Deploying the theme

This repo syncs with Shopify via the **GitHub integration** (you'll see
"Update from Shopify" commits on the connected branch). That means:

- **To ship these fixes**: merge this branch into the branch your store is
  connected to (the theme shown in Online Store → Themes says which branch
  it tracks). Shopify picks up the merge automatically within a minute.
- **Alternative — fresh zip**: download the repo as a zip (only the theme
  folders: `assets`, `config`, `layout`, `locales`, `sections`, `snippets`,
  `templates`) and upload via Online Store → Themes → Add theme.
- The old `foreign-resource-theme.zip` that lived in this repo was a stale
  snapshot and has been deleted — don't upload it.

## 7. Known intentional gaps

- Blog articles render without a comments section (off-brand; can be added
  later if wanted).
- The size-chart modal and reviews/delivery-date sections are placeholders
  for the apps in the integration plan (Kiwi, Judge.me, DT Delivery).
