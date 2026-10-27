import { graphCircleLayout, graphNodeRole, isActiveEdge, describeFrontier, frontierOps, gridCellRole, cellName } from './graphTraversalModel.js'
import './GraphTraversalView.css'

export const GRAPH_VIEW_MAX_NODES = 24
export const GRID_VIEW_MAX_SIDE = 12

/**
 * Graph or grid traversal state: the structure, the frontier (queue or stack), which nodes are visited, the node
 * being processed, the edge being examined, and per-node tags such as in-degree counts or two-colouring.
 * Plain-data props only (labels array, no functions) so a story step can carry them.
 * Graph mode: n (node count), edges [[u,v]], directed, tags {id: text}, groups {id: 0|1}.
 * Grid mode: grid {rows, cols, text(r,c) or cells[r][c], blocked(r,c)}; current/neighbour/frontier/visited/done are [row, col] cells.
 */
export default function GraphTraversalView({
  title = 'Traversal', n = 0, edges = [], directed = false, reversed = false, labels = null, labelOf = labels ? (i => labels[i]) : String,
  current = null, neighbour = null, visited = [], frontier = [], prevFrontier, frontierKind = 'queue', frontierTitle,
  done = [], tags = {}, groups = {}, grid = null, notes = [], showFrontier = true, legend = {},
}) {
  const isGrid = Boolean(grid)
  if (isGrid ? Math.max(grid.rows, grid.cols) > GRID_VIEW_MAX_SIDE : n > GRAPH_VIEW_MAX_NODES) {
    return <section className="gtv" aria-label={title}><h3>{title}</h3><p className="gtv__note">Too large to draw readably; the frontier is listed instead.</p>
      {showFrontier && <p className="gtv__frontier-text">{describeFrontier(frontierKind, frontier, isGrid ? cellName : labelOf)}</p>}</section>
  }
  const name = isGrid ? cellName : labelOf
  const ops = prevFrontier === undefined ? [] : frontierOps(prevFrontier, frontier, frontierKind, name)
  const lines = [...notes, ...ops]
  const state = { current, neighbour, frontier, visited, done }
  const L = { current: 'processing now', neighbour: 'edge being examined', frontier: frontierKind === 'stack' ? 'on the stack' : 'in the queue', visited: 'visited', done: 'finished', ...legend }
  const W = 420, H = 300
  const points = isGrid ? [] : graphCircleLayout(n, W, H)
  return <section className="gtv" aria-label={title}>
    <h3>{title}</h3>
    {lines.length > 0 && <ol className="gtv__ops" aria-label="What just happened">{lines.map((line, i) => <li key={i}>{line}</li>)}</ol>}
    {isGrid
      ? <div className="gtv__grid" role="img" aria-label="Grid state" style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(34px, 56px))` }}>
        {Array.from({ length: grid.rows * grid.cols }, (_, k) => {
          const r = Math.floor(k / grid.cols), c = k % grid.cols
          const blocked = grid.blocked?.(r, c) ?? false
          const role = blocked ? 'blocked' : gridCellRole(r, c, state)
          return <div key={k} className="gtv__cell" data-role={role} data-cell={`${r},${c}`}>
            <small>{r},{c}</small><b>{grid.text ? grid.text(r, c) : grid.cells ? grid.cells[r][c] : ''}</b></div>
        })}
      </div>
      : <svg className="gtv__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Graph state">
        <defs><marker id="gtv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="currentColor" /></marker></defs>
        {edges.map(([u, v]) => {
          if (!points[u] || !points[v]) return null
          const active = isActiveEdge(u, v, { current, neighbour, directed, reversed })
          const dx = points[v].x - points[u].x, dy = points[v].y - points[u].y, len = Math.hypot(dx, dy) || 1
          const pad = directed ? 22 : 0
          return <line key={`${u}-${v}`} className={`gtv__edge ${active ? 'is-active' : ''}`} data-edge={`${u},${v}`}
            x1={points[u].x} y1={points[u].y} x2={points[v].x - dx / len * pad} y2={points[v].y - dy / len * pad}
            markerEnd={directed ? 'url(#gtv-arrow)' : undefined} />
        })}
        {points.map((p, id) => {
          const role = graphNodeRole(id, state)
          return <g key={id} className="gtv__node" data-role={role} data-group={groups[id] ?? ''} data-node={id}>
            <circle cx={p.x} cy={p.y} r={19} />
            <text x={p.x} y={p.y + 4} textAnchor="middle">{labelOf(id)}</text>
            {tags[id] !== undefined && <text className="gtv__tag" x={p.x} y={p.y + 33} textAnchor="middle">{tags[id]}</text>}
          </g>
        })}
      </svg>}
    {showFrontier && <div className="gtv__frontier" aria-label={frontierTitle ?? (frontierKind === 'stack' ? 'Stack' : 'Queue')}>
      <strong>{frontierTitle ?? (frontierKind === 'stack' ? 'Stack (top is last)' : 'Queue (front first)')}</strong>
      <div className="gtv__chips">{frontier.length ? frontier.map((x, i) => <span key={i} className="gtv__chip">{name(x)}</span>) : <em>empty</em>}</div>
    </div>}
    <p className="gtv__legend">{['current', 'neighbour', 'frontier', 'visited', 'done'].map(k => <span key={k} data-role={k}>{L[k]}</span>)}</p>
  </section>
}
