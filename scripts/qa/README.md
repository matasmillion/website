# Storefront QA loop

Drives a real headless browser against a Shopify preview URL, checks user-visible
behaviour, and writes screenshots plus a structured report.

## Run

```bash
QA_URL="https://<your>.shopifypreview.com" node scripts/qa/run.mjs          # all flows
QA_URL="https://<your>.shopifypreview.com" node scripts/qa/run.mjs home     # one flow
```

Output goes to `qa-out/` (override with `QA_OUT`): one PNG per flow per viewport,
plus `qa-report.json`. Exit code is non-zero when anything is found.

## Adding a flow

Every bug we find should become a flow check, so it can never silently return.
Add `scripts/qa/flows/<name>.mjs` exporting `name` and
`run({ page, shot, viewport })` returning an array of
`{ check, severity, detail }`, then register it in `run.mjs`.

## Environment gotchas

These are load-bearing. They cost real debugging time; please don't "clean them up".

- **Never run `playwright install`.** Chromium ships with the image at
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
- **`playwright` is a global npm package.** ESM ignores `NODE_PATH`, so `driver.mjs`
  loads it with `createRequire` against an absolute path.
- **`--ssl-version-max=tls1.2` is required.** All egress goes through a MITM proxy
  that resets Chromium's TLS 1.3 handshake, surfacing as `ERR_CONNECTION_RESET`.
  This is *not* a certificate problem — `ignoreHTTPSErrors` was tested and does not
  help. Capping the protocol version keeps certificate verification fully intact.
- **The storefront domains must be on the environment's network allowlist**
  (`*.shopifypreview.com`, `*.myshopify.com`, `cdn.shopify.com`, `*.shopifycdn.com`).
  Unrelated hosts such as `example.com` staying blocked is expected, and is not a
  signal that the allowlist failed.
