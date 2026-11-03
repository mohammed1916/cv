import './RemotenessGridView.css'

// Each unblocked component gets its own colour. Blocked cells are dark with a bar. The current cell has an outline.
export default function RemotenessGridView({ run, step }) {
  const grid = run.input
  const cols = grid[0].length
  return <div className="remoteness">
    <div className="remoteness__grid" role="table" aria-label="Grid components" style={{ gridTemplateColumns: `repeat(${cols}, minmax(2.6rem, 3.4rem))` }}>
      {grid.flatMap((row, r) => row.map((v, c) => {
        const id = step.label[r][c]
        const blocked = v === -1
        const colour = id >= 0 ? `hsl(${(id * 67) % 360} 70% 82%)` : undefined
        const current = step.cell && step.cell[0] === r && step.cell[1] === c
        return <div key={`${r}-${c}`} role="cell" className={`remoteness__cell${blocked ? ' is-blocked' : ''}${current ? ' is-current' : ''}`}
          style={!blocked && colour ? { background: colour } : undefined}
          aria-label={blocked ? `row ${r} column ${c}: blocked` : `row ${r} column ${c}: value ${v}${id >= 0 ? `, component ${id}` : ', not yet reached'}`}>
          {blocked ? <span className="remoteness__bar">X</span> : <span className="remoteness__value">{v}</span>}
          {!blocked && id >= 0 && <small>#{id}</small>}
        </div>
      }))}
    </div>
    <dl className="remoteness__facts">
      <div><dt>Total value</dt><dd>{step.total}</dd></div>
      <div><dt>Component cells</dt><dd>{step.cells}</dd></div>
      <div><dt>Component value</dt><dd>{step.sum}</dd></div>
      <div><dt>Answer so far</dt><dd>{step.answer}</dd></div>
    </dl>
    <p className="remoteness__legend">Cells sharing a colour can reach each other. A cell&apos;s remoteness is the total value outside its colour, so the component adds its cell count times that value.</p>
    <output>{step.message}</output>
  </div>
}
