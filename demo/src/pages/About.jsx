export default function About() {
  return (
    <section className="card">
      <h1>About</h1>
      <p>
        If you landed here by refresh, a shared link, or a <code>curl</code> to
        <code>/about</code>, the edge rewrite worked. The browser address is
        still <code>/about</code>; only the origin path became
        <code>/index.html</code>.
      </p>
      <p>
        This page is not a separate HTML file. It is rendered by the same SPA
        shell as the rest of the demo.
      </p>
    </section>
  )
}
