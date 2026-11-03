import './BoardView.css'

// An 8 by 8 board: each square shows its distance once the search reaches it.
export default function BoardView({ run, step }) {
  const { source, target } = run.input
  const distOf = new Map(step.dist.map(([[r, c], d]) => [`${r},${c}`, d]))
  const frontier = new Set(step.queue.map(([r, c]) => `${r},${c}`))
  const at = step.at ? `${step.at[0]},${step.at[1]}` : null
  const rows = Array.from({ length: 8 }, (_, r) => r + 1)
  const cols = Array.from({ length: 8 }, (_, c) => c + 1)

  return (
    <section className="bsh" aria-label="Bishop search board">
      <div className="bsh-board" role="grid" aria-label="8 by 8 board">
        {rows.map(r => (
          <div key={r} role="row" className="bsh-row">
            {cols.map(c => {
              const k = `${r},${c}`
              const d = distOf.get(k)
              const isSource = r === source[0] && c === source[1]
              const isTarget = r === target[0] && c === target[1]
              const classes = [
                'bsh-cell',
                (r + c) % 2 === 0 ? 'bsh-cell--light' : 'bsh-cell--dark',
                d !== undefined ? 'bsh-cell--seen' : '',
                frontier.has(k) ? 'bsh-cell--queued' : '',
                k === at ? 'bsh-cell--now' : '',
                isTarget ? 'bsh-cell--target' : '',
              ].join(' ')
              return (
                <div key={c} role="gridcell" className={classes} aria-label={`${r},${c}${d !== undefined ? `, distance ${d}` : ''}`}>
                  {isSource ? <span className="bsh-tag">S</span> : null}
                  {isTarget ? <span className="bsh-tag bsh-tag--t">T</span> : null}
                  {d !== undefined ? <span className="bsh-dist">{d}</span> : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <p className="bsh-key">S source, T target, number = fewest moves found so far. Outlined squares are waiting in the queue.</p>
      <output className="bsh-msg" aria-label="Search state">Queue length: {step.queue.length}{step.dir ? ` · moving ${step.dir[0] === 1 ? 'down' : 'up'}-${step.dir[1] === 1 ? 'right' : 'left'}` : ''}</output>
    </section>
  )
}
