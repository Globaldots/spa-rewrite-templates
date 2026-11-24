# Cloudflare SPA rewrite template

This matches the live **SPA template** URL Rewrite rule used on `spa-demo.super-cdn.com`.

Extensionless GET/HEAD requests, including `/` and `/about/`, are rewritten to `/index.html`. The query string is preserved. Files with an extension pass through, so a missing asset is a real HTTP 404.

Replace `${SPA_HOSTNAME}` with the public hostname. The live demo uses `spa-demo.super-cdn.com`.

Expression:

```
(http.host eq "${SPA_HOSTNAME}" and http.request.method in {"GET" "HEAD"} and http.request.uri.path.extension eq "")
```

Path: rewrite to static `/index.html`. Query: preserve (omit `uri.query` in the API).

## Dashboard

1. Open the zone → **Rules** → **Transform Rules** → **URL Rewrite** → create a rule.
2. Name it `SPA template`.
3. **If incoming requests match:** custom filter expression, paste the expression above (with your hostname).
4. **Then:** Path → Rewrite to → **Static** → `/index.html`. Query → **Preserve**.
5. Deploy. If the zone already has Transform Rules, add this rule; do not replace the rest of the ruleset. Scope it to this hostname only.

`http.request.uri.path.extension` is the lowercased suffix after the last dot, with no dot. `/about` and `/about/` are `""`; `/assets/app.js` is `"js"`.

## API and Terraform

- `spa-url-rewrite.json` — rule body for `POST /zones/{zone_id}/rulesets/{ruleset_id}/rules` on the zone `http_request_transform` entry point. Do not `PUT` the whole ruleset unless you include every existing rule.
- `spa-url-rewrite.tf` — same rule as a `cloudflare_ruleset` resource. Import the existing phase ruleset if the zone already has one.

For S3 origins (not used on the R2 demo), `origin-rule-s3-host-header.json` sets the `Host` header to the bucket website or REST hostname via an Origin Rule.

## How to test

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://${SPA_HOSTNAME}/about        # 200, SPA shell
curl -sS -o /dev/null -w '%{http_code}\n' https://${SPA_HOSTNAME}/missing-asset.js  # 404
```

A styled 404 in the browser can be the app’s client-side 404 on an HTTP 200. Check the real status with `curl -I`. Or run `../scripts/verify-spa-rewrites.sh https://${SPA_HOSTNAME}`.

## Suggestions

- The live rule already limits to GET and HEAD; keep that when you copy it.
- Paths like `/products/v1.2` have an extension and are not rewritten.
- The query string doesn't matter to the bucket (the browser keeps the original URL for the app), so consider leaving it out of the cache key for the rewritten `index.html` to avoid fragmenting the cache with `utm` variants.
- If this hostname is later used as an origin for another CDN, do not cache or forward the `__cf_bm` cookie Cloudflare may set.
- Cache `index.html` briefly; cache hashed `/assets/*` for a long time.
- For S3, set the origin `Host` header to the bucket endpoint (see `origin-rule-s3-host-header.json`). The R2 custom-domain demo does not need this.

