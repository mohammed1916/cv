import './BikeMaskView.css'

export default function BikeMaskView({ run, step }) {
  const { workers, bikes, n, m } = step
  const dist = (w, b) => Math.abs(workers[w][0] - bikes[b][0]) + Math.abs(workers[w][1] - bikes[b][1])
  const masks = []
  for (let mask = 0; mask < 1 << m; mask++) if (step.dp[mask] !== null) masks.push(mask)
  return (
    <figure className="bmv" aria-label="Distances between workers and bikes, and the bike-set table">
      <div className="bmv__grid-wrap">
        <table className="bmv__dist">
          <caption>Distance from worker to bike</caption>
          <thead><tr><th /> {bikes.map((_, b) => <th key={b} className={b === step.bike ? 'bmv__hot' : ''}>B{b}</th>)}</tr></thead>
          <tbody>
            {workers.map((_, w) => (
              <tr key={w}>
                <th className={w === step.worker ? 'bmv__hot' : ''}>W{w}</th>
                {bikes.map((_, b) => (
                  <td key={b} className={w === step.worker && b === step.bike ? 'bmv__now' : ''}>{dist(w, b)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bmv__table-wrap">
        <table className="bmv__masks">
          <caption>Bike sets reached so far (dp)</caption>
          <thead><tr><th>Bikes used</th><th>Workers seated</th><th>Cost</th></tr></thead>
          <tbody>
            {masks.map(mask => {
              const bits = Array.from({ length: m }, (_, b) => b)
              const isCurrent = mask === step.mask || mask === step.nextMask
              return (
                <tr key={mask} className={`${mask === step.mask ? 'bmv__row--from' : ''}${mask === step.nextMask ? ' bmv__row--to' : ''}${isCurrent ? '' : ''}`}>
                  <td>
                    <span className="bmv__bits">{bits.map(b => <i key={b} className={mask & (1 << b) ? 'bmv__bit bmv__bit--on' : 'bmv__bit'}>{b}</i>)}</span>
                  </td>
                  <td>{popcountOf(mask)} / {n}</td>
                  <td>{step.dp[mask]}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="bmv__status" role="status">{step.message}</p>
      {step.phase === 'done' && <p className="bmv__answer">Best full assignment: {step.result}</p>}
    </figure>
  )
}

function popcountOf(mask) {
  let count = 0
  for (let x = mask; x; x &= x - 1) count++
  return count
}
