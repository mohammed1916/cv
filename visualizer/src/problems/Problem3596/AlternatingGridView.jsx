import './AlternatingGridView.css'

export default function AlternatingGridView({ run, step }) {
  const { rows, cols } = run.input
  const fmt = v => (v === null ? '-' : v)
  return (
    <figure className="alternating-grid-view">
      <div className="alternating-grid-view__grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(64px, 1fr))` }} role="table" aria-label={`${rows} by ${cols} grid of best costs`}>
        {Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => {
          const [even, odd] = step.best[i][j]
          const isCurrent = step.row === i && step.col === j
          const isTarget = i === rows - 1 && j === cols - 1
          const settledAny = step.settled[i][j][0] || step.settled[i][j][1]
          const cls = ['cell', isCurrent ? 'cell--current' : '', isTarget ? 'cell--target' : '', settledAny ? 'cell--settled' : ''].join(' ').trim()
          return (
            <div key={`${i}-${j}`} role="cell" className={cls}>
              <small>{`entry ${(i + 1) * (j + 1)}`}</small>
              <b>{`e ${fmt(even)}`}</b>
              <b>{`o ${fmt(odd)}`}</b>
            </div>
          )
        }))}
      </div>
      <p className="alternating-grid-view__note" aria-live="polite">
        {step.parity !== undefined && step.row !== undefined ? `Next move from here is ${step.parity === 0 ? 'right or down' : 'left or up'}.` : ''}
      </p>
      <p className="alternating-grid-view__key">e: best cost when the next move is right or down. o: best cost when the next move is left or up.</p>
    </figure>
  )
}
