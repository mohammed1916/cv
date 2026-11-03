import './GardenBeautyView.css'

// Flowers sit in a row. The right endpoint is outlined, the best left endpoint for its value is marked, and
// positive flowers between the two endpoints are shaded because a subsequence can keep them.
export default function GardenBeautyView({ run, step }) {
  const { flowers } = run.input
  const j = step.j
  const left = step.leftAt
  const pairing = step.candidate !== null && left !== null && left !== undefined
  const lo = pairing ? left : -1
  const entries = Object.entries(step.left || {})
  return (
    <div className="garden">
      <div className="garden__status" aria-live="polite">
        {j >= 0 && j < flowers.length ? `Right endpoint: flower ${j}, beauty ${flowers[j]}` : step.phase === 'done' ? 'Scan finished' : 'Building prefix sums'}
      </div>
      <div className="garden__row" role="list" aria-label="Flower beauty values">
        {flowers.map((v, i) => {
          const between = pairing && i > lo && i < j
          const included = between && v > 0
          const cls = [i === j ? 'is-right' : '', i === lo ? 'is-left' : '', included ? 'is-kept' : between ? 'is-skipped' : ''].join(' ')
          return (
            <div role="listitem" key={i} className={`garden__cell ${cls}`}>
              <span className="garden__index">{i}</span>
              <span className="garden__value">{v}</span>
              <span className="garden__tag">{i === lo ? 'left' : i === j ? 'right' : included ? 'keep' : between ? 'skip' : ''}</span>
            </div>
          )
        })}
      </div>
      <p className="garden__legend">Outline: right endpoint (solid) and matched left endpoint (dashed). Teal cells add to the total; grey cells between them are skipped because they are negative.</p>
      <dl className="garden__stats">
        <div><dt>candidate</dt><dd>{step.candidate ?? '-'}</dd></div>
        <div><dt>best so far</dt><dd>{step.best ?? '-'}</dd></div>
      </dl>
      <table className="garden__table" aria-label="Left endpoint scores">
        <thead><tr><th>value</th><th>best left score</th></tr></thead>
        <tbody>
          {entries.length ? entries.map(([v, s]) => <tr key={v}><td>{v}</td><td>{s}</td></tr>) : <tr><td colSpan={2}>No left endpoints yet</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
