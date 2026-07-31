# Klaviyo — Back in Stock, on brand

Everything here is paste-ready. Nothing in this file is applied automatically; the
theme-side half is already live, the Klaviyo-side half you paste into Klaviyo.

**Your account:** company ID `WuWz5B` · Back In Stock flow `UPQ5tY`
(<https://www.klaviyo.com/flow/UPQ5tY/edit>)

---

## Brand tokens

Keep these exact. They are the same values the theme uses (`assets/base.css`).

| Token | Hex | Used for |
| --- | --- | --- |
| Bone (page background) | `#F1EEE6` | form + email background |
| Ink | `#2D2C2F` | body copy, headings |
| Slate | `#4A4E54` | primary buttons |
| Black (hover) | `#000000` | button hover |
| Muted | `#A4A4A4` | hints, legal, footer |
| Hairline | `rgba(164,164,164,0.4)` | borders, rules |
| Rust (accent) | `#C4632A` | errors only |

Type: body **Inter** 400/500 · display **Cormorant Garamond** 500.
Buttons everywhere on the site are **50px tall, square (0 radius), 10.7px,
letter-spacing 0.2em, uppercase**. That is the shape to match.

---

## 1. The "Notify me when available" button

This one is **not** configurable in Klaviyo — Klaviyo injects the trigger into the
page with unstable class names, so it is styled from the theme. It's already done
(`assets/component-product-page.css`, "Back in stock" block): `global.js` tags
whatever Klaviyo injects with `.fr-bis`, and the CSS below skins it.

Included here so you have it in one place, and because you can also paste it into
Klaviyo → *Sign-up forms → your Back in Stock form → Styles → Custom CSS* if you'd
rather own it there. **Do not run both copies** — pick one home for it.

```css
/* Back-in-stock trigger — matches .pdp__add-btn exactly */
.fr-bis,
.klaviyo-bis-trigger {
  display: block !important;
  width: 100% !important;
  max-width: none !important;
  min-width: 0 !important;
  height: 50px !important;
  margin: 0 0 1rem !important;
  padding: 0 1.25rem !important;
  background: #4A4E54 !important;
  border: 1px solid #4A4E54 !important;
  border-radius: 0 !important;
  color: #FFFFFF !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  font-size: 10.7px !important;
  font-weight: 500 !important;
  letter-spacing: 0.2em !important;
  text-transform: uppercase !important;
  text-align: center !important;
  line-height: 50px !important;
  text-decoration: none !important;
  cursor: pointer !important;
  box-shadow: none !important;
  transition: background 250ms cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.fr-bis:hover,
.klaviyo-bis-trigger:hover {
  background: #000000 !important;
  border-color: #000000 !important;
}
```

**Button label.** Set it in Klaviyo (form editor → the trigger's text), not in CSS.
Use `NOTIFY ME WHEN AVAILABLE` — the CSS uppercases it either way, but the stored
value shows up in Klaviyo's own previews.

---

## 2. Back in Stock form — custom CSS

**Where:** Klaviyo → **Sign-up forms** → open your Back in Stock form → **Styles**
tab → **Custom CSS**. Paste the whole block, save, publish.

Two things worth knowing before you paste:

- Klaviyo's onsite forms render **in the page's own DOM**, not in an iframe. So
  `Inter` and `Cormorant Garamond` are already loaded by the theme and will apply
  — no font import needed, and no FOUT.
- Klaviyo writes most of its styling as **inline** `style` attributes. Inline
  styles beat normal stylesheet rules, which is why every declaration below is
  `!important`. Don't strip them.

```css
/* ============================================================
   FOREIGN RESOURCE — Klaviyo Back in Stock form
   Scoped to Klaviyo's form root so nothing leaks into the page.
   ============================================================ */

/* --- Card ------------------------------------------------- */
[class*="klaviyo-form"] {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  color: #2D2C2F !important;
  background-color: #F1EEE6 !important;
  border: 1px solid rgba(164, 164, 164, 0.4) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}

[class*="klaviyo-form"] * {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
  border-radius: 0 !important;
  letter-spacing: 0.01em;
}

/* --- Heading ---------------------------------------------- */
/* Klaviyo emits headings as h1-h3 inside a text component.     */
[class*="klaviyo-form"] h1,
[class*="klaviyo-form"] h2,
[class*="klaviyo-form"] h3 {
  font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif !important;
  font-weight: 500 !important;
  font-size: 26px !important;
  line-height: 1.15 !important;
  letter-spacing: 0.01em !important;
  text-transform: uppercase !important;
  color: #2D2C2F !important;
  margin: 0 0 12px !important;
}

/* --- Body copy -------------------------------------------- */
[class*="klaviyo-form"] p,
[class*="klaviyo-form"] span,
[class*="klaviyo-form"] label {
  font-size: 13px !important;
  font-weight: 400 !important;
  line-height: 1.6 !important;
  color: #2D2C2F !important;
}

/* --- Inputs and the variant/size select -------------------- */
[class*="klaviyo-form"] input[type="email"],
[class*="klaviyo-form"] input[type="text"],
[class*="klaviyo-form"] input[type="tel"],
[class*="klaviyo-form"] select {
  height: 50px !important;
  padding: 0 14px !important;
  background: transparent !important;
  border: 1px solid rgba(164, 164, 164, 0.4) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: #2D2C2F !important;
  font-size: 13px !important;
  font-weight: 400 !important;
  letter-spacing: 0.01em !important;
  -webkit-appearance: none !important;
  appearance: none !important;
  transition: border-color 150ms cubic-bezier(0.16, 1, 0.3, 1) !important;
}

[class*="klaviyo-form"] input:focus,
[class*="klaviyo-form"] select:focus {
  outline: none !important;
  border-color: #2D2C2F !important;
}

[class*="klaviyo-form"] input::placeholder {
  color: #A4A4A4 !important;
  font-size: 13px !important;
  letter-spacing: 0.01em !important;
  text-transform: none !important;
}

/* The select needs its own caret back after appearance:none.   */
[class*="klaviyo-form"] select {
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' fill='none' stroke='%232D2C2F' stroke-width='1'/></svg>") !important;
  background-repeat: no-repeat !important;
  background-position: right 14px center !important;
  padding-right: 34px !important;
}

/* --- Submit ------------------------------------------------ */
[class*="klaviyo-form"] button,
[class*="klaviyo-form"] button[type="submit"] {
  width: 100% !important;
  height: 50px !important;
  min-height: 50px !important;
  padding: 0 1.25rem !important;
  background: #4A4E54 !important;
  border: 1px solid #4A4E54 !important;
  border-radius: 0 !important;
  color: #FFFFFF !important;
  font-size: 10.7px !important;
  font-weight: 500 !important;
  letter-spacing: 0.2em !important;
  text-transform: uppercase !important;
  box-shadow: none !important;
  cursor: pointer !important;
  transition: background 250ms cubic-bezier(0.16, 1, 0.3, 1) !important;
}

[class*="klaviyo-form"] button:hover {
  background: #000000 !important;
  border-color: #000000 !important;
}

/* --- Close ------------------------------------------------- */
[class*="klaviyo-form"] [aria-label="Close form"],
[class*="klaviyo-form"] [class*="close"] {
  width: auto !important;
  height: auto !important;
  background: transparent !important;
  border: 0 !important;
  color: #4A4E54 !important;
  opacity: 1 !important;
  box-shadow: none !important;
}

/* --- Consent / fine print ---------------------------------- */
[class*="klaviyo-form"] input[type="checkbox"] {
  width: 15px !important;
  height: 15px !important;
  min-height: 0 !important;
  accent-color: #4A4E54 !important;
  border: 1px solid rgba(164, 164, 164, 0.4) !important;
  border-radius: 0 !important;
}

[class*="klaviyo-form"] [class*="consent"] span,
[class*="klaviyo-form"] [class*="disclaimer"] span,
[class*="klaviyo-form"] a[href*="privacy"],
[class*="klaviyo-form"] a[href*="terms"] {
  font-size: 10px !important;
  line-height: 1.5 !important;
  color: #A4A4A4 !important;
}

[class*="klaviyo-form"] a {
  color: #2D2C2F !important;
  text-decoration: underline !important;
  text-underline-offset: 2px !important;
}

/* --- Validation -------------------------------------------- */
[class*="klaviyo-form"] [class*="error"],
[class*="klaviyo-form"] [role="alert"] {
  font-size: 10px !important;
  font-weight: 500 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  color: #C4632A !important;
  background: transparent !important;
  border: 0 !important;
  padding: 0 !important;
  margin-top: 6px !important;
}

/* --- Success ----------------------------------------------- */
[class*="klaviyo-form"] [class*="success"] h1,
[class*="klaviyo-form"] [class*="success"] h2,
[class*="klaviyo-form"] [class*="success"] h3 {
  font-family: 'Cormorant Garamond', Georgia, serif !important;
  text-transform: uppercase !important;
}

/* --- Mobile ------------------------------------------------ */
@media (max-width: 768px) {
  [class*="klaviyo-form"] h1,
  [class*="klaviyo-form"] h2,
  [class*="klaviyo-form"] h3 { font-size: 22px !important; }
  [class*="klaviyo-form"] p,
  [class*="klaviyo-form"] span { font-size: 12.5px !important; }
}
```

### Settings CSS can't reach

Set these in the form editor itself, or the CSS above fights them:

| Setting | Value |
| --- | --- |
| Styles → Corner radius | `0` |
| Styles → Drop shadow | Off |
| Styles → Background | Solid `#F1EEE6` |
| Styles → Border | 1px `#A4A4A4` at 40% |
| Form width (desktop) | `420px` |
| Heading text | `NOTIFY ME` |
| Body text | `We'll email you the moment this size is back. One email, nothing else.` |
| Button text | `NOTIFY ME` |
| Success text | `You're on the list. We'll be in touch.` |

---

## 3. Back in Stock email

**Where:** Klaviyo → **Flows** → *Back In Stock* (`UPQ5tY`) → open the email →
**Edit content** → if it's a drag-and-drop template, create a new template first:
**Templates → Create template → Code (HTML)**, paste, then assign it to the flow
message.

**Merge tags used** — these are the standard Klaviyo/Shopify Back in Stock event
properties. If your event names differ, the only lines to change are the four
marked `<!-- EVENT VAR -->`.

- `{{ event.ProductName }}` · `{{ event.URL }}` · `{{ event.ImageURL }}` ·
  `{{ event.VariantName }}` · `{{ event.Price }}`

**Fonts in email.** Inter and Cormorant Garamond won't load in Outlook, Gmail's
app, or Yahoo. The stacks below fall back to **Georgia** for the display serif and
**Helvetica Neue/Arial** for body — the two web-safe faces closest to the brand.
That is deliberate; don't replace them with a webfont-only stack.

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Back in stock</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a, h1, p { font-family: Georgia, 'Times New Roman', serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    body { margin:0; padding:0; width:100% !important; background-color:#F1EEE6; }
    img { border:0; outline:none; text-decoration:none; display:block; -ms-interpolation-mode:bicubic; }
    table { border-collapse:collapse !important; }
    a { text-decoration:none; }
    .fr-shell { width:600px; }
    @media only screen and (max-width:620px) {
      .fr-shell { width:100% !important; }
      .fr-pad { padding-left:24px !important; padding-right:24px !important; }
      .fr-h1 { font-size:30px !important; }
      .fr-btn { display:block !important; width:auto !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#F1EEE6;">

  <!-- Preheader: shows in the inbox preview, hidden in the body -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
    {{ event.ProductName|default:"The piece you wanted" }} is available again. Sizes go fast.
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F1EEE6;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" class="fr-shell" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#F1EEE6;">

          <!-- Logo -->
          <tr>
            <td align="center" class="fr-pad" style="padding:40px 40px 32px;">
              <a href="https://foreignresource.com" target="_blank">
                <img src="https://cdn.shopify.com/s/files/1/0586/4085/9301/files/Logos_Slate.png?v=1784989044&amp;width=120"
                     width="44" height="44" alt="Foreign Resource"
                     style="display:block; width:44px; height:44px;" />
              </a>
            </td>
          </tr>

          <!-- Eyebrow -->
          <tr>
            <td align="center" class="fr-pad" style="padding:0 40px 14px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:10px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:#A4A4A4;">
              Back in stock
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td align="center" class="fr-pad fr-h1" style="padding:0 40px 28px; font-family:Georgia, 'Times New Roman', serif; font-size:38px; font-weight:500; line-height:1.08; letter-spacing:0.01em; text-transform:uppercase; color:#2D2C2F;">
              It's back.
            </td>
          </tr>

          <!-- Product image — full bleed to the 600px shell -->
          <tr>
            <td align="center" style="padding:0;">
              <a href="{{ event.URL|default:'https://foreignresource.com' }}" target="_blank"><!-- EVENT VAR -->
                <img src="{{ event.ImageURL }}" width="600" alt="{{ event.ProductName }}"
                     style="display:block; width:100%; max-width:600px; height:auto;" /><!-- EVENT VAR -->
              </a>
            </td>
          </tr>

          <!-- Product name + variant + price -->
          <tr>
            <td align="center" class="fr-pad" style="padding:28px 40px 4px; font-family:Georgia, 'Times New Roman', serif; font-size:20px; font-weight:500; line-height:1.25; letter-spacing:0.01em; text-transform:uppercase; color:#2D2C2F;">
              {{ event.ProductName|default:"Your piece" }}<!-- EVENT VAR -->
            </td>
          </tr>
          <tr>
            <td align="center" class="fr-pad" style="padding:0 40px 24px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:11px; font-weight:400; letter-spacing:0.08em; text-transform:uppercase; color:#A4A4A4;">
              {{ event.VariantName|default:"" }}{% if event.Price %} &nbsp;·&nbsp; ${{ event.Price|floatformat:2 }}{% endif %}<!-- EVENT VAR -->
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" class="fr-pad" style="padding:0 40px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="#4A4E54" style="background-color:#4A4E54; border:1px solid #4A4E54; border-radius:0;">
                    <a class="fr-btn" href="{{ event.URL|default:'https://foreignresource.com' }}" target="_blank"
                       style="display:inline-block; padding:0 44px; height:50px; line-height:50px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:11px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:#FFFFFF; text-decoration:none;">
                      Shop it now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Scarcity line -->
          <tr>
            <td align="center" class="fr-pad" style="padding:0 56px 40px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12.5px; font-weight:400; line-height:1.7; color:#2D2C2F;">
              Restocks are small and we don't hold sizes. If it's yours, take it.
            </td>
          </tr>

          <!-- Rule -->
          <tr>
            <td class="fr-pad" style="padding:0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td height="1" style="height:1px; line-height:1px; font-size:0; background-color:#DCD7CC;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" class="fr-pad" style="padding:28px 40px 12px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:10px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:#2D2C2F;">
              <a href="https://foreignresource.com/collections/all" style="color:#2D2C2F; text-decoration:none;">Shop</a>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <a href="https://www.instagram.com/foreignresource/" style="color:#2D2C2F; text-decoration:none;">Instagram</a>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              <a href="https://foreignresource.com/pages/contact" style="color:#2D2C2F; text-decoration:none;">Contact</a>
            </td>
          </tr>
          <tr>
            <td align="center" class="fr-pad" style="padding:0 40px 44px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:10px; font-weight:400; line-height:1.7; color:#A4A4A4;">
              You asked to be told when this came back — that's the only reason you got this.<br />
              <a href="{% unsubscribe %}" style="color:#A4A4A4; text-decoration:underline;">Unsubscribe</a><br /><br />
              {{ organization.name }}<br />
              {{ organization.full_address }}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
```

### Subject lines and preview text

Set these on the flow message, not in the template.

| | Subject | Preview text |
| --- | --- | --- |
| Email 1 (immediate) | `It's back — {{ event.ProductName }}` | `Restocks are small. Sizes go fast.` |
| Email 2 (add a 24h delay, optional) | `Still yours if you want it` | `{{ event.ProductName }} is still in stock — for now.` |

For email 2, reuse the same template and change the headline row from
`It's back.` to `Still here.` and the scarcity line to
`Twenty-four hours ago you asked for this. It hasn't sold out yet.`

### Before you send

- Send yourself a preview from a flow message (not the template editor) so the
  `event.*` tags resolve against a real Back in Stock event.
- Check Outlook — it's the one that will fall back to Georgia. That's expected.
- `{% unsubscribe %}` is required by Klaviyo; leave it in even though this is
  arguably transactional.
