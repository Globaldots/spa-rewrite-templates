import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="hero">
      <h1>Object storage does not do SPA routing</h1>
      <p>
        This site is a static single-page app on an R2 bucket. The JavaScript
        router can open <code>/about</code> after the shell has loaded, but a
        refresh or a pasted deep link asks the origin for that path as a file
        key. Without a rewrite, R2 and S3 return 404.
      </p>
      <p>
        The Cloudflare URL Rewrite on this hostname sends extensionless paths
        to <code>/index.html</code>, leaves real files alone, and still 404s
        missing assets such as <code>/missing-asset.js</code>.
      </p>
      <p>
        Start with the <Link to="/deep-links">deep-link test page</Link>, or
        open <Link to="/about">/about</Link>, <Link to="/products/42">/products/42</Link>,
        or the nested route <Link to="/docs/a/b">/docs/a/b</Link>.
      </p>
    </section>
  )
}
