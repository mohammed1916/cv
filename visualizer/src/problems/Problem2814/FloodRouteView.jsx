import './FloodRouteView.css'

// Grid of cells showing stone, water at the current minute, the traveler, cells already reached, and the blocked step.
export default function FloodRouteView({ run, step }) {
  const grid = run.input
  const cols = grid[0].length
  const same = (pair, r, c) => Array.isArray(pair) && pair[0] === r && pair[1] === c
  return <div className="flood-route">
    <div className="flood-route__grid" role="table" aria-label="Flood map" style={{ gridTemplateColumns: `repeat(${cols}, minmax(2.2rem, 3rem))` }}>
      {grid.flatMap((row, r) => [...row].map((ch, c) => {
        const flooded = run.flood[r][c] <= step.minute && ch !== 'X'
        const classes = ['flood-route__cell']
        if (ch === 'X') classes.push('is-stone')
        if (ch === 'D') classes.push('is-destination')
        if (ch === 'S') classes.push('is-start')
        if (flooded) classes.push('is-water')
        if (step.reached?.[r]?.[c]) classes.push('is-reached')
        if (same(step.cell, r, c)) classes.push('is-traveler')
        if (same(step.blocked, r, c)) classes.push(step.ok === false ? 'is-blocked' : 'is-next')
        const label = ch === 'X' ? 'stone' : ch === 'D' ? 'destination' : ch === '*' ? 'water source' : ch === 'S' ? 'start' : 'empty'
        const flood = Number.isFinite(run.flood[r][c]) ? `, floods at minute ${run.flood[r][c]}` : ''
        return <div key={`${r}-${c}`} role="cell" className={classes.join(' ')} aria-label={`row ${r} column ${c}: ${label}${flood}`}>
          <span className="flood-route__symbol">{ch === '.' && flooded ? '~' : ch}</span>
          {Number.isFinite(run.flood[r][c]) && ch !== 'X' && <span className="flood-route__time">{run.flood[r][c]}</span>}
          {same(step.cell, r, c) && <span className="flood-route__tag">you</span>}
        </div>
      }))}
    </div>
    <p className="flood-route__legend">Blue cells are flooded at the current minute. Small numbers give the minute water arrives. Amber marks the step being tested.</p>
    <output aria-label="Flood state">{`minute ${step.minute}${step.cell ? `, traveler at (${step.cell[0]}, ${step.cell[1]})` : ''}${step.blocked ? `, testing (${step.blocked[0]}, ${step.blocked[1]})` : ''}`}</output>
  </div>
}
