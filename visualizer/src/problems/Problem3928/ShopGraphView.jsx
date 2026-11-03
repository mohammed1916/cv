import './ShopGraphView.css'

const fmt = v => (Number.isFinite(v) ? String(v) : '∞')

export default function ShopGraphView({ run, step }) {
  const { prices, roads } = run.input
  const n = prices.length
  const R = 110
  const pos = i => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    return { x: 180 + R * Math.cos(angle), y: 140 + R * Math.sin(angle) }
  }
  return (
    <section className="shop-graph" aria-label="Shops and roads">
      <svg viewBox="0 0 360 290" role="img" aria-label="Shop network">
        {roads.map(([a, b, cost, mult], k) => {
          const p = pos(a)
          const q = pos(b)
          return (
            <g key={`r${k}`}>
              <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} className="shop-graph__road" />
              <text x={(p.x + q.x) / 2} y={(p.y + q.y) / 2 - 4} textAnchor="middle" className="shop-graph__edge">{cost} / x{mult}</text>
            </g>
          )
        })}
        {prices.map((price, i) => {
          const p = pos(i)
          const cls = i === step.start ? 'is-start' : i === step.j ? 'is-buy' : ''
          return (
            <g key={`s${i}`} className={cls}>
              <circle cx={p.x} cy={p.y} r="18" className="shop-graph__shop" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" className="shop-graph__label">{i}</text>
              <text x={p.x} y={p.y + 34} textAnchor="middle" className="shop-graph__price">price {price}</text>
            </g>
          )
        })}
      </svg>
      <table className="shop-graph__table" aria-label="Costs for the current start">
        <thead><tr><th>shop</th><th>empty</th><th>loaded back</th><th>total</th></tr></thead>
        <tbody>
          {step.empty && prices.map((price, j) => (
            <tr key={j} className={j === step.j ? 'is-current' : ''}>
              <td>{j}</td>
              <td>{fmt(step.empty[j])}</td>
              <td>{fmt(step.carry[j])}</td>
              <td>{j <= step.j ? fmt(price + step.empty[j] + step.carry[j]) : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p role="status">{step.message}</p>
      <output aria-label="Answers so far">{step.answers.length ? `Best per start: ${step.answers.map(fmt).join(', ')}` : 'No start finished yet'}</output>
    </section>
  )
}
