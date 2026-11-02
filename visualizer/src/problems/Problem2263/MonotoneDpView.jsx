import './MonotoneDpView.css'

// Rows are elements of nums, columns are candidate target values, and each cell is the cheapest
// cost of making the prefix end at that target. The lowest cell in the last row is the answer.
export default function MonotoneDpView({ run, step }) {
  const { nums } = run.input
  const values = step.values
  const lastRow = step.table.length ? step.table[step.table.length - 1] : []
  const minCost = lastRow.length ? Math.min(...lastRow) : null
  return (
    <div className="dp-view">
      <table className="dp-table" aria-label="Cost table">
        <thead><tr><th>element</th>{values.map(v => <th key={v}>target {v}</th>)}</tr></thead>
        <tbody>
          {step.table.map((row, i) => (
            <tr key={i} className={i === step.index ? 'is-current' : ''}>
              <th>{nums[i]}</th>
              {row.map((cost, v) => <td key={v} className={i === step.table.length - 1 && cost === minCost ? 'is-min' : ''}>{cost}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="dp-caption">{step.orientation ? `Orientation: ${step.orientation}.` : 'Choose the cheaper orientation at the end.'}</p>
      {step.up !== undefined && <p className="dp-verdict">Non-decreasing: {step.up} · non-increasing: {step.down}</p>}
      {step.result !== null && step.up === undefined && <p className="dp-verdict">Cost of this orientation: {step.result}</p>}
    </div>
  )
}
