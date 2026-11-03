import './ResidueCostView.css'

export default function ResidueCostView({ run, step }) {
  const { k, nums } = run.input
  const maxCost = Math.max(1, ...step.evenCost, ...step.oddCost)
  return (
    <section className="residue-cost" aria-label="Cost per residue">
      <p className="residue-cost__values">Values: {nums.map((v, i) => <code key={i}>{i % 2 === 0 ? `even ${v}` : `odd ${v}`}</code>)}</p>
      <table>
        <thead><tr><th>residue</th><th>even positions</th><th>odd positions</th></tr></thead>
        <tbody>
          {Array.from({ length: k }, (_, r) => {
            const inPair = step.pair && (step.pair[0] === r || step.pair[1] === r)
            return (
              <tr key={r} className={[r === step.r ? 'is-current' : '', inPair ? 'is-pair' : ''].join(' ')}>
                <th>{r}</th>
                <td><span className="residue-cost__bar" style={{ width: `${(step.evenCost[r] / maxCost) * 100}%` }} />{step.evenCost[r]}</td>
                <td><span className="residue-cost__bar residue-cost__bar--odd" style={{ width: `${(step.oddCost[r] / maxCost) * 100}%` }} />{step.oddCost[r]}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p role="status">{step.message}</p>
      <output aria-label="Cheapest valid pair">{step.best === null ? '' : step.best === Infinity ? 'Searching' : `Best total: ${step.best}`}</output>
    </section>
  )
}
