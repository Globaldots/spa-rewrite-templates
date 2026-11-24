# Demo SPA

Small Vite + React app with History API routing, used to exercise the Cloudflare and Akamai rewrite templates.

Routes: `/`, `/about`, `/products/:id`, `/docs/:section/:page`, `/deep-links`, and a client-side 404 view. Hashed assets land in `/assets`. The shell includes a `gd-spa-shell` meta tag so curl checks can tell `index.html` from a generic 404 page.

```bash
npm install
npm run dev     # local dev server
npm run build   # writes static files to dist/
```

Upload the contents of `dist/` to your R2 or S3 bucket. The public GlobalDots demo uses the bucket name `gd-spa-rewrite-demo` and is served at:

- https://spa-demo.super-cdn.com (Cloudflare rewrite)
- https://spa-demo-origin.super-cdn.com (raw origin, for Akamai)
- https://spatest.akamaized.net (Akamai rewrite)
