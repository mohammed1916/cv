// Products of the pairs with the number of pairs that give each product.
export default function View({ run, step }) {
  const counts = step.snapshot.counts ?? {}
  const products = Object.keys(counts).map(Number).sort((a, b) => a - b)
  return <div className="same-product-view">
    <p>Numbers: [{run.input.join(', ')}]</p>
    <table aria-label="Pairs by product">
      <thead><tr><th>Product</th><th>Pairs</th><th>Tuples added</th></tr></thead>
      <tbody>{products.map(p => {
        const c = counts[p]
        return <tr key={p} className={step.product === p ? 'is-current' : ''}>
          <td>{p}</td><td>{c}</td><td>{8 * (c * (c - 1) / 2)}</td>
        </tr>
      })}</tbody>
    </table>
    <p>Ordered tuples so far: {step.snapshot.answer ?? 0}</p>
    <p>{step.message}</p>
  </div>
}
