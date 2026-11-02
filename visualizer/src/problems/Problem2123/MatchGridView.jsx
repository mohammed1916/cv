import './MatchGridView.css'

// The grid coloured like a chessboard. Each matched white one shows the black one it is paired with.
export default function MatchGridView({ run, step }) {
  const { grid } = run.input
  const key = (r, c) => `${r},${c}`
  const pairOf = new Map()
  step.pairs.forEach((pair, index) => pairOf.set(key(...pair.white), { index: index + 1, black: pair.black }))
  const tried = new Set(step.visited)
  const current = step.black ? key(...step.black) : null
  const target = step.white ? key(...step.white) : null
  return (
    <div className="match-grid-view">
      <div className="match-grid" style={{ gridTemplateColumns: `repeat(${grid[0].length}, 44px)` }} role="grid" aria-label="Ones grid">
        {grid.flatMap((row, r) => row.map((value, c) => {
          const k = key(r, c)
          const classes = ['match-cell', (r + c) % 2 === 0 ? 'match-cell--black' : 'match-cell--white']
          if (value === 1) classes.push('match-cell--one')
          if (k === current) classes.push('match-cell--current')
          if (k === target) classes.push('match-cell--current')
          if (tried.has(k) && value === 1) classes.push('match-cell--tried')
          const pair = pairOf.get(k)
          if (pair) classes.push('match-cell--matched')
          return <div key={k} className={classes.join(' ')} data-pair={pair ? `#${pair.index}` : undefined}
            title={`(${r},${c}) ${(r + c) % 2 === 0 ? 'black' : 'white'}`}>{value === 1 ? (k === target ? 'W' : k === current ? 'B' : '1') : ''}</div>
        }))}
      </div>
      <p className="match-caption">{step.black ? `Black (${step.black.join(',')})` : 'Scanning black ones'}{step.white ? `, looking at white (${step.white.join(',')})` : ''}. Matched so far: {step.matched}.</p>
      <p className="match-pairs">{step.pairs.length ? step.pairs.map((pair, i) => `#${i + 1} white (${pair.white.join(',')}) ↔ black (${pair.black.join(',')})`).join(' · ') : 'No pairs yet.'}</p>
    </div>
  )
}
