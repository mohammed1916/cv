// Left: the digit mapping. Right: each number shown with its mapped value; the sort order is listed beneath.
export default function MappingView({ run, step }) {
  const { mapping, nums } = run.input
  const mapped = step.mapped ?? []
  const shown = step.order ?? nums.map((_, i) => i)
  return (
    <div className="mapping-view">
      <div className="digit-map" role="table" aria-label="Digit mapping">
        {mapping.map((to, from) => <div key={from} className="digit-map-cell" role="cell"><strong>{from}</strong><span>→ {to}</span></div>)}
      </div>
      <table className="jumble-table" aria-label="Numbers and mapped values">
        <thead><tr><th>index</th><th>number</th><th>mapped</th></tr></thead>
        <tbody>
          {nums.map((x, i) => <tr key={i} className={i === step.index ? 'is-current' : ''}>
            <td>{i}</td><td>{x}</td><td>{i < mapped.length ? mapped[i] : '-'}</td>
          </tr>)}
        </tbody>
      </table>
      {step.phase !== 'map' && <p>Order: {shown.map(i => nums[i]).join(', ')}</p>}
    </div>
  )
}
