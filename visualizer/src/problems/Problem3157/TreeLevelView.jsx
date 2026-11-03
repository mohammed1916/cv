import './TreeLevelView.css'

// Lays the tree out with in-order x positions and depth as y. Nodes are coloured by pass:
// finished levels, the level being summed, and levels still waiting in the queue.
export default function TreeLevelView({ run, step }) {
  const nodes = []
  const edges = []
  let order = 0
  const walk = (node, depth) => {
    if (!node) return null
    const left = walk(node.left, depth + 1)
    const x = order++
    const entry = { id: node.id, val: node.val, depth, x }
    nodes.push(entry)
    const right = walk(node.right, depth + 1)
    if (left) edges.push({ from: entry, to: left })
    if (right) edges.push({ from: entry, to: right })
    return entry
  }
  walk(run.root, 0)
  const width = Math.max(1, order - 1)
  const depthCount = Math.max(...nodes.map(n => n.depth)) + 1
  const px = x => 40 + (x / width) * 520
  const py = d => 36 + d * 64
  const processed = new Set(step.processed)
  const levelOf = depth => depth + 1
  const stateOf = node => {
    if (levelOf(node.depth) < step.level) return 'done'
    if (levelOf(node.depth) === step.level && processed.has(node.id)) return 'visited'
    if (levelOf(node.depth) === step.level) return 'current'
    return 'waiting'
  }
  return (
    <section className="tree-level" aria-label="Binary tree with level sums">
      <svg viewBox={`0 0 600 ${36 + depthCount * 64}`} role="img" aria-label="Tree levels">
        {edges.map((e, i) => <line key={i} x1={px(e.from.x)} y1={py(e.from.depth)} x2={px(e.to.x)} y2={py(e.to.depth)} className="tree-level__edge" />)}
        {nodes.map(node => (
          <g key={node.id} transform={`translate(${px(node.x)} ${py(node.depth)})`} className={`tree-level__node is-${stateOf(node)}`}>
            <circle r="20" />
            <text dy="5" textAnchor="middle">{node.val}</text>
          </g>
        ))}
        {Array.from({ length: depthCount }, (_, d) => (
          <text key={d} x="6" y={py(d) + 5} className="tree-level__label">{`L${d + 1}`}</text>
        ))}
      </svg>
      <ul className="tree-level__sums" aria-label="Level sums">
        {Array.from({ length: depthCount }, (_, d) => {
          const lvl = d + 1
          const sum = step.sums[d]
          const best = lvl === step.bestLevel
          return (
            <li key={lvl} className={best ? 'is-best' : ''}>
              {`Level ${lvl}: ${sum === undefined ? (lvl === step.level ? `${step.total} so far` : '…') : sum}${best ? ' (best)' : ''}`}
            </li>
          )
        })}
      </ul>
      <p className="tree-level__caption">{step.message}</p>
    </section>
  )
}
