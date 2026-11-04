import HeapView from '../../components/shared/HeapView'
import './RegionView.css'

// The grid with the region collected so far (points), the frontier held in the min-heap, and cells the current
// query cannot enter (value at or above the query). Only values strictly below the query can be collected.
export default function RegionView({ grid, step }) {
  const frontier = new Set((step.frontier || []).map(f => `${f.r},${f.c}`))
  const collected = new Set(step.visited)
  const q = step.query
  const heapValues = (step.frontier || []).map(f => f.v).sort((a, b) => a - b)
  return <section className="region-view" aria-label="Grid region">
    {q !== null && <p className="region-view__query">{`Query ${q}: a cell can be collected only if its value is below ${q}.`}</p>}
    <table className="region-view__grid" aria-label="Grid of values">
      <tbody>{grid.map((row, r) => <tr key={r}>{row.map((v, c) => {
        const key = `${r},${c}`
        const cls = collected.has(key) ? 'region-view__cell--collected' : frontier.has(key) ? 'region-view__cell--frontier' : (q !== null && v >= q) ? 'region-view__cell--blocked' : ''
        return <td key={c} className={`region-view__cell ${cls}`} aria-label={`cell ${r},${c} value ${v}${collected.has(key) ? ', collected' : frontier.has(key) ? ', in the heap' : ''}`}>{v}</td>
      })}</tr>)}</tbody>
    </table>
    <ul className="region-view__legend">
      <li><span className="region-view__swatch region-view__swatch--collected" />collected</li>
      <li><span className="region-view__swatch region-view__swatch--frontier" />in the heap</li>
      <li><span className="region-view__swatch region-view__swatch--blocked" />value at or above the query</li>
    </ul>
    <HeapView items={heapValues} order="min" title="Frontier heap (values)" />
  </section>
}
