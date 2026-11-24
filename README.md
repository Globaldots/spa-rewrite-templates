# SPA rewrite templates (Cloudflare + Akamai)

Templates for hosting a single-page app on object storage (Amazon S3 or Cloudflare R2). Object storage maps a URL path to an object key literally, so a refresh or a pasted deep link 404s unless the CDN rewrites the **origin path** to `/index.html`. Do not use a browser redirect.

Both templates rewrite extensionless paths (including `/` and trailing slashes) to `/index.html`, leave real files alone, and return a real HTTP 404 for missing assets.

## Live demo

- Cloudflare with rewrite: https://spa-demo.super-cdn.com
- Raw R2 origin (no Cloudflare rewrite), for Akamai to fetch: https://spa-demo-origin.super-cdn.com
- Akamai property with this rewrite applied: https://spatest.akamaized.net

On the raw origin, `/` and `/about` are 404; `/index.html` and `/assets/*` are 200. Point Akamai at `spa-demo-origin.super-cdn.com`, not at `spa-demo.super-cdn.com`. A public example of the demo bucket name is `gd-spa-rewrite-demo`.

A styled 404 in the browser can be the app’s client-side 404 on an HTTP 200. Check the real status with `curl -I`.

## Quick start: Cloudflare

1. Upload your SPA build (or this repo’s `demo/` after `npm install && npm run build`) to an R2 or S3 bucket, and attach a custom domain (R2) or origin (S3).
2. In the zone, go to **Rules** → **Transform Rules** → **URL Rewrite**, and add the rule in `cloudflare/`. Use your hostname in place of `${SPA_HOSTNAME}`.
3. Or apply `cloudflare/spa-url-rewrite.json` via the API, or `cloudflare/spa-url-rewrite.tf` with Terraform. Add the rule to the existing `http_request_transform` ruleset; do not replace other rules.

See `cloudflare/README.md`. For S3 origins, also set the origin `Host` header; see `cloudflare/origin-rule-s3-host-header.json`.

## Quick start: Akamai

1. Use the raw origin hostname (in the demo, `spa-demo-origin.super-cdn.com`).
2. Import `akamai/spa-rewrite-rule-tree.json` into Property Manager. Replace `${PROPERTY_HOSTNAME}` and `${ORIGIN_HOSTNAME}`. Leave `{{Origin Hostname}}` and `{{Forward Host Header}}` as they are — those are Akamai built-in variables.
3. Activate on staging and test as in `akamai/README.md`.

## Verify

```bash
./scripts/verify-spa-rewrites.sh https://spa-demo.super-cdn.com
./scripts/verify-spa-rewrites.sh https://spatest.akamaized.net
```

The script checks that routes return 200 with the SPA shell, assets return 200, and a missing asset returns 404. See `CHECKLIST.md` for the full list.

To build the demo SPA locally:

```bash
cd demo
npm install
npm run build
```

The `dist/` output is what you upload to the bucket.

## Repo layout

- `cloudflare/` — URL Rewrite template that matches the live demo rule, plus an optional S3 Host-header Origin Rule
- `akamai/` — the tested Property Manager rule tree (origin + SPA rewrite)
- `demo/` — Vite + React demo SPA source
- `scripts/verify-spa-rewrites.sh` — curl checks
- `CHECKLIST.md` — the same checks in writing

## Suggestions

- Limit the rewrite to GET and HEAD (already in the Cloudflare rule; add `requestMethod` on Akamai if you want the same).
- The query string doesn't matter to the bucket (the browser keeps the original URL for the app), so consider leaving it out of the cache key for the rewritten `index.html` to avoid fragmenting the cache with `utm` variants.
- Paths like `/products/v1.2` have an extension and are not rewritten.
- Do not cache or forward the `__cf_bm` cookie from a Cloudflare-fronted origin.
- Cache `index.html` briefly; cache hashed `/assets/*` for a long time.
- `THIRD_PARTY_AMAZON` is only needed in the Akamai CA list for S3 origins.

## License

MIT © GlobalDots 2026
