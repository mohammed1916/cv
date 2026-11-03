import './FlipTreeView.css'

const GAP_X = 78
const GAP_Y = 96
const PAD = 40

// Lay the tree out: leaves take consecutive columns, each operator sits over the middle of its children.
function layout(nodes) {
  const pos = {}
  let column = 0
  const place = (id, depth) => {
    const node = nodes[id]
    let x
    if (node.left === null && node.right === null) {
      x = column
      column += 1
    } else {
      const kids = [node.left, node.right].filter(k => k !== null)
      const xs = kids.map(k => place(k, depth + 1))
      x = xs.reduce((a, b) => a + b, 0) / xs.length
    }
    pos[id] = { x, y: depth }
    return x
  }
  place(0, 0)
  return pos
}

const label = node => ({ 0: 'F', 1: 'T', 2: 'OR', 3: 'AND', 4: 'XOR', 5: 'NOT' })[node.val]

export default function FlipTreeView({ run, step }) {
  if (!run || !step) {
    return (
      <section className="ft-view" aria-label="Flip tree">
        <p className="ft-empty">Press Play to combine the costs from the leaves up to the root.</p>
      </section>
    )
  }

  const nodes = run.input.root
  const pos = layout(nodes)
  const maxX = Math.max(...Object.values(pos).map(p => p.x))
  const maxY = Math.max(...Object.values(pos).map(p => p.y))
  const width = PAD * 2 + Math.max(1, maxX) * GAP_X + 60
  const height = PAD * 2 + maxY * GAP_Y + 60
  const sx = id => PAD + 30 + pos[id].x * GAP_X
  const sy = id => PAD + 20 + pos[id].y * GAP_Y
  const pairs = step.pairs || {}
  const current = step.node
  const formatPair = id => (pairs[id] ? `F:${pairs[id][0]} T:${pairs[id][1]}` : 'not yet')
  const finalWanted = run.input.result ? 'T' : 'F'

  const edges = []
  nodes.forEach(node => {
    if (node.left !== null) edges.push([node.id, node.left])
    if (node.right !== null) edges.push([node.id, node.right])
  })

  return (
    <section className="ft-view" aria-label="Minimum flips in a binary tree">
      <header className="ft-header">
        <h3 className="ft-title">{step.phase === 'done' ? `Root needs ${step.answer} flip${step.answer === 1 ? '' : 's'}` : 'Costs from the bottom up'}</h3>
        <p className="ft-status" role="status">
          {`Target result: ${finalWanted}. `}
          {current !== null && current !== undefined ? `Node ${label(nodes[current])}: ${formatPair(current)}` : ''}
        </p>
      </header>

      <div className="ft-stage">
        <svg className="ft-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Binary expression tree. ${step.message}`}>
          {edges.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={sx(a)} y1={sy(a)} x2={sx(b)} y2={sy(b)}
              className={`ft-edge${pairs[b] ? ' ft-edge--done' : ''}`} />
          ))}
          {nodes.map(node => {
            const isLeaf = node.left === null && node.right === null
            const classes = ['ft-node', isLeaf ? 'ft-node--leaf' : 'ft-node--op']
            if (node.id === current) classes.push('ft-node--current')
            if (pairs[node.id]) classes.push('ft-node--done')
            return (
              <g key={node.id} className={classes.join(' ')}
                aria-label={`${label(node)} node, costs ${formatPair(node.id)}${node.id === current ? ', current' : ''}`}>
                <circle cx={sx(node.id)} cy={sy(node.id)} r={isLeaf ? 22 : 26} />
                <text x={sx(node.id)} y={sy(node.id) + 5} textAnchor="middle" className="ft-label">{label(node)}</text>
                <text x={sx(node.id)} y={sy(node.id) + 42} textAnchor="middle" className="ft-pair">{formatPair(node.id)}</text>
              </g>
            )
          })}
        </svg>
      </div>

      <p className="ft-message" role="note">{step.message}</p>
      <ul className="ft-legend" aria-label="Legend">
        <li><span className="ft-swatch ft-swatch--leaf" /> leaf bit (F or T)</li>
        <li><span className="ft-swatch ft-swatch--op" /> operator (OR, AND, XOR, NOT)</li>
        <li><span className="ft-swatch ft-swatch--done" /> costs already computed</li>
        <li><span className="ft-swatch ft-swatch--current" /> node being combined</li>
      </ul>
    </section>
  )
}
