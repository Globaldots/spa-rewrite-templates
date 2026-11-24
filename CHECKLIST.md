# Test checklist

Run these against the **rewritten** hostname (Cloudflare custom domain or Akamai property), not the raw R2 origin or `*.r2.dev`.

`scripts/verify-spa-rewrites.sh https://your-hostname` covers the curl cases.

A styled 404 in the browser can be the app’s client-side 404 on HTTP 200. Confirm status with `curl -I`.

## After the SPA rewrite

| Request | Expected |
| --- | --- |
| `GET /` | 200, SPA shell (`index.html`) |
| `GET /about`, `/about/`, `/about?utm=test` | 200, SPA shell; no redirect; query still on the client URL |
| `GET /products/42` and nested `/docs/a/b` | 200, SPA shell |
| `GET /index.html` | 200, the real object |
| `GET /assets/<hashed>.js` and `.css` | 200, correct Content-Type, not the shell |
| `GET /favicon.ico`, `/robots.txt`, `/test-asset.txt` | 200, the real file |
| `GET /missing-asset.js` | **HTTP 404**, not the shell |
| `GET /this-route-does-not-exist` | **HTTP 200**, SPA 404 view |

On Akamai, also send `Pragma: akamai-x-get-cache-key`. Routes should show `/index.html` in the cache key; assets should show their original path.

## Raw origin (no rewrite), for comparison

Against `https://spa-demo-origin.super-cdn.com`: `/` and `/about` are 404; `/index.html` and `/assets/*` are 200. That is expected, and what Akamai should see before its own rewrite.

