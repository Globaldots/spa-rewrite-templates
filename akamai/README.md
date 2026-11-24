# Akamai SPA rewrite template

Primary template: `spa-rewrite-rule-tree.json`. This is the Property Manager rule tree from the tested GlobalDots demo, with hostnames replaced by placeholders.

Extensionless paths — including `/` and trailing slashes such as `/about/` — are rewritten to `/index.html`. Files with an extension (`/assets/*`, `/favicon.ico`, `/index.html`) go to the origin as-is, so a missing asset is a real HTTP 404.

## Placeholders

Use `${…}` for values you must fill in. Do not change `{{Origin Hostname}}` or `{{Forward Host Header}}` in `customValidCnValues`; those are Akamai built-in variables.

| Placeholder | Meaning | Value in the tested demo |
| --- | --- | --- |
| `${PROPERTY_HOSTNAME}` | Property / edge hostname | `spatest.akamaized.net` |
| `${ORIGIN_HOSTNAME}` | Origin hostname | `spa-demo-origin.super-cdn.com` |

## Origin settings (as tested)

In the default rule of this tree:

- Origin Server: customer origin `${ORIGIN_HOSTNAME}`
- Forward Host Header: **Origin Hostname**
- Cache key hostname: **Origin Hostname**
- HTTPS port **443**, **SNI** on, certificate verification **CUSTOM** with **standard CAs** (`akamai-permissive` and `THIRD_PARTY_AMAZON` are what the demo property used)

## How to test

After activating on staging, check status with `curl -I`. A styled 404 in the browser can be the app’s client-side 404 on top of HTTP 200; only curl shows the real status.

```bash
# Deep links should be 200 (the SPA shell). Missing JS should be 404.
curl -sS -o /dev/null -w '%{http_code}\n' https://${PROPERTY_HOSTNAME}/about
curl -sS -o /dev/null -w '%{http_code}\n' https://${PROPERTY_HOSTNAME}/missing-asset.js

# Cache key should show /index.html for routes, and the original path for assets.
curl -sS -I -H 'Pragma: akamai-x-get-cache-key' https://${PROPERTY_HOSTNAME}/about
curl -sS -I -H 'Pragma: akamai-x-get-cache-key' https://${PROPERTY_HOSTNAME}/assets/app.js
```

Or run `../scripts/verify-spa-rewrites.sh https://${PROPERTY_HOSTNAME}`.

## Suggestions

- Optionally add a `requestMethod` criterion for GET and HEAD (the Cloudflare rule already limits to those).
- The query string doesn't matter to the bucket (the browser keeps the original URL for the app), so consider leaving it out of the cache key for the rewritten `index.html` to avoid fragmenting the cache with `utm` variants.
- Paths like `/products/v1.2` have an extension and are not rewritten.
- If the origin is a Cloudflare-fronted hostname, do not cache or forward the `__cf_bm` cookie.
- Cache `index.html` briefly; cache hashed `/assets/*` for a long time.
- `THIRD_PARTY_AMAZON` in the CA list is only needed for S3 origins; you can drop it for an R2/HTTPS origin.

