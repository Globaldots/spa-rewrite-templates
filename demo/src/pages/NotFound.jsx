import { Link, useLocation } from 'react-router-dom'

export default function NotFound() {
  const location = useLocation()
  return (
    <section className="card">
      <h1>SPA 404</h1>
      <p>
        No client route matches <code>{location.pathname}</code>. The HTTP
        status is still 200 because the edge served <code>/index.html</code>.
        That is expected for an SPA fallback, and different from a missing
        static file such as <code>/missing-asset.js</code>, which should be a
        real HTTP 404.
      </p>
      <p><Link to="/">Back home</Link></p>
    </section>
  )
}
