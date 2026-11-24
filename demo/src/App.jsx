import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Product from './pages/Product.jsx'
import Docs from './pages/Docs.jsx'
import DeepLinks from './pages/DeepLinks.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  const location = useLocation()
  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="mark" aria-hidden="true" />
          <div>
            <strong>GlobalDots</strong>
            <span>SPA rewrite demo</span>
          </div>
        </div>
        <nav>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/products/42">Product 42</NavLink>
          <NavLink to="/docs/a/b">Docs /a/b</NavLink>
          <NavLink to="/deep-links">Deep-link tests</NavLink>
        </nav>
      </header>
      <main>
        <p className="path-chip">
          Current path: <code>{location.pathname}</code>
          {location.search ? <code>{location.search}</code> : null}
        </p>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products/:id" element={<Product />} />
          <Route path="/docs/:section/:page" element={<Docs />} />
          <Route path="/deep-links" element={<DeepLinks />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer>
        Hosted on Cloudflare R2. Client-side routes need a rewrite to <code>/index.html</code>.
      </footer>
    </div>
  )
}
