import './LayeredCostView.css'

// Layered table: rows are target positions, columns are graph vertices. Each cell is the cheapest mismatch count
// of a walk ending at that vertex, with an arrow to the neighbour it came from. Route cells are outlined in gold.
export default function LayeredCostView({ run, step }) {
  const { names, targetPath } = run.input
  const cols = names.map((_, v) => v)
  const route = step.route || []
  return (
    <figure className="lc-view">
      <table>
        <thead>
          <tr>
            <th scope="col">position</th>
            {cols.map(v => <th scope="col" key={v}>{names[v]}<small> v{v}</small></th>)}
          </tr>
        </thead>
        <tbody>
          {targetPath.map((name, k) => (
            <tr key={k}>
              <th scope="row">{k}: {name}</th>
              {cols.map(v => {
                const cost = step.cost[k][v]
                const isNow = step.k === k && step.v === v && step.phase === 'cell'
                const onRoute = route[k] === v
                const parent = step.parent[k][v]
                return (
                  <td key={v} className={`lc-cell${isNow ? ' lc-cell--now' : ''}${onRoute ? ' lc-cell--route' : ''}`}>
                    <span className="lc-cost">{cost === Infinity ? '∞' : cost}</span>
                    {k > 0 && parent >= 0 && <small className="lc-from">← v{parent}</small>}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="lc-path">Walk: {route.map(v => (v < 0 ? '…' : `v${v}`)).join(' → ')}</p>
      <figcaption>{step.message}</figcaption>
    </figure>
  )
}
