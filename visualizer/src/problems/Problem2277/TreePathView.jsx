import './TreePathView.css'

const W = 320
const H = 260

// Tree drawn by depth from node 0. The start-to-end path is indigo, the query node gold,
// and the chosen closest path vertex green. Each node shows its distance from the query node.
export default function TreePathView({ run, step }) {
  const { n, edges } = run.input
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a) })
  const depth = Array(n).fill(-1)
  const order = []
  depth[0] = 0
  const queue = [0]
  for (let h = 0; h < queue.length; h++) {
    const u = queue[h]
    order.push(u)
    for (const w of adj[u]) if (depth[w] < 0) { depth[w] = depth[u] + 1; queue.push(w) }
  }
  const maxDepth = Math.max(...depth)
  const column = Array(n).fill(0)
  const perDepth = Array(maxDepth + 1).fill(0)
  order.forEach(v => { column[v] = perDepth[depth[v]]++ })
  const pos = v => {
    const count = perDepth[depth[v]]
    return [((column[v] + 0.5) / count) * (W - 40) + 20, 30 + (depth[v] / Math.max(1, maxDepth)) * (H - 60)]
  }
  const pathSet = new Set(step.path)
  const pathEdge = (a, b) => pathSet.has(a) && pathSet.has(b) && Math.abs(step.path.indexOf(a) - step.path.indexOf(b)) === 1
  return (
    <div className="tree-path-view">
      <svg className="tree-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Tree with path and query">
        {edges.map(([a, b], k) => {
          const [x1, y1] = pos(a)
          const [x2, y2] = pos(b)
          return <line key={k} className={pathEdge(a, b) ? 'tree-edge tree-edge--path' : 'tree-edge'} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
        {Array.from({ length: n }, (_, v) => {
          const [x, y] = pos(v)
          let cls = 'tree-node'
          if (pathSet.has(v)) cls = 'tree-node tree-node--path'
          if (step.x === v) cls = 'tree-node tree-node--query'
          if (step.best === v) cls = 'tree-node tree-node--pick'
          const d = step.distX && step.distX.length ? ` (${step.distX[v]})` : ''
          return <g key={v}>
            <circle className={cls} cx={x} cy={y} r={15} />
            <text className="tree-label" x={x} y={y + 4}>{v}</text>
            {d && <text className="tree-label" x={x} y={y + 28}>{d.trim()}</text>}
          </g>
        })}
      </svg>
      <p className="tree-caption">{step.query >= 0 ? `Query ${step.query}: start ${step.s}, end ${step.e}, node ${step.x}. Path ${step.path.join(' - ')}.` : 'Answers come one query at a time.'}</p>
      <p className="tree-text">Answers so far: [{step.answers.join(', ')}]</p>
    </div>
  )
}
