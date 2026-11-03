import './PathPairView.css'

// Each column shows the rows that walker A (down-right) and walker B (up-right) cover.
export default function PathPairView({ run, step }) {
  const grid = run.input.grid
  const n = grid.length
  const m = grid[0].length
  const picks = step.picks
  const covers = (r, c) => {
    const p = picks[c]
    if (!p) return { a: false, b: false }
    return { a: r >= p.a && r <= p.a2, b: r >= p.b2 && r <= p.b }
  }
  return (
    <section className="path-pair" aria-label="Two walkers on the grid">
      <table className="path-pair__grid">
        <tbody>
          {grid.map((row, r) => (
            <tr key={r}>
              {row.map((v, c) => {
                const { a, b } = covers(r, c)
                const cls = a && b ? 'is-shared' : a ? 'is-a' : b ? 'is-b' : ''
                return <td key={c} className={cls}><span>{v}</span></td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="path-pair__legend">A runs right and down from the top-left. B runs right and up from the bottom-left. Shared cells count once.</p>
      <p role="status">{step.message}</p>
      <output aria-label="Shared sum">{`Shared sum so far: ${step.shared}`}{step.phase === 'done' ? ` (grid ${n}x${m})` : ''}</output>
    </section>
  )
}
