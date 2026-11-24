import { Link, useParams } from 'react-router-dom'

export default function Product() {
  const { id } = useParams()
  return (
    <section className="card">
      <h1>Product {id}</h1>
      <p>
        Dynamic segment demo. Try <Link to="/products/7">/products/7</Link> or
        {' '}<Link to="/products/42?ref=email">/products/42?ref=email</Link>.
        The query string must be preserved by the rewrite.
      </p>
    </section>
  )
}
