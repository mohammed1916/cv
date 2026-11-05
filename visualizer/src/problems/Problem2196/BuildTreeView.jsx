import TreeDiagram from '../../components/shared/TreeDiagram'

// Draw the links attached so far. Positions use in-order x and depth y, so the shape of the tree reads directly.
export default function BuildTreeView({ run, step }) {
  const left = step.left ?? new Map()
  const right = step.right ?? new Map()
  const nodeIds = step.nodes ?? []
  const root = step.root ?? (step.phase === 'attach' ? null : run.input.rows[0][0])
  const depth = new Map()
  const order = []
  const walk = (v, d) => {
    if (v === undefined || v === null) return
    depth.set(v, d)
    if (left.has(v)) walk(left.get(v), d + 1)
    order.push(v)
    if (right.has(v)) walk(right.get(v), d + 1)
  }
  const roots = root !== null && root !== undefined ? [root] : nodeIds.filter(v => ![...left.values(), ...right.values()].includes(v))
  roots.forEach(r => walk(r, 0))
  const positions = new Map()
  order.forEach((v, i) => positions.set(v, { x: 60 + i * 60, y: 50 + (depth.get(v) ?? 0) * 80 }))
  const edges = []
  for (const [p, c] of left) if (positions.has(p) && positions.has(c)) edges.push({ fromId: p, toId: c })
  for (const [p, c] of right) if (positions.has(p) && positions.has(c)) edges.push({ fromId: p, toId: c })
  const nodes = order.map(v => ({ id: v, val: v }))
  const active = new Set(step.current !== undefined ? [step.current] : [])
  const labelFor = n => (step.child === n.id ? 'just attached' : n.id === root ? 'root' : '')
  return (
    <div className="build-tree-view">
      <TreeDiagram positions={positions} edges={edges} nodes={nodes} activeIds={active} labelForNode={labelFor} />
      <p>{step.message}</p>
    </div>
  )
}
