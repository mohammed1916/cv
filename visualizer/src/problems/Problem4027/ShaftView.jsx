import './ShaftView.css'

// A shaft with floors, the request floors marked, and a table of earliest times for the current subset.
export default function ShaftView({ run, step }) {
  const { start, requests } = run.input
  const n = requests.length
  const floors = [...new Set([start, ...requests.map(([, f]) => f)])].sort((a, b) => b - a)
  const top = floors[0]
  const bottom = floors[floors.length - 1]
  const rowsOf = floor => Math.max(0, floor)
  const fromFloor = step.from >= 0 ? requests[step.from][1] : null
  const toFloor = step.to >= 0 ? requests[step.to][1] : null
  const has = j => (step.mask >> j) & 1

  return (
    <section className="shf" aria-label="Elevator requests">
      <div className="shf-layout">
        <ol className="shf-shaft" aria-label="Floors from top to bottom">
          {Array.from({ length: top - bottom + 1 }, (_, k) => top - k).map(floor => {
            const reqs = requests.map(([a, f], j) => ({ a, f, j })).filter(r => r.f === floor)
            const isStart = floor === start
            const cls = ['shf-floor', isStart ? 'shf-floor--start' : '', floor === toFloor ? 'shf-floor--to' : '', floor === fromFloor ? 'shf-floor--from' : ''].join(' ')
            return (
              <li key={floor} className={cls} style={{ '--rows': rowsOf(floor) }}>
                <span className="shf-num">floor {floor}</span>
                {isStart ? <span className="shf-tag">start</span> : null}
                {reqs.map(r => (
                  <span key={r.j} className={`shf-req${has(r.j) ? ' shf-req--done' : ''}`}>
                    #{r.j + 1} at t≥{r.a}
                  </span>
                ))}
              </li>
            )
          })}
        </ol>

        <div className="shf-table">
          <h3>Earliest time per last request</h3>
          <p className="shf-muted">Set of fulfilled requests: {n ? requests.map((_, j) => (has(j) ? `#${j + 1}` : null)).filter(Boolean).join(' ') || 'none' : 'none'}</p>
          <table>
            <thead><tr><th scope="col">Last</th><th scope="col">Time</th></tr></thead>
            <tbody>
              {requests.map((_, j) => {
                const value = step.dp[step.mask >= 0 ? step.mask : 0]?.[j]
                const shown = step.mask > 0 && value !== null && value !== undefined ? value : '-'
                return (
                  <tr key={j} className={step.to === j ? 'shf-row-now' : ''}>
                    <td>#{j + 1}</td>
                    <td>{shown}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="shf-msg">{step.phase === 'relax' || step.phase === 'keep' ? `Candidate ${step.arrive}: ${step.improved ? 'stored' : 'not better'}` : ''}</p>
        </div>
      </div>
    </section>
  )
}
