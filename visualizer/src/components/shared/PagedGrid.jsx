import { useState } from 'react'

// Preserve two-dimensional coordinates; every cell is reachable without rendering
// the entire grid into the DOM. Cell inspection follows the current trace frame.
export default function PagedGrid({ rows, columns, cellAt, label = 'Grid' }) {
  const [rowPage, setRowPage] = useState(0), [columnPage, setColumnPage] = useState(0)
  const [selected, setSelected] = useState(null)
  const pageSize = 8
  const rPage = Math.min(rowPage, Math.ceil(rows / pageSize) - 1)
  const cPage = Math.min(columnPage, Math.ceil(columns / pageSize) - 1)
  const rowStart = rPage * pageSize, colStart = cPage * pageSize
  const rowEnd = Math.min(rows, rowStart + pageSize), colEnd = Math.min(columns, colStart + pageSize)
  const selection = selected && selected[0] < rows && selected[1] < columns ? selected : null
  return <section className="algorithm-grid" aria-label={label}>
    <nav aria-label="Grid pages">
      <button disabled={!rPage} onClick={() => setRowPage(rPage - 1)}>Previous rows</button>
      <button disabled={rowEnd === rows} onClick={() => setRowPage(rPage + 1)}>Next rows</button>
      <button disabled={!cPage} onClick={() => setColumnPage(cPage - 1)}>Previous columns</button>
      <button disabled={colEnd === columns} onClick={() => setColumnPage(cPage + 1)}>Next columns</button>
      <label>Row <input aria-label="Go to grid row" type="number" min={0} max={rows - 1} value={rowStart}
        onChange={event => setRowPage(Math.floor(Math.min(rows - 1, Math.max(0, Number(event.target.value))) / pageSize))} /></label>
      <label>Column <input aria-label="Go to grid column" type="number" min={0} max={columns - 1} value={colStart}
        onChange={event => setColumnPage(Math.floor(Math.min(columns - 1, Math.max(0, Number(event.target.value))) / pageSize))} /></label>
    </nav>
    <p>Rows {rowStart}–{rowEnd - 1} of {rows}; columns {colStart}–{colEnd - 1} of {columns}. Select a cell to inspect.</p>
    <div className="algorithm-grid__viewport" tabIndex={0} role="region" aria-label="Scrollable grid">
      <div className="algorithm-grid__cells" style={{ gridTemplateColumns: `repeat(${colEnd - colStart}, minmax(76px, 1fr))` }}>
        {Array.from({ length: rowEnd - rowStart }, (_, r) => Array.from({ length: colEnd - colStart }, (_, c) => {
          const row = rowStart + r, column = colStart + c, cell = cellAt(row, column)
          return <button key={`${row},${column}`} data-row={row} data-column={column} data-role={cell.role}
            aria-label={`Cell ${row}, ${column}: ${cell.value}; ${cell.label}`} aria-pressed={selection?.[0] === row && selection?.[1] === column}
            onClick={() => setSelected([row, column])} style={{ borderTopColor: cell.color || 'var(--border)' }}>
            <small>[{row}, {column}]</small><strong>{cell.value}</strong><span>{cell.label}</span>
          </button>
        }))}
      </div>
    </div>
    {selection && <p className="algorithm-grid__detail" role="status">Cell [{selection.join(', ')}]: {cellAt(...selection).detail}</p>}
  </section>
}
