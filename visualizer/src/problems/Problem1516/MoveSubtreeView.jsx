import './MoveSubtreeView.css'

const GAP_X = 64
const GAP_Y = 76
const RADIUS = 20

// Lays out leaves left to right and centres each parent over its children.
function layoutTree(root) {
  const positions = []
  let leaf = 0
  const place = (node, depth) => {
    if (node.children.length === 0) {
      const x = leaf
      leaf += 1
      positions.push({ val: node.val, x, depth, node })
      return x
    }
    const xs = node.children.map(child => place(child, depth + 1))
    const x = (xs[0] + xs[xs.length - 1]) / 2
    positions.push({ val: node.val, x, depth, node })
    return x
  }
  place(root, 0)
  const depth = Math.max(...positions.map(p => p.depth))
  return { positions, leaves: Math.max(1, leaf), depth }
}

function roleOf(val, step) {
  if (val === step.p) return 'moving'
  if (val === step.q) return 'target'
  return ''
}

export default function MoveSubtreeView({ step }) {
  const tree = step.tree
  const { positions, leaves, depth } = layoutTree(tree)
  const width = leaves * GAP_X + 40
  const height = (depth + 1) * GAP_Y + 40
  const at = new Map(positions.map(p => [p.val, { x: p.x * GAP_X + 30, y: p.depth * GAP_Y + 30 }]))
  const edges = []
  positions.forEach(({ node }) => node.children.forEach(child => edges.push([node.val, child.val])))
  const qEntry = positions.find(p => p.val === step.q)
  const qChildCount = qEntry ? qEntry.node.children.length : 0
  const rootVal = tree.val
  return (
    <section className="move-subtree" aria-label="N-ary tree before and after moving p under q">
      <svg className="move-subtree__svg" viewBox={`0 0 ${width} ${height}`} role="img"
        aria-label={`Tree with ${positions.length} nodes; ${step.p} moving, ${step.q} is the target`}>
        {edges.map(([a, b]) => {
          const from = at.get(a)
          const to = at.get(b)
          const moved = b === step.p && step.phase !== 'start' && step.phase !== 'check'
          return <line key={`${a}-${b}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            className={moved ? 'move-subtree__edge move-subtree__edge--moved' : 'move-subtree__edge'} />
        })}
        {positions.map(({ val }) => {
          const { x, y } = at.get(val)
          const role = roleOf(val, step)
          return <g key={val} className={`move-subtree__node ${role ? `move-subtree__node--${role}` : ''}`}>
            <circle cx={x} cy={y} r={RADIUS} />
            <text x={x} y={y + 5} textAnchor="middle">{val}</text>
            {val === rootVal ? <text className="move-subtree__tag" x={x} y={y - RADIUS - 4} textAnchor="middle">root</text> : null}
          </g>
        })}
      </svg>
      <ul className="move-subtree__legend" aria-label="Node roles">
        <li><span className="move-subtree__swatch move-subtree__swatch--moving" /> p: {step.p}, the subtree that moves</li>
        <li><span className="move-subtree__swatch move-subtree__swatch--target" /> q: {step.q}, the new parent</li>
        <li><span className="move-subtree__swatch move-subtree__swatch--edge" /> {step.phase === 'attach' || step.phase === 'done' ? 'Edge just created for p' : 'Edge that changed'}</li>
      </ul>
      <output aria-label="Parent of q">
        {step.mode ? `${step.mode === 'inside' ? 'q is inside p, so q is lifted first' : 'q is outside p, so p moves directly'}` : 'Reading the tree'}
        {` · ${step.q} has ${qChildCount} child${qChildCount === 1 ? '' : 'ren'} now`}
      </output>
    </section>
  )
}
