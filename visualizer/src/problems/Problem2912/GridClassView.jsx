import './GridClassView.css'

const LABELS = { D: 'destination', R: 'same row', C: 'same column', O: 'other' }

export default function GridClassView({ run, step }) {
  const { n, m, source, destination } = run.input
  const classOf = (r, c) => {
    if (r === destination[0] && c === destination[1]) return 'D'
    if (r === destination[0]) return 'R'
    if (c === destination[1]) return 'C'
    return 'O'
  }
  const rows = Array.from({ length: n }, (_, r) => r + 1)
  const cols = Array.from({ length: m }, (_, c) => c + 1)
  const counts = step.counts
  const rowsFor = [['D', counts.d], ['R', counts.r], ['C', counts.c], ['O', counts.o]]
  return (
    <div className="grid-class-view">
      <p className="grid-class-rule">Each cell is grouped by its relation to the destination. A move always lands in the same row or the same column, so each group has one count of ways.</p>
      <div className="grid-class-board" style={{ gridTemplateColumns: `repeat(${m}, minmax(36px, 1fr))` }} role="img" aria-label={`${n} by ${m} grid with the source and destination marked`}>
        {rows.flatMap(r => cols.map(c => {
          const cls = classOf(r, c)
          const isSource = r === source[0] && c === source[1]
          return (
            <div key={`${r}-${c}`} className={`grid-class-cell is-${cls.toLowerCase()}`} title={`row ${r}, column ${c}: ${LABELS[cls]}`}>
              <span className="grid-class-coord">{r},{c}</span>
              <span className="grid-class-tag">{cls}</span>
              {isSource && <span className="grid-class-source">start</span>}
            </div>
          )
        }))}
      </div>
      <table className="grid-class-counts">
        <caption>Ways per class after {step.move} of {run.input.k} moves</caption>
        <thead><tr><th scope="col">Class</th><th scope="col">Ways ending in class</th></tr></thead>
        <tbody>
          {rowsFor.map(([cls, value]) => (
            <tr key={cls} className={`is-${cls.toLowerCase()}`}>
              <th scope="row">{cls} ({LABELS[cls]})</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <output className="grid-class-message" aria-label="Move status">{step.message}</output>
    </div>
  )
}
