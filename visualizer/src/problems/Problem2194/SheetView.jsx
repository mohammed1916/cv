// A small sheet: columns across the top, rows down the side. Cells are lit as the walk adds them.
export default function SheetView({ run, step }) {
  const { c1, c2, r1, r2 } = run.input
  const cols = []
  for (let c = c1.charCodeAt(0); c <= c2.charCodeAt(0); c++) cols.push(String.fromCharCode(c))
  const rows = []
  for (let r = r1; r <= r2; r++) rows.push(r)
  const added = new Set(step.result ?? [])
  return (
    <div className="sheet-view">
      <table className="sheet-grid" aria-label={`Range ${run.input.range}`}>
        <thead><tr><th /> {cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map(r => <tr key={r}>
            <th>{r}</th>
            {cols.map(c => {
              const cell = `${c}${r}`
              const isCorner = (cell === `${c1}${r1}` || cell === `${c2}${r2}`)
              return <td key={c} className={`${added.has(cell) ? 'is-added' : ''}${step.cell === cell ? ' is-current' : ''}${isCorner ? ' is-corner' : ''}`}>{cell}</td>
            })}
          </tr>)}
        </tbody>
      </table>
      <p>Cells added so far: <strong>{added.size}</strong></p>
    </div>
  )
}
