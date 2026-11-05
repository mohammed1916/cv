// Boxes numbered by digit sum, each with its count of balls so far; the current box is highlighted.
export default function View({ run, step }) {
  const counts = step.snapshot.counts ?? {}
  const boxes = Object.keys(counts).map(Number).sort((a, b) => a - b)
  const max = Math.max(1, ...Object.values(counts))
  return <div className="balls-view">
    <p>Balls {run.input.lowLimit} to {run.input.highLimit}</p>
    <ol aria-label="Boxes" className="balls-view__boxes">
      {boxes.map(b => <li key={b} className={step.box === b ? 'is-current' : ''}>
        <span>box {b}</span>
        <span className="balls-view__bar" style={{ width: `${(counts[b] / max) * 100}%` }} />
        <strong>{counts[b]}</strong>
      </li>)}
    </ol>
    <p>{step.message}</p>
  </div>
}
