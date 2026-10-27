import IndexedSequence from './IndexedSequence'
import { describeFenwickOps, fenwickRange, fenwickRoles } from './fenwickModel.js'
import './FenwickView.css'

/**
 * Fenwick / binary indexed tree state and the operations that just ran: the cell array (1-indexed, each
 * cell labelled with the range it covers), the bit jumps of every update (i += i & -i) and query
 * (i -= i & -i), and which cells were written or read.
 */
export default function FenwickView({ tree, ops = [], title = 'Fenwick tree', mode = 'sum' }) {
  const roles = fenwickRoles(ops)
  const lines = describeFenwickOps(ops)
  const roleText = cell => (roles[cell] === 'update' ? 'written' : roles[cell] === 'query' ? 'read' : '')
  const kind = mode === 'max' ? 'best value' : 'sum'
  return <section className="fenwick-view" aria-label="Fenwick tree state">
    <h3>{title}</h3>
    {lines.length > 0 && <ol className="fenwick-view__ops" aria-label="Operations this step">
      {lines.map((line, i) => <li key={i}>{line}</li>)}
    </ol>}
    <IndexedSequence label={`tree[] — cell i holds the ${kind} of positions i − lowbit(i) + 1 .. i`} length={tree.length} indexOffset={1}
      valueAt={i => tree[i]} roleAt={i => roleText(i + 1)} />
    <ul className="fenwick-view__ranges" aria-label="Range covered by each cell">
      {tree.map((value, i) => {
        const [low, high] = fenwickRange(i + 1)
        return <li key={i} data-role={roleText(i + 1)}>
          <strong>[{i + 1}]</strong> covers {low === high ? `${low}` : `${low}..${high}`}
        </li>
      })}
    </ul>
    <p className="fenwick-view__legend"><span className="is-update">written by an update</span><span className="is-query">read by a query</span></p>
  </section>
}
