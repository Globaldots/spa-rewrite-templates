import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const STATIC_CASES = [
  { path: '/', expect: '200, SPA shell (index.html)', kind: 'ok' },
  { path: '/about', expect: '200, SPA shell; About view', kind: 'ok' },
  { path: '/about/', expect: '200, SPA shell (trailing slash)', kind: 'ok' },
  { path: '/about?utm=test', expect: '200, SPA shell; query preserved', kind: 'ok' },
  { path: '/products/42', expect: '200, SPA shell; Product 42', kind: 'ok' },
  { path: '/products/42?ref=email', expect: '200, SPA shell; query preserved', kind: 'ok' },
  { path: '/docs/a/b', expect: '200, SPA shell; nested docs', kind: 'ok' },
  { path: '/docs/a/b/', expect: '200, SPA shell; trailing slash', kind: 'ok' },
  { path: '/deep-links', expect: '200, this page', kind: 'ok' },
  { path: '/this-route-does-not-exist', expect: '200, SPA 404 view (not an HTTP 404)', kind: 'warn' },
  { path: '/index.html', expect: '200, the real index.html object', kind: 'ok' },
  { path: '/favicon.ico', expect: '200, image/x-icon or image/vnd.microsoft.icon', kind: 'ok' },
  { path: '/robots.txt', expect: '200, text/plain', kind: 'ok' },
  { path: '/test-asset.txt', expect: '200, text/plain, not rewritten', kind: 'ok' },
  { path: '/missing-asset.js', expect: 'HTTP 404 (real missing file)', kind: 'bad' },
  { path: '/assets/does-not-exist.css', expect: 'HTTP 404', kind: 'bad' },
]

export default function DeepLinks() {
  const [assets, setAssets] = useState([])

  useEffect(() => {
    const hrefs = [
      ...[...document.scripts].map((s) => s.src).filter(Boolean),
      ...[...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href).filter(Boolean),
    ]
    const unique = [...new Set(hrefs)]
      .map((href) => {
        try {
          return new URL(href).pathname
        } catch {
          return null
        }
      })
      .filter((p) => p && p.startsWith('/assets/'))
    setAssets(unique)
  }, [])

  return (
    <section className="card">
      <h1>Deep-link test page</h1>
      <p>
        Use these links in the browser, or the curl script in the templates
        pack, to confirm the rewrite. Hashed files under <code>/assets/</code>
        are discovered from this page load so the list stays accurate after
        each build.
      </p>
      <table className="tests">
        <thead>
          <tr>
            <th>Path</th>
            <th>Expected</th>
          </tr>
        </thead>
        <tbody>
          {STATIC_CASES.map((row) => (
            <tr key={row.path}>
              <td>
                <Link to={row.path}>{row.path}</Link>
              </td>
              <td>
                <span className={`badge ${row.kind}`}>{row.kind === 'bad' ? '404' : row.kind === 'warn' ? 'SPA 404' : '200'}</span>{' '}
                {row.expect}
              </td>
            </tr>
          ))}
          {assets.map((path) => (
            <tr key={path}>
              <td>
                <a href={path}>{path}</a>
              </td>
              <td>
                <span className="badge ok">200</span> hashed asset, correct Content-Type, not rewritten
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
