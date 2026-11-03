import './PathGridView.css'

export default function PathGridView({ run, step }) {
  const { rows, cols } = run.input
  const [activeRow, activeCol] = step.cell || [-1, -1]
  return (
    <section className="path-grid" aria-label="Single path grid">
      <div className="path-grid__board" style={{ gridTemplateColumns: `repeat(${cols}, minmax(28px, 1fr))` }} role="table" aria-label="Grid cells">
        {step.grid.map((row, r) => [...row].map((ch, c) => {
          const count = step.ways[r][c]
          const active = r === activeRow && c === activeCol
          const isStart = r === 0 && c === 0
          const isEnd = r === rows - 1 && c === cols - 1
          return <div key={`${r}-${c}`} role="cell" className={`path-grid__cell${ch === '#' ? ' path-grid__cell--wall' : ' path-grid__cell--free'}${active ? ' path-grid__cell--active' : ''}`}>
            <span aria-label={ch === '#' ? 'obstacle' : 'free'}>{ch === '#' ? 'X' : '.'}</span>
            {count !== null && <small>{count}</small>}
            {isStart && <b className="path-grid__tag">S</b>}
            {isEnd && <b className="path-grid__tag">E</b>}
          </div>
        }))}
      </div>
      <p className="path-grid__legend">Free cells show the number of right-and-down paths from S. A single path means every cell can be reached one way.</p>
      <p className="path-grid__message">{step.message}</p>
    </section>
  )
}
