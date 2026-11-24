import { Link, useParams } from 'react-router-dom'

export default function Docs() {
  const { section, page } = useParams()
  return (
    <section className="card">
      <h1>Docs /{section}/{page}</h1>
      <p>
        Nested path demo for routes such as <code>/docs/a/b</code>. A trailing
        slash variant, <Link to="/docs/a/b/">/docs/a/b/</Link>, should also
        serve the SPA shell.
      </p>
    </section>
  )
}
