import './Problem3888View.css'

const CELL = 62
const PAD = 16

// Each cell shows its original value and, while replaying, how many more covers it still needs.
// Placed squares are outlined and labelled with their count. The cell being decided is highlighted.
export default function Problem3888View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="gq-view" aria-label="Grid squares">
        <p className="gq-empty">Press Play to test each target value and then replay the cheapest plan.</p>
      </section>
    )
  }

  const { grid, k } = run.input
  const m = grid.length
  const n = grid[0].length
  const width = PAD * 2 + n * CELL
  const height = PAD * 2 + m * CELL
  const failRow = step.failAt ? step.failAt[0] : -1
  const failCol = step.failAt ? step.failAt[1] : -1

  return (
    <section className="gq-view" aria-label="Grid of values and square operations">
      <p className="gq-rule">Each operation adds 1 to every cell of one {k} by {k} square. Target: {step.target === null || step.target === undefined ? 'none' : step.target}.</p>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${m} by ${n} grid with ${k} by ${k} squares`}>
        {grid.map((row, i) => row.map((v, j) => {
          const cur = step.cur && step.cur[0] === i && step.cur[1] === j
          const fail = failRow === i && failCol === j
          const needVal = step.need ? step.need[i][j] : null
          const cls = ['gq-cell', cur ? 'gq-cell--cur' : '', fail ? 'gq-cell--fail' : '', needVal !== null && needVal === 0 ? 'gq-cell--done' : ''].filter(Boolean).join(' ')
          const x = PAD + j * CELL
          const y = PAD + i * CELL
          return (
            <g key={`${i}-${j}`} className={cls}>
              <rect x={x + 3} y={y + 3} width={CELL - 6} height={CELL - 6} rx={6} />
              <text className="gq-value" x={x + CELL / 2} y={y + (needVal === null ? CELL / 2 + 6 : CELL / 2 - 2)} textAnchor="middle">{v}</text>
              {needVal !== null && <text className="gq-need" x={x + CELL / 2} y={y + CELL - 8} textAnchor="middle">need {needVal}</text>}
            </g>
          )
        }))}
        {step.placed.map((p, idx) => (
          <g key={idx} className="gq-square">
            <rect x={PAD + p.j * CELL + 1} y={PAD + p.i * CELL + 1} width={k * CELL - 2} height={k * CELL - 2} rx={8} />
            <text x={PAD + p.j * CELL + 10} y={PAD + p.i * CELL + 18}>+{p.c}</text>
          </g>
        ))}
      </svg>
      <p className="gq-message">{step.message}</p>
      <p className="gq-total">{step.feasible === false ? 'This target fails.' : `Operations so far: ${step.ops}`}</p>
      <ul className="gq-legend">
        <li><span className="gq-swatch gq-swatch--cur" /> cell being decided</li>
        <li><span className="gq-swatch gq-swatch--square" /> placed square (count)</li>
        <li><span className="gq-swatch gq-swatch--fail" /> failing cell</li>
      </ul>
    </section>
  )
}
