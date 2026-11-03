import './Problem3902View.css'
import { buildTree } from './algorithm'

const GAP_X = 58
const GAP_Y = 76
const PAD = 40

// Nodes sit in rows by depth and in left-to-right order. The level being read is outlined, its read order is
// numbered, and the node where the sum stops carries a stop marker. Sums so far are listed under the tree.
export default function Problem3902View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="zl-view" aria-label="Zigzag level sums">
        <p className="zl-empty">Press Play to read each level in its zigzag direction and stop at the first missing child.</p>
      </section>
    )
  }

  const { root, nodes } = buildTree(run.input.tree)
  const pos = new Map()
  let column = 0
  const walk = node => {
    if (!node) return
    walk(node.left)
    pos.set(node.id, { x: PAD + column * GAP_X, y: PAD + node.depth * GAP_Y })
    column += 1
    walk(node.right)
  }
  walk(root)
  const maxDepth = Math.max(0, ...nodes.map(n => n.depth))
  const width = PAD * 2 + Math.max(column - 1, 0) * GAP_X
  const height = PAD * 2 + maxDepth * GAP_Y + 10
  const orderIndex = new Map((step.order || []).map((id, i) => [id, i + 1]))
  const edges = nodes.flatMap(n => [n.left, n.right].filter(Boolean).map(c => [n.id, c.id]))
  const sums = run.result

  return (
    <section className="zl-view" aria-label="Zigzag level reading">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Binary tree with ${nodes.length} nodes`}>
        {edges.map(([a, b]) => {
          const pa = pos.get(a)
          const pb = pos.get(b)
          return <line key={`${a}-${b}`} className="zl-edge" x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} />
        })}
        {nodes.map(n => {
          const p = pos.get(n.id)
          const inLevel = step.level === n.depth + 1
          const isStop = step.stop === n.id
          const isRead = step.read === n.id
          const cls = ['zl-node', inLevel ? 'zl-node--level' : '', isRead ? 'zl-node--read' : '', isStop ? 'zl-node--stop' : ''].filter(Boolean).join(' ')
          return (
            <g key={n.id} className={cls}>
              <circle cx={p.x} cy={p.y} r={18} />
              <text x={p.x} y={p.y + 5} textAnchor="middle">{n.val}</text>
              {orderIndex.has(n.id) && <text className="zl-order" x={p.x + 20} y={p.y - 14}>{orderIndex.get(n.id)}</text>}
              {isStop && <text className="zl-stop" x={p.x} y={p.y + 34} textAnchor="middle">no {step.level % 2 === 1 ? 'left' : 'right'} child</text>}
            </g>
          )
        })}
      </svg>
      <p className="zl-message">{step.message}</p>
      <ol className="zl-sums" aria-label="Level sums so far">
        {Array.from({ length: maxDepth + 1 }, (_, d) => (
          <li key={d} className={d + 1 === step.level ? 'zl-sum zl-sum--cur' : d < sums.length && step.level > d + 1 || step.phase === 'done' ? 'zl-sum zl-sum--done' : 'zl-sum'}>
            <span>Level {d + 1} ({d % 2 === 0 ? 'left to right' : 'right to left'})</span>
            <strong>{step.phase === 'done' || step.level > d + 1 ? sums[d] : d + 1 === step.level ? step.levelSum : '-'}</strong>
          </li>
        ))}
      </ol>
    </section>
  )
}
