import { describeSegtreeOps, segtreeLayout, segtreeRoles } from './segtreeModel.js'
import './SegtreeView.css'

const SLOT = 56
const ROW = 62
const NODE_W = 52
const NODE_H = 38
const MAX_LEAVES = 32

/**
 * Segment tree with its operations: nodes with stored values and pending lazy tags, the nodes the last
 * query/update visited (partial, fully covered, outside), tags pushed down, and values recomputed.
 * `ops` come from SegTree (segtreeModel.js) or from a solver's own logging.
 */
export default function SegtreeView({ n, nodes, ops = [], title = 'Segment tree', coords, note }) {
  if (n > MAX_LEAVES) return null
  // With `coords`, leaf i stands for the half-open stretch [coords[i], coords[i+1]) of a compressed axis.
  const leafRange = (lo, hi) => (coords ? `[${coords[lo]}, ${coords[hi + 1]})` : lo === hi ? `[${lo}]` : `[${lo}, ${hi}]`)
  const spanText = node => (coords ? `${coords[node.lo]}..${coords[node.hi + 1]}` : node.lo === node.hi ? String(node.lo) : `${node.lo}..${node.hi}`)
  const laid = segtreeLayout(nodes)
  const roles = segtreeRoles(ops)
  const at = Object.fromEntries(laid.map(node => [node.id, node]))
  const depthMax = Math.max(...laid.map(node => node.depth))
  const width = n * SLOT
  const height = (depthMax + 1) * ROW
  const x = node => node.center * SLOT
  const y = node => node.depth * ROW + NODE_H / 2 + 4
  const lines = describeSegtreeOps(ops, leafRange)
  return <section className="segtree-view" aria-label={title}>
    <h3>{title}</h3>
    {lines.length > 0 && <ol className="segtree-view__ops" aria-label="Operations this step">
      {lines.map((line, i) => <li key={i}>{line}</li>)}
    </ol>}
    {note && <p className="segtree-view__note">{note}</p>}
    <div className="segtree-view__scroll">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}: ${laid.length} nodes`}>
        {laid.filter(node => node.id > 1).map(node => {
          const parent = at[node.id >> 1]
          return <line key={`e${node.id}`} className="segtree-view__edge" x1={x(parent)} y1={y(parent) + NODE_H / 2} x2={x(node)} y2={y(node) - NODE_H / 2} />
        })}
        {laid.map(node => <g key={node.id} className={`segtree-view__node ${roles[node.id] ? `is-${roles[node.id]}` : ''}`} transform={`translate(${x(node) - NODE_W / 2}, ${y(node) - NODE_H / 2})`}>
          <title>{`Node ${leafRange(node.lo, node.hi)} stores ${node.label}${node.tag ? `, pending tag ${node.tag}` : ''}`}</title>
          <rect width={NODE_W} height={NODE_H} rx="8" />
          <text className="segtree-view__value" x={NODE_W / 2} y="16" textAnchor="middle">{node.label}</text>
          <text className="segtree-view__range" x={NODE_W / 2} y="31" textAnchor="middle">{spanText(node)}</text>
          {node.tag && <g className="segtree-view__tag" transform={`translate(${NODE_W - 4}, -6)`}>
            <rect x={-(node.tag.length * 3.6 + 6)} y="-8" width={node.tag.length * 7.2 + 8} height="14" rx="7" />
            <text x={-(node.tag.length * 3.6 + 6) + (node.tag.length * 7.2 + 8) / 2} y="3" textAnchor="middle">{node.tag}</text>
          </g>}
        </g>)}
      </svg>
    </div>
    <p className="segtree-view__legend">
      <span className="is-partial">partly overlapping (recurse)</span>
      <span className="is-covered">fully covered</span>
      <span className="is-outside">outside (skipped)</span>
      <span className="is-pushed">tag pushed down</span>
      <span className="is-pulled">recomputed from children</span>
      <span className="is-tag">pending lazy tag</span>
    </p>
  </section>
}
