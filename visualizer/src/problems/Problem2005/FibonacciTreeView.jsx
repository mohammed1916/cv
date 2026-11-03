import './FibonacciTreeView.css'

// Order m tree: root with subtrees of orders m-2 and m-1. Order 0 is empty, order 1 is one node.
function build(order) {
  if (order === 0) return null
  const children = []
  if (order >= 2) {
    const a = build(order - 2)
    const b = build(order - 1)
    if (a) children.push(a)
    if (b) children.push(b)
  }
  return { order, children }
}

function layout(node) {
  const pos = []
  let leaf = 0
  const walk = (n, depth) => {
    if (n.children.length === 0) {
      n.x = leaf++
    } else {
      n.children.forEach(c => walk(c, depth + 1))
      n.x = (n.children[0].x + n.children[n.children.length - 1].x) / 2
    }
    n.y = depth
    pos.push(n)
  }
  walk(node, 0)
  return { pos, leaves: leaf }
}

export default function FibonacciTreeView({ run, step }) {
  const order = step.order ?? run.input.n
  const shownOrder = Math.min(order, 6)
  const tree = build(shownOrder)
  const branch = step.branch ?? [0]
  const outcome = step.value === null || step.value === undefined ? 'Working' : step.value === 0 && step.phase === 'done' ? 'Bob wins' : step.phase === 'done' ? 'Alice wins' : `Value ${step.value}`
  let svg = null
  if (tree) {
    const { pos, leaves } = layout(tree)
    const W = Math.max(leaves, 1) * 48 + 40
    const H = (Math.max(...pos.map(n => n.y)) + 1) * 64 + 30
    const X = n => 20 + n.x * 48 + 24
    const Y = n => 26 + n.y * 64
    svg = (
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Fibonacci tree of order ${shownOrder}`} className="fib-tree__svg">
        {pos.flatMap(n => n.children.map(c => <line key={`${n.order}-${c.order}-${c.x}`} x1={X(n)} y1={Y(n)} x2={X(c)} y2={Y(c)} className="fib-tree__edge" />))}
        {pos.map((n, i) => (
          <g key={i}>
            <circle cx={X(n)} cy={Y(n)} r={16} className={n === tree ? 'fib-tree__root' : 'fib-tree__node'} />
            <text x={X(n)} y={Y(n) + 4} textAnchor="middle">{n.order}</text>
          </g>
        ))}
      </svg>
    )
  }
  return (
    <section className="fib-tree" aria-label="Fibonacci tree visual">
      <header className="fib-tree__head">
        <span className="fib-tree__pill">order {order}</span>
        <span className="fib-tree__pill" data-state={outcome === 'Alice wins' ? 'win' : outcome === 'Bob wins' ? 'lose' : 'idle'}>{outcome}</span>
      </header>
      {svg ?? <p className="fib-tree__note">Order {order} is too large to draw here, so only the branch values are shown.</p>}
      {tree && order > 6 && <p className="fib-tree__note">Drawn at order 6 for space. The values below use the full order {order}.</p>}
      <div className="fib-tree__branches" aria-label="Branch values">
        <h4>Branch values by order</h4>
        <ol>
          {branch.map((b, i) => (
            <li key={i} className={i === order ? 'is-current' : ''}>
              <span>{i}</span>
              <strong>{b}</strong>
            </li>
          ))}
        </ol>
        {step.left !== null && step.left !== undefined && <p>Children XOR: {step.left} xor {step.right} = {step.value}</p>}
      </div>
    </section>
  )
}
