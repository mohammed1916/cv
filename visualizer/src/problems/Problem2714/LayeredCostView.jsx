import './LayeredCostView.css'

const fmt = v => (v === Infinity ? '∞' : String(v))

export default function LayeredCostView({ run, step }) {
  const { n, edges, source, destination, k } = run.input
  const columns = Array.from({ length: k + 1 }, (_, j) => j)
  const best = Math.min(...step.table[destination])
  return (
    <section className="layered-view" aria-label="Cost by free hops used">
      <table>
        <caption>Cheapest cost to each node after j free hops (rows are nodes)</caption>
        <thead>
          <tr>
            <th scope="col">node</th>
            {columns.map(j => <th key={j} scope="col">{j} free</th>)}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: n }, (_, v) => (
            <tr key={v}>
              <th scope="row">
                {v}
                {v === source ? <span className="tag"> start</span> : null}
                {v === destination ? <span className="tag"> goal</span> : null}
              </th>
              {columns.map(j => {
                const isCurrent = step.current && step.current[0] === v && step.current[1] === j
                const isTarget = step.target && step.target[0] === v && step.target[1] === j
                const isSettled = step.done[v][j]
                const classes = ['cell', isCurrent ? 'current' : '', isTarget ? 'target' : '', isSettled ? 'settled' : ''].filter(Boolean).join(' ')
                return (
                  <td key={j} className={classes} aria-label={`node ${v}, ${j} free hops, cost ${fmt(step.table[v][j])}${isSettled ? ', settled' : ''}`}>
                    {fmt(step.table[v][j])}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ol className="edge-list" aria-label="Directed edges">
        {edges.map(([a, b, w], e) => (
          <li key={e} className={step.edge === e ? 'active' : ''}>{`${a} to ${b}, cost ${w}`}</li>
        ))}
      </ol>
      <output aria-label="Current best">{`Best so far to node ${destination}: ${fmt(best)}${step.phase === 'done' ? ' (final)' : ''}`}</output>
    </section>
  )
}
