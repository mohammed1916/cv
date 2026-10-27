import { describeDpTransition, dpCellName, dpCellRoles, dpFormatValue, dpWindow, normalizeDpSpec } from './dpDependencyModel.js'
import './DPDependencyView.css'

/**
 * A DP table with the cell being filled, the earlier cells it reads (coloured), the source that won
 * (marked chosen), the recurrence and why that transition applies. Covers linear, grid, interval,
 * bitmask and knapsack tables; large tables show a window around the active cell.
 */
export default function DPDependencyView({ title = 'DP transition', labels = {}, ...spec }) {
  const n = normalizeDpSpec(spec)
  const roles = dpCellRoles(spec)
  const win = dpWindow(spec)
  const lines = describeDpTransition(spec)
  const rows = []
  for (let r = win.rowStart; r < win.rowEnd; r++) rows.push(r)
  const columns = []
  for (let c = win.columnStart; c < win.columnEnd; c++) columns.push(c)
  const columnLabel = c => labels.columns?.[c] ?? (n.shape === 'bitmask' ? c.toString(2).padStart(Math.max(1, Math.ceil(Math.log2(n.values[0].length))), '0') : c)
  const rowLabel = r => labels.rows?.[r] ?? r
  return <section className="dp-deps" aria-label="DP transition">
    <h3>{title}</h3>
    <ol className="dp-deps__lines">{lines.map((line, i) => <li key={i}>{line}</li>)}</ol>
    {n.sources.length > 0 && <ul className="dp-deps__arrows" aria-label="Cells read">
      {n.sources.map((s, i) => <li key={i} className={s.chosen ? 'is-chosen' : ''}>
        <code>{dpCellName(n.shape, s.cell)} = {dpFormatValue(n.values[s.cell[0]]?.[s.cell[1]])}</code>
        <span aria-hidden="true"> ➜ </span><code>{dpCellName(n.shape, n.target)}</code>
      </li>)}
    </ul>}
    {!win.hidden && <div className="dp-deps__scroll"><table className="dp-deps__table">
      <caption>{n.oneD ? 'Table' : 'Rows'}{win.rowEnd - win.rowStart < n.values.length || win.columnEnd - win.columnStart < (n.values[0]?.length ?? 0) ? ' (window around the active cell)' : ''}</caption>
      <thead><tr>{!n.oneD && <th scope="col" />}{columns.map(c => <th scope="col" key={c}>{columnLabel(c)}</th>)}</tr></thead>
      <tbody>{rows.map(r => <tr key={r}>
        {!n.oneD && <th scope="row">{rowLabel(r)}</th>}
        {columns.map(c => {
          const role = roles[`${r},${c}`]
          return <td key={c} data-role={role}>{dpFormatValue(n.values[r][c])}</td>
        })}
      </tr>)}</tbody>
    </table></div>}
    <p className="dp-deps__legend">
      <span className="is-target">cell being filled</span>
      <span className="is-chosen">source that gave the answer</span>
      <span className="is-source">other source read</span>
    </p>
  </section>
}
