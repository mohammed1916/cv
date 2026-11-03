import './Problem3944View.css'

// Left: the array with each value's parity label. Right: a residue table with one column for even positions and one
// for odd positions. The best pair of residues (different from each other) is highlighted.
export default function Problem3944View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="ma-view" aria-label="Residue costs">
        <p className="ma-empty">Press Play to price each residue for the even and odd positions, then pick a different pair.</p>
      </section>
    )
  }

  const { nums, k } = run.input
  const residues = Array.from({ length: k }, (_, r) => r)
  const costs = (arr, r) => (arr.length > r ? arr[r] : null)
  const maxCost = Math.max(1, ...step.even, ...step.odd)

  return (
    <section className="ma-view" aria-label="Array values and residue costs">
      <p className="ma-rule">Move each value by ±1 steps. Even positions must share one residue mod {k}; odd positions must share a different one.</p>
      <div className="ma-row" aria-label="Values with parity">
        {nums.map((v, i) => (
          <div key={i} className={`ma-cell ${i % 2 === 0 ? 'ma-cell--even' : 'ma-cell--odd'}`}>
            <span className="ma-val">{v}</span>
            <span className="ma-tag">{i % 2 === 0 ? 'even idx' : 'odd idx'}</span>
            <span className="ma-res">mod {k}: {((v % k) + k) % k}</span>
          </div>
        ))}
      </div>
      <table className="ma-table">
        <thead>
          <tr>
            <th scope="col">residue</th>
            <th scope="col">even cost</th>
            <th scope="col">odd cost</th>
          </tr>
        </thead>
        <tbody>
          {residues.map(r => {
            const e = costs(step.even, r)
            const o = costs(step.odd, r)
            const isA = step.a === r
            const isB = step.b === r
            const cls = isA || isB ? 'ma-row-hit' : ''
            return (
              <tr key={r} className={cls}>
                <th scope="row">{r}{isA ? ' (evens)' : ''}{isB ? ' (odds)' : ''}</th>
                <td>{e === null || (step.phase === 'start') ? '-' : <Bar value={e} max={maxCost} />}</td>
                <td>{o === null || step.phase === 'start' || (step.phase === 'even') ? '-' : <Bar value={o} max={maxCost} />}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="ma-message">{step.message}</p>
      <p className="ma-best">Best so far: {step.best === null ? '-' : step.best}</p>
    </section>
  )
}

function Bar({ value, max }) {
  return (
    <span className="ma-bar-wrap">
      <span className="ma-bar" style={{ width: `${Math.round((value / max) * 100)}%` }} />
      <strong>{value}</strong>
    </span>
  )
}
