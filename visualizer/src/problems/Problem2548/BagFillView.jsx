import './BagFillView.css'

const PALETTE = ['#0369a1', '#b45309', '#15803d', '#7c3aed', '#be123c', '#0f766e', '#a16207', '#4338ca']

export default function BagFillView({ run, step }) {
  const { capacity } = run.input
  const filled = capacity - step.remaining
  let offset = 0
  return (
    <div className="bf-view">
      <p className="bf-rule">Best items first by price per unit weight. Fractions of an item may be taken to fill the bag exactly.</p>
      <div className="bf-bag" role="img" aria-label={`Bag of capacity ${capacity}, filled ${filled}`}>
        {step.rows.filter(row => row.take > 0).map(row => {
          const width = (row.take / capacity) * 100
          const left = (offset / capacity) * 100
          offset += row.take
          return (
            <div key={row.index} className={`bf-piece${step.current >= 0 && step.rows[step.current]?.index === row.index ? ' bf-piece--now' : ''}`}
              style={{ left: `${left}%`, width: `${width}%`, background: PALETTE[row.index % PALETTE.length] }}>
              <span>#{row.index}</span>
            </div>
          )
        })}
      </div>
      <p className="bf-scale"><span>0</span><span>{filled} of {capacity} filled</span><span>{capacity}</span></p>
      <table className="bf-table" aria-label="Items in ranked order">
        <thead><tr><th scope="col">Item</th><th scope="col">Price</th><th scope="col">Weight</th><th scope="col">Price per unit</th><th scope="col">Taken</th></tr></thead>
        <tbody>
          {step.rows.map((row, position) => (
            <tr key={row.index} className={step.current === position ? 'bf-table__now' : row.take > 0 ? 'bf-table__taken' : undefined}>
              <th scope="row">#{row.index}</th>
              <td>{row.price}</td>
              <td>{row.weight}</td>
              <td>{row.ratio.toFixed(2)}</td>
              <td>{row.take}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <output className="bf-total" aria-label="Running total">Total price {Number(step.total).toFixed(2)} · room left {step.remaining}</output>
    </div>
  )
}
