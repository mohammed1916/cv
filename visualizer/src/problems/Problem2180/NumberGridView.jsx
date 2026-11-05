// Every integer from 1 to num is a chip. The current chip shows its digit sum; even sums are tinted.
export default function NumberGridView({ run, step }) {
  const { num } = run.input
  const items = Array.from({ length: num }, (_, i) => i + 1)
  const scanned = step.x ?? 0
  return (
    <div className="number-grid-view">
      <div className="chip-grid" role="img" aria-label={`Integers 1 to ${num}`}>
        {items.map(x => {
          const done = x <= scanned
          const even = done && String(x).split('').reduce((a, c) => a + Number(c), 0) % 2 === 0
          return <div key={x} className={`chip${x === scanned ? ' is-current' : ''}${even ? ' is-even' : ''}${done ? '' : ' is-pending'}`}>{x}</div>
        })}
      </div>
      {step.digits && <p>{scanned}: digits {step.digits.join(' + ')} = {step.total}, {step.even ? 'even' : 'odd'}.</p>}
      <p>Even digit sums so far: <strong>{step.ans}</strong></p>
    </div>
  )
}
