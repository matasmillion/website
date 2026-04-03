# CLAUDE CODE PROMPT: Foreign Resource Shopify Theme Build (MVP)

## COPY EVERYTHING BELOW THIS LINE INTO CLAUDE CODE

---

You are building a complete custom Shopify Online Store 2.0 theme for Foreign Resource (foreignresource.com), an aspirational travel lifestyle fashion brand. The theme must be inspired by Jacquemus's website (jacquemus.com).

## STEP 1: BEFORE BUILDING ANYTHING

Fetch and study the following URLs to understand the design language we are replicating:
- https://jacquemus.com (homepage — layout, typography scale, whitespace, navigation)
- https://jacquemus.com/en/man (collection/landing page — product grid, filtering, collection hero)
- Browse to any product page on the site (product page — image gallery, product info layout, below-fold content)

Analyze their HTML structure, CSS approach, layout patterns, typography scale, spacing values, and animation techniques. These are your design references — not to copy, but to match in quality and feeling.

## CRITICAL REQUIREMENTS

1. **Every section MUST be Shopify Online Store 2.0 compliant** with configurable blocks. The founder is not a developer. He must be able to edit every element — text, images, colors, spacing, layout — through the Shopify theme customizer without touching code. If a section is hardcoded, it is a failure.

2. **The site must feel like a $100M+ aspirational brand.** Think Jacquemus, Aimé Leon Doré, COMFRT. NOT a generic Shopify store. The design must communicate premium through whitespace, typography, and restraint — not through complexity. Every conversion feature (urgency, upsells, reviews) must be integrated with the same design elegance as the rest of the site. No cheap-looking badges, aggressive countdown timers, or tacky trust icons. If a feature can't be implemented beautifully, it doesn't go on the site.

3. **Simplicity-first approach.** When in doubt, remove. Aspirational brands sell through desire, not through information overload. Every element on the page must earn its place.

## BRAND IDENTITY

- **Brand name:** Foreign Resource
- **Mission:** "To inspire global travel"
- **Tagline:** "Freedom through confidence"
- **Brand voice:** Confident, warm, worldly. Never salesy, never desperate. Speaks like a well-traveled friend, not a marketer.
- **Customer archetype:** "The Foreigner" — a style-conscious young adult who travels frequently and wants premium essentials that move with them from airport to city to coast.

**Color Palette:**
- Primary: Deep black (#0A0A0A) — text and key UI
- Secondary: Warm off-white / cream (#F5F0EB) — backgrounds
- Accent: Warm terracotta/rust (#C4632A) — CTAs and highlights (use sparingly)
- Supporting: Sage green (#7A8B6F) — secondary accents
- Supporting: Sand (#D4C5A9) — alternate section backgrounds
- ALL colors must be configurable in theme settings

**Typography:**
- Headlines: Clean geometric sans-serif (use "Inter" or "Archivo" as placeholder — founder will swap in brand font later)
- Body: "Inter" or similar clean sans-serif
- Oversized headlines (60-120px desktop) used as design elements
- ALL fonts must be configurable in theme settings

## MVP BUILD ORDER (Phase 1 — build these today)

### Priority 1: HOMEPAGE (index.json)
### Priority 2: COLLECTION PAGE / LANDING PAGE (collection.json)
### Priority 3: PRODUCT PAGE (product.json)

Everything else is Phase 2. Document where Phase 2 sections will go but don't build them yet.

---

## PAGE 1: HOMEPAGE (index.json)

Build these sections (all as Online Store 2.0 sections with configurable blocks):

**a. Announcement Bar**
- Slim bar at top of site (above header)
- Configurable: text, link, background color, text color, show/hide toggle
- Design: minimal, small text, no visual noise
- Example content: "Complimentary shipping on orders over $150"

**b. Header / Navigation**
- Clean, minimal header
- Logo: center or left (configurable)
- Navigation: horizontal menu items, minimal (3-5 items max visible)
- Right side: search icon, account icon, cart icon with count
- Mobile: hamburger menu with full-screen overlay (like Jacquemus — clean, typographic, no clutter)
- Sticky header option (configurable)
- Transparent header option for homepage hero (configurable)
- Design: thin, elegant, lots of breathing room. NOT a chunky nav bar.

**c. Hero Section**
- Full-viewport-height image or video background
- Overlaid headline text (configurable: text, size, position, color, font weight)
- Optional subheadline
- Optional CTA button (configurable: text, link, style — filled vs outlined)
- Support for both static image and video (MP4 / embedded video)
- Mobile: image should reframe elegantly, text should resize
- Design: cinematic. The hero should feel like walking into a luxury store — one powerful image, one powerful statement.

**d. Split Content Section**
- Two-column layout: one side large image, other side text + CTA
- Configurable: which side image is on (left/right), background color per column
- Used for editorial storytelling — brand mission, campaign narrative
- Design: generous padding, large text, editorial feel

**e. Collection Feature Grid**
- Asymmetric image grid (NOT a boring equal-column grid)
- Layout: one large image (60% width) + two stacked images (40%), or configurable variations
- Each image links to a collection with overlay text (collection name)
- Configurable: number of images, layout pattern, overlay text, overlay position
- Design: Jacquemus-style editorial grid — images should feel curated, not templated

**f. Full-Width Editorial Banner**
- Full-bleed image with centered text overlay
- Used for brand mission statements, campaign imagery, seasonal messaging
- Configurable: image, headline, subtext, text alignment, overlay opacity, CTA button
- Design: cinematic, breathing room, impactful

**g. Featured Products Carousel**
- Horizontal scrolling product cards
- Minimal card design: image, product name, price. Nothing else.
- Smooth scroll/drag behavior on desktop and mobile
- Configurable: which collection to pull from, number of products
- Design: clean, airy. Product images do the talking.

**h. Brand Story / Mission Section**
- Text-focused section with generous padding
- Large headline + body text + optional image
- This is where "To inspire global travel" and the Foreign Fund message live
- Configurable: all text, image, layout (text-left / text-right / text-center)
- Design: typographic, minimal, let the words breathe

**i. Email Signup Section**
- Minimal design — one headline, one input field, one button
- Integrates with Shopify customer API (will later connect to Klaviyo)
- Configurable: headline, subtext, button text, background color, placeholder text
- Design: elegant. NOT a loud "SUBSCRIBE NOW" bar. Think quiet confidence.

**j. Instagram / Social Grid**
- Grid of images (manually uploadable — more reliable than API)
- Optional: link each image to Instagram
- Configurable: images, links, grid columns (3-6), gap size
- Design: seamless, edge-to-edge optional, curated feel

**k. Footer**
- Clean, minimal footer
- Columns: Navigation links, Brand info/mission, Social icons, Legal links
- Optional newsletter signup
- Configurable: all links, text, logo, social URLs, column layout
- Design: understated. Not a wall of links. Jacquemus's footer is barely there — aspire to that.

---

## PAGE 2: COLLECTION PAGE / LANDING PAGE (collection.json)

**a. Collection Hero**
- Full-width banner image at top with collection name overlay
- Configurable: image, headline text, subtext, text position, overlay opacity
- Optional: hide hero entirely for a clean grid-first look
- Design: editorial, sets the mood for the collection

**b. Filter Bar**
- Horizontal filter bar (NOT a sidebar)
- Filters: Size, Color, Price range, Sort by
- Collapsible/expandable on mobile
- Design: minimal, inline with the page. Filters should feel like part of the design, not a utility slapped on top.

**c. Product Grid**
- 2 columns mobile, 3-4 columns desktop (configurable)
- Large product images — lifestyle and editorial shots should breathe
- Minimal product info below image: product name + price ONLY
- No badges, no "SALE" tags, no "NEW" stickers unless explicitly configured
- Image hover: show alternate image (second product image)
- Configurable: columns, gap size, image aspect ratio
- Infinite scroll OR "Load More" button (configurable)
- Design: gallery-like. Each product card should feel like a photograph in a lookbook, not a retail listing.

**d. Collection Description Section (optional)**
- Text block below grid or above grid (configurable position)
- For SEO and storytelling
- Configurable: text, show/hide

---

## PAGE 3: PRODUCT PAGE (product.json)

This is the most important page. It must convert while feeling premium.

**ABOVE THE FOLD:**

**a. Product Image Gallery (left side on desktop, top on mobile)**
- Large hero image with thumbnail navigation (vertical strip on left OR horizontal below)
- Alternative: vertical scroll gallery (all images stacked, scroll through)
- Image zoom on hover (subtle, not aggressive)
- Support for lifestyle AND ghost mannequin images
- Swipe on mobile
- Configurable: gallery layout style (thumbnails vs scroll vs grid)
- Design: images are LARGE. They dominate. This is a visual-first PDP.

**b. Product Info (right side on desktop, below images on mobile)**
- Product name (large, clean typography)
- Price (and compare-at price if on sale — styled subtly, not with aggressive red strikethroughs)
- Short description (1-2 sentences max above the fold)
- Size selector: clean BUTTONS, not a dropdown. Highlight selected state clearly.
- Quantity selector (minimal, +/- buttons)
- Add to Cart button: full-width, prominent, brand-colored. Single most important element.
- Design: clean hierarchy. Name → Price → Size → Add to Cart. Nothing else above the fold competing for attention.

**CONVERSION FEATURES (integrated elegantly below Add to Cart):**

**c. Guarantees Bar**
- Small, clean icons + text below Add to Cart
- Items (all configurable text + icon):
  - "Free Returns & Exchanges"
  - "5-Day Delivery Guarantee"
  - "Complimentary Express Shipping Over $150"
- Design: subtle, reassuring, NOT cheap trust badges. Use thin line icons or simple text. Think how Jacquemus would show shipping info — barely there, but present.

**d. Estimated Delivery Date**
- Single line of text: "Order today, arrives by [date]"
- Dynamic based on shipping method and location
- NOTE: This will be powered by the Shopify app "DT: Estimated Delivery Date" — build a clean placeholder section where this app will render. Style it to match the site.
- Design: one clean line of text. No countdown timers, no flashing urgency. Just information delivered confidently.

**e. Size Chart**
- Trigger: "Size Guide" text link near size selector (not a big button)
- Opens as a clean modal/drawer overlay
- NOTE: Will be powered by Kiwi Size Chart or VibeTry AI app — build a clean trigger point and modal container. Style the modal to match brand aesthetic.
- Design: the modal itself should feel premium. Clean table, good typography, brand colors.

**BELOW THE FOLD:**

**f. Product Details Accordion**
- Expandable sections (one open at a time):
  - Description (full product story — this is where editorial copy lives)
  - Materials & Care
  - Shipping & Returns
  - Features (anti-odor treatment, hidden zip pocket, etc.)
- All text configurable via metafields or section settings
- Design: clean lines, smooth expand/collapse animation, generous padding inside each section

**g. Dynamic Video Section**
- Embedded video showing the product in context (travel footage, lifestyle)
- Configurable: video URL (YouTube/Vimeo/MP4), poster image, autoplay toggle
- Design: full-width or contained, cinematic aspect ratio (16:9 or 2.35:1)

**h. "Complete the Look" / Upsell Section**
- Horizontal product carousel of complementary items
- NOTE: Will later integrate with AfterSell for post-purchase upsells — this section is the on-page version
- Configurable: manual product selection OR automatic recommendations
- Design: same minimal card style as the featured products carousel. No "FREQUENTLY BOUGHT TOGETHER" energy. Think editorial suggestion: "Pairs with..."

**i. Reviews Section**
- NOTE: Will be powered by Judge.me app — build a clean container section where the app will render
- Style the container and any surrounding content to match brand aesthetic
- Design: reviews should feel like testimonials in a magazine, not Amazon-style star ratings. If Judge.me can't be styled to match, consider a custom reviews display.

**j. Editorial / Lifestyle Image Section**
- Full-width lifestyle image of product in travel context
- Optional text overlay
- Configurable: image, text, CTA
- Design: this is a mini-campaign moment. The PDP should end with aspiration, not a wall of related products.

**k. Recently Viewed / You May Also Like**
- Product carousel at the very bottom
- Configurable: recommendation source (manual, automatic, recently viewed)

---

## SHOPIFY APP INTEGRATION MAP

These apps will be installed separately. Claude Code's job is to build the theme with properly styled placeholder sections and hooks where each app will render. The app's functionality will work, but its visual presentation must match the brand aesthetic.

### APP: DT: Estimated Delivery Date
- **Where:** PDP, below Add to Cart button
- **What it does:** Shows "Order today, arrives by [date]" with rolling urgency
- **Brand rule:** ONE clean line of text only. No countdown timers. No animated urgency. Just confident information delivery.
- **Shopify App Store:** https://apps.shopify.com/delivery-timer

### APP: Kiwi Size Chart & Recommender (or VibeTry AI)
- **Where:** PDP, triggered by "Size Guide" link near size selector
- **What it does:** Opens size chart modal with measurements and fit recommendations
- **Brand rule:** Modal must be styled to match brand. Clean typography, brand colors, no generic widget feel.
- **Shopify App Store:** https://apps.shopify.com/kiwi-sizing

### APP: AfterSell Post Purchase Upsell
- **Where:** Post-checkout page (not on the theme itself, but integrates with checkout flow)
- **What it does:** 1-click upsell after purchase
- **Brand rule:** Post-purchase page must feel like a continuation of the brand experience, not a separate sales pitch.
- **Shopify App Store:** https://apps.shopify.com/aftersell

### APP: Kbite Back In Stock
- **Where:** PDP, replaces Add to Cart when item is out of stock
- **What it does:** Email notification signup for restock alerts
- **Brand rule:** Clean email input field + "Notify Me" button. Same styling as the email signup section. No "HURRY" language.
- **Shopify App Store:** https://apps.shopify.com/cartbite

### APP: Smile.io Loyalty & Referrals
- **Where:** Account page, PDP (referral program mention), site-wide widget
- **What it does:** Points, rewards, referral program
- **Brand rule:** Any on-site widget must be styled to match brand. Hide default Smile launcher if it clashes with aesthetic.
- **Shopify App Store:** https://apps.shopify.com/smile-io

### APP: Judge.me Reviews
- **Where:** PDP, below product details accordion
- **What it does:** Customer reviews with photos
- **Brand rule:** Style to match brand typography and colors. No generic star rating widgets. Reviews should read like magazine testimonials.
- **Shopify App Store:** https://apps.shopify.com/judgeme

### APP: Gorgias or Richpanel (Customer Service)
- **Where:** Site-wide chat widget, Contact Us page
- **What it does:** AI-powered customer service chat
- **Brand rule:** Chat widget must be minimal and brand-colored. No aggressive "Chat with us!" pop-ups. Quiet presence — available when needed, invisible when not.
- **Shopify App Store:** https://apps.shopify.com/helpdesk

### APP: AfterShip Returns & Exchanges (or Loop)
- **Where:** Dedicated Returns page, linked from footer and order confirmation
- **What it does:** Self-service returns and exchanges portal
- **Brand rule:** Returns page must feel like part of the brand site, not a third-party portal.
- **Shopify App Store:** https://apps.shopify.com/returns-center-by-aftership

### APP: MIDA Heatmap & Session Recording
- **Where:** Backend only — no customer-facing UI
- **What it does:** Heatmaps and session recordings for CRO
- **No brand rules needed — this is analytics only.**
- **Shopify App Store:** https://apps.shopify.com/mida-session-recording-replay

---

## PHASE 2 PAGES (build after MVP — document locations only)

These pages are NOT part of the MVP. Include them in the navigation structure and create empty JSON templates so the founder can build them later through the customizer. Create each as a `page.[name].json` with a single placeholder section.

- **About / Brand Story** (page.about.json) — editorial long-scroll with brand mission, Foreign Fund, Foreigners community, Foreign World
- **Foreign World** (page.foreign-world.json) — interactive travel content / city guides
- **Foreign Fund** (page.foreign-fund.json) — UNHCR partnership and donation matching
- **Color Codex** (page.color-codex.json) — color story and naming system
- **Lookbook / Editorial** (page.lookbook.json) — campaign imagery, masonry grid
- **FAQ** (page.faq.json) — accordion-style Q&A
- **Contact Us** (page.contact.json) — minimal contact form
- **Track Order** (page.track-order.json) — order tracking integration
- **Returns & Exchanges** (page.returns.json) — AfterShip/Loop integration page
- **Early Access Sign-Up** (page.early-access.json) — email capture landing page
- **Product Tutorial** (page.tutorial.json) — care instructions, feature walkthrough, future AI chatbot embed
- **Pop-up Flow** — email capture popup (configurable: timing delay, pages to show on, show/hide toggle)

---

## TECHNICAL REQUIREMENTS

### Shopify Online Store 2.0 Compliance
- Every section must use Shopify's section schema with proper `settings` and `blocks`
- Use JSON templates (NOT legacy .liquid templates)
- Every configurable element must have a setting in the schema:
  - Text → `type: "text"` or `type: "richtext"`
  - Images → `type: "image_picker"`
  - Colors → `type: "color"`
  - URLs/Links → `type: "url"`
  - Selections → `type: "select"` with options
  - Toggles → `type: "checkbox"`
  - Numbers → `type: "range"`
  - Collections → `type: "collection"`
  - Products → `type: "product_list"`
  - Videos → `type: "video"` or `type: "video_url"`

### Theme Settings (config/settings_schema.json)
- Logo upload
- Full color scheme (all brand colors as defaults)
- Typography settings (headline font family, body font family, base sizes)
- Social media URLs (Instagram, TikTok, YouTube, Twitter)
- Favicon
- Cart type (drawer cart vs dedicated cart page)
- Announcement bar global settings
- Free shipping threshold amount

### Performance
- NO heavy JavaScript frameworks (no React, no Vue in the theme)
- Vanilla JS only for interactions
- Lazy load ALL images
- Use Shopify's native image CDN: `{{ image | image_url: width: 800 }}`
- Target: < 3 second load time on mobile
- CSS custom properties for theming — no external CSS frameworks
- Conditional CSS loading (only load component CSS when section is used)

### Responsive Design
- Mobile-first CSS
- Breakpoints: 480px, 768px, 1024px, 1440px
- Navigation: hamburger on mobile, horizontal on desktop
- Product grid: 2 columns mobile, 3-4 desktop
- Touch-friendly: minimum 44px tap targets
- All hero images must work on both portrait and landscape mobile

### Accessibility
- Semantic HTML (header, main, nav, footer, article, section)
- Alt text support on all images via settings
- Keyboard navigable with visible focus states
- Proper heading hierarchy (h1 → h2 → h3, one h1 per page)
- Skip-to-content link
- ARIA labels on interactive elements

### Animations & Interactions
- Smooth scroll behavior (CSS `scroll-behavior: smooth`)
- Subtle fade-in on scroll for sections (Intersection Observer, lightweight)
- Image hover zoom on product cards (subtle scale transform)
- Smooth accordion expand/collapse
- Menu slide/fade animation
- ALL animations must be performant — no jank, no heavy libraries, respect `prefers-reduced-motion`

---

## FILE STRUCTURE

```
theme/
├── assets/
│   ├── base.css
│   ├── component-header.css
│   ├── component-product-card.css
│   ├── component-product-page.css
│   ├── component-collection.css
│   ├── component-accordion.css
│   ├── component-modal.css
│   └── global.js
├── config/
│   ├── settings_schema.json
│   └── settings_data.json
├── layout/
│   └── theme.liquid
├── locales/
│   └── en.default.json
├── sections/
│   ├── announcement-bar.liquid
│   ├── header.liquid
│   ├── footer.liquid
│   ├── hero-banner.liquid
│   ├── split-content.liquid
│   ├── collection-grid-feature.liquid
│   ├── full-width-banner.liquid
│   ├── featured-products.liquid
│   ├── brand-story.liquid
│   ├── image-grid-social.liquid
│   ├── email-signup.liquid
│   ├── collection-hero.liquid
│   ├── collection-filter-bar.liquid
│   ├── product-gallery.liquid
│   ├── product-info.liquid
│   ├── product-guarantees.liquid
│   ├── product-details-accordion.liquid
│   ├── product-video.liquid
│   ├── product-upsell-carousel.liquid
│   ├── product-reviews-container.liquid
│   ├── product-editorial-image.liquid
│   ├── product-recommendations.liquid
│   └── placeholder-section.liquid
├── snippets/
│   ├── product-card.liquid
│   ├── icon-cart.liquid
│   ├── icon-search.liquid
│   ├── icon-account.liquid
│   ├── icon-menu.liquid
│   ├── icon-close.liquid
│   ├── social-icons.liquid
│   └── responsive-image.liquid
└── templates/
    ├── index.json
    ├── collection.json
    ├── product.json
    ├── page.json
    ├── page.about.json
    ├── page.lookbook.json
    ├── page.foreign-world.json
    ├── page.foreign-fund.json
    ├── page.color-codex.json
    ├── page.faq.json
    ├── page.contact.json
    ├── page.track-order.json
    ├── page.returns.json
    ├── page.early-access.json
    ├── page.tutorial.json
    ├── cart.json
    ├── 404.json
    └── search.json
```

---

## DEFAULT PLACEHOLDER CONTENT

Use these as defaults (founder will update in customizer):

- **Brand name:** Foreign Resource
- **Tagline:** "Freedom through confidence"
- **Mission:** "To inspire global travel"
- **Hero headline:** "Travel is the only thing you buy that makes you richer"
- **Hero CTA:** "Shop Collection"
- **About intro:** "Foreign Resource is an aspirational travel lifestyle brand for the modern explorer. We design premium essentials that move with you — from the airport to the city, from the coast to the mountains."
- **Foreign Fund:** "Every purchase contributes to the Foreign Fund — our commitment to matching donations to UNHCR, supporting displaced communities worldwide."
- **Collection names:** Technical Traveler, Staples, New Arrivals
- **Announcement bar:** "Complimentary shipping on orders over $150"
- **Footer tagline:** "Designed for those who see the world differently."
- **Guarantee 1:** "Free Returns & Exchanges"
- **Guarantee 2:** "5-Day Delivery Guarantee"
- **Guarantee 3:** "Complimentary Express Over $150"

---

## WHAT SUCCESS LOOKS LIKE

When this MVP is done:

1. I install the theme on my Shopify dev store
2. I open the theme customizer and can swap every image, change every text, adjust every color, reorder every section — zero code
3. The homepage feels like walking into a Jacquemus store — cinematic, minimal, aspirational
4. The collection page feels like flipping through a lookbook — editorial grid, not a retail catalog
5. The product page converts while feeling premium — every conversion feature (urgency, size chart, guarantees, reviews) is integrated so seamlessly it feels native to the design, not bolted on
6. Placeholder containers exist for every Shopify app in the integration map, styled to match
7. Empty templates exist for all Phase 2 pages
8. The site loads in under 3 seconds on mobile
9. The layout and typography alone communicate premium — even with placeholder images

## BUILD ORDER FOR TODAY

1. `theme.liquid` layout + `base.css` (CSS custom properties, reset, typography system)
2. `header.liquid` + `footer.liquid` (navigation, logo, cart, mobile menu)
3. Homepage sections, one by one, testing each schema
4. Collection page (hero + filter bar + product grid)
5. Product page (gallery + info + guarantees + accordion + upsell + reviews container)
6. Final pass: responsive check, performance check, accessibility check
7. Create empty JSON templates for Phase 2 pages

Start building now. Work through each file systematically.
