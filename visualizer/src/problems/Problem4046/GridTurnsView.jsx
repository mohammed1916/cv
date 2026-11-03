import './GridTurnsView.css'

const ARROWS = ['→', '↓', '←', '↑']

// The grid with the cheapest cost found for each cell, the state being expanded, and the queue head.
export default function GridTurnsView({ run, step }) {
  const { grid, k } = run.input
  const rows = grid.length
  const cols = grid[0].length
  const cur = step.state
  const curKey = cur ? `${cur.r},${cur.c}` : null
  const target = `${rows - 1},${cols - 1}`
  const nextKey = cur && cur.nr !== undefined ? `${cur.nr},${cur.nc}` : null

  return (
    <section className="gtv" aria-label="Minimum cost path with at most k turns">
      <div className="gtv-grid" role="table" aria-label="Grid with best costs">
        {grid.map((row, r) => (
          <div key={r} role="row" className="gtv-row">
            {row.map((value, c) => {
              const k2 = `${r},${c}`
              const best = step.cells[r][c]
              const cls = [
                'gtv-cell',
                k2 === curKey ? 'gtv-cell--now' : '',
                k2 === nextKey ? 'gtv-cell--next' : '',
                k2 === target ? 'gtv-cell--goal' : '',
                best !== null ? 'gtv-cell--reached' : '',
              ].join(' ')
              return (
                <div key={c} role="cell" className={cls} aria-label={`cell ${r},${c}, value ${value}, best ${best ?? 'none'}`}>
                  <span className="gtv-value">{value}</span>
                  <span className="gtv-best">{best === null ? '-' : best}</span>
                  {k2 === curKey && cur.d >= 0 ? <span className="gtv-arrow">{ARROWS[cur.d]}</span> : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <p className="gtv-key">Small figure: cell value. Bold figure: cheapest cost found so far. Turns allowed: {k}.</p>
      <ul className="gtv-facts">
        <li>{cur ? `Expanding ${curKey}, ${cur.t} turn${cur.t === 1 ? '' : 's'} used, cost ${cur.cost}` : 'Nothing expanded yet'}</li>
        <li>Turns left on this route: {step.turnsLeft}</li>
        <li>Queue head: {step.queue.length ? step.queue.map(s => `${s.cost} at ${s.r},${s.c}`).join('; ') : 'empty'}</li>
      </ul>
    </section>
  )
}
