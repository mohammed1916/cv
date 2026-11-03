import './TwoBagGridView.css'

// Rows are the load in bag 1 and columns are the load in bag 2. A filled cell is a load
// pair that can be reached. The pair just added is shaded darker, and the empty origin is outlined.
export default function TwoBagGridView({ run, step }) {
  const { w1, w2 } = run.input
  const [na, nb] = step.placed || []
  return <div className="two-bags" style={{ '--accent': '#0369a1' }}>
    <table className="two-bags__grid" aria-label="Reachable load pairs">
      <caption>Rows: bag 1 load. Columns: bag 2 load.</caption>
      <thead>
        <tr><th />{Array.from({ length: w2 + 1 }, (_, b) => <th key={b} scope="col">{b}</th>)}</tr>
      </thead>
      <tbody>
        {Array.from({ length: w1 + 1 }, (_, a) => <tr key={a}>
          <th scope="row">{a}</th>
          {Array.from({ length: w2 + 1 }, (_, b) => {
            let state = step.reach[a][b] ? 'reachable' : 'empty'
            if (a === na && b === nb) state = 'new'
            if (a === 0 && b === 0) state += ' origin'
            return <td key={b} data-state={state.includes('new') ? 'new' : state.includes('origin') ? 'origin' : state}>
              {step.reach[a][b] ? '✓' : ''}
            </td>
          })}
        </tr>)}
      </tbody>
    </table>
    <p>{step.item !== null && step.item !== undefined ? `Item weight ${step.item}.` : 'No item in hand.'}</p>
    <p className="two-bags__readout">{step.best !== undefined ? `Largest total: ${step.best}` : 'Searching reachable pairs.'}</p>
    <p>{step.message}</p>
  </div>
}
