import { describeWeightedOps, distanceRows, layoutCircle, showDistance } from './wgraphModel.js'
import './WeightedGraphView.css'

const W = 320
const H = 240
const R = 16

/**
 * Weighted graph with its algorithm state: edges coloured by decision, the distance table (old vs new),
 * the priority queue, and chosen/rejected edges for spanning trees. `ops` are plain operation records.
 */
export default function WeightedGraphView({ labels, edges, directed, dist, before, settled, active, pq, pqLabel, edgeStates = {}, ops = [], chosen, rejected, total, title }) {
  const points = layoutCircle(labels.length, W, H)
  const lines = describeWeightedOps(ops, i => labels[i])
  const rows = dist ? distanceRows(dist, before, settled, active) : null
  const kinds = new Set(Object.values(edgeStates))
  return <section className="wgraph-view" aria-label="Weighted graph state">
    <h3>{title ?? (dist ? 'Weighted graph and distances' : 'Weighted graph and spanning tree')}</h3>
    {lines.length > 0 && <ol className="wgraph-view__ops" aria-label="Operations this step">
      {lines.map((line, i) => <li key={i}>{line}</li>)}
    </ol>}
    <div className="wgraph-view__body">
      <div className="wgraph-view__graph">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Weighted graph">
          {directed && <defs><marker id="wgraph-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" className="wgraph-view__arrow" /></marker></defs>}
          {edges.map(([u, v, w], i) => {
            const a = points[u], b = points[v]
            const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1
            const x2 = directed ? b.x - (dx / len) * (R + 3) : b.x, y2 = directed ? b.y - (dy / len) * (R + 3) : b.y
            const tone = edgeStates[i] ?? ''
            return <g key={i}>
              <line x1={a.x} y1={a.y} x2={x2} y2={y2} className={`wgraph-view__edge ${tone ? `is-${tone}` : ''}`} data-tone={tone || undefined} markerEnd={directed ? 'url(#wgraph-arrow)' : undefined} />
              <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 4} className="wgraph-view__weight">{w}</text>
            </g>
          })}
          {labels.map((name, i) => {
            const state = i === active ? 'is-active' : settled?.[i] ? 'is-final' : ''
            return <g key={i} className={`wgraph-view__node ${state}`}>
              <circle cx={points[i].x} cy={points[i].y} r={R} />
              <text x={points[i].x} y={points[i].y + (dist ? -1 : 4)}>{name}</text>
              {dist && <text x={points[i].x} y={points[i].y + 10} className="wgraph-view__dist">{showDistance(dist[i])}</text>}
            </g>
          })}
        </svg>
      </div>
      <div className="wgraph-view__side">
        {rows && <table className="wgraph-view__table">
          <caption>Distance table (old → new when it changed)</caption>
          <thead><tr><th scope="col">Node</th><th scope="col">Distance</th><th scope="col">Status</th></tr></thead>
          <tbody>{rows.map(row => <tr key={row.node} className={row.active ? 'is-active' : ''}>
            <th scope="row">{labels[row.node]}</th>
            <td className={row.changed ? 'is-changed' : ''}>{row.changed ? `${showDistance(row.previous)} → ${showDistance(row.value)}` : showDistance(row.value)}</td>
            <td>{row.status}</td>
          </tr>)}</tbody>
        </table>}
        {pq && <div>
          <p className="wgraph-view__label">{pqLabel ?? 'Priority queue (smallest first)'}</p>
          {pq.length ? <ol className="wgraph-view__chips" aria-label="Priority queue">{pq.map((item, i) => <li key={i}>{item}</li>)}</ol> : <p className="wgraph-view__empty">empty</p>}
        </div>}
        {chosen && <div>
          <p className="wgraph-view__label">Chosen edges{total !== undefined ? ` (total ${total})` : ''}</p>
          {chosen.length ? <ol className="wgraph-view__chips" aria-label="Chosen edges">{chosen.map((item, i) => <li key={i}>{item}</li>)}</ol> : <p className="wgraph-view__empty">none yet</p>}
        </div>}
        {rejected && <div>
          <p className="wgraph-view__label">Rejected edges</p>
          {rejected.length ? <ol className="wgraph-view__chips" aria-label="Rejected edges">{rejected.map((item, i) => <li key={i}>{item}</li>)}</ol> : <p className="wgraph-view__empty">none yet</p>}
        </div>}
      </div>
    </div>
    <p className="wgraph-view__legend">
      {kinds.has('active') && <span className="is-active">being examined</span>}
      {kinds.has('tight') && <span className="is-tight">relaxed (improved)</span>}
      {kinds.has('chosen') && <span className="is-chosen">chosen</span>}
      {kinds.has('rejected') && <span className="is-rejected">rejected</span>}
    </p>
  </section>
}
