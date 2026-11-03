import './Problem3907View.css'

const CELL = 56
const PAD = 16

// The array is drawn across the top. The two shelves below hold the values already scanned, sorted by value,
// one per parity. The opposite shelf is highlighted, and the values smaller than the current one are marked.
export default function Problem3907View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="ps-view" aria-label="Opposite parity counts">
        <p className="ps-empty">Press Play to scan from the right and count smaller values of the other parity.</p>
      </section>
    )
  }

  const { nums } = run.input
  const width = PAD * 2 + nums.length * CELL
  const current = step.i >= 0 ? nums[step.i] : null
  const oppositeIndex = step.parity === null ? null : 1 - step.parity
  const shelfLabel = ['even', 'odd']

  return (
    <section className="ps-view" aria-label="Array with parity shelves">
      <svg viewBox={`0 0 ${width} 116`} role="img" aria-label={`Array of ${nums.length} values`}>
        {nums.map((v, i) => {
          const cls = ['ps-cell', i === step.i ? 'ps-cell--cur' : '', i > step.i && step.i >= 0 ? 'ps-cell--seen' : ''].filter(Boolean).join(' ')
          const x = PAD + i * CELL
          return (
            <g key={i} className={cls}>
              <rect x={x + 4} y={8} width={CELL - 8} height={44} rx={8} />
              <text className="ps-value" x={x + CELL / 2} y={36} textAnchor="middle">{v}</text>
              <text className="ps-index" x={x + CELL / 2} y={70} textAnchor="middle">{i}</text>
              <text className="ps-result" x={x + CELL / 2} y={100} textAnchor="middle">{step.phase === 'done' || (step.i >= 0 && i >= step.i) ? step.result[i] : '-'}</text>
            </g>
          )
        })}
      </svg>
      <div className="ps-shelves">
        {[0, 1].map(p => (
          <div key={p} className={`ps-shelf${oppositeIndex === p ? ' ps-shelf--opposite' : ''}${step.parity === p ? ' ps-shelf--own' : ''}`} aria-label={`${shelfLabel[p]} shelf`}>
            <h3>{shelfLabel[p]} shelf</h3>
            <ul>
              {step.shelves[p].length === 0 && <li className="ps-empty-slot">empty</li>}
              {step.shelves[p].map((v, k) => (
                <li key={k} className={current !== null && p === oppositeIndex && v < current ? 'ps-val ps-val--smaller' : 'ps-val'}>{v}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="ps-message">{step.message}</p>
      {step.count !== null && <p className="ps-count">Count for index {step.i}: {step.count}</p>}
      <p className="ps-note">Bottom row: counts so far, in index order. Highlighted values on the opposite shelf are smaller than the current value.</p>
    </section>
  )
}
