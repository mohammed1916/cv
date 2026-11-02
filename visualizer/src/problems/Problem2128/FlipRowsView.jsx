import './FlipRowsView.css'

// Each row beside its normalised shape (bits XOR-ed with the first bit). Matching shapes mean a clear grid.
export default function FlipRowsView({ run, step }) {
  const { grid } = run.input
  const bits = row => row.map((bit, c) => <span key={c} className={`flip-bit${bit ? ' flip-bit--one' : ''}`}>{bit}</span>)
  return (
    <div className="flip-view">
      <table className="flip-table" aria-label="Rows and normalised shapes">
        <thead><tr><th>row</th><th>raw bits</th><th>normalised shape</th><th>check</th></tr></thead>
        <tbody>
          {grid.map((row, r) => {
            const checked = step.row >= r && step.row >= 0
            const shape = row.map(bit => bit ^ row[0])
            const bad = step.phase === 'mismatch' && step.row === r
            const current = step.row === r
            const cls = bad ? 'flip-row--bad' : current ? 'flip-row--current' : ''
            return (
              <tr key={r} className={cls}>
                <th>{r}</th><td>{bits(row)}</td><td>{checked || step.row < 0 ? bits(shape) : '…'}</td>
                <td>{checked ? (shape.join('') === step.pattern.join('') ? 'same shape' : 'different') : ''}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="flip-verdict" aria-label="Pattern">Pattern to match: {step.pattern.join('')}</p>
      {step.ok !== null && <p className={`flip-verdict ${step.ok ? 'flip-verdict--ok' : 'flip-verdict--bad'}`}>{step.ok ? 'Clearable by flips' : 'Not clearable by flips'}</p>}
    </div>
  )
}
