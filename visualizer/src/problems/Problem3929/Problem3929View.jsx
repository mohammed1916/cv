import './Problem3929View.css'

// Rows are part counts j, columns are prefix lengths i. The cell being filled is outlined, and its best start p
// is marked in the array above by a bracket. Unset cells are blank.
export default function Problem3929View({ run, step }) {
  if (!run || !step) {
    return (
      <section className="pc-view" aria-label="Partition cost table">
        <p className="pc-empty">Press Play to fill the table of best costs for each number of parts.</p>
      </section>
    )
  }

  const { nums, k } = run.input
  const n = nums.length
  const prefix = [0]
  for (const v of nums) prefix.push(prefix[prefix.length - 1] + v)
  const cols = Array.from({ length: n + 1 }, (_, i) => i)
  const rows = Array.from({ length: k + 1 }, (_, j) => j)
  const lo = step.p >= 0 ? step.p : null
  const hi = step.i >= 0 ? step.i : null

  return (
    <section className="pc-view" aria-label="Splitting nums into parts">
      <div className="pc-array" role="img" aria-label={`Values ${nums.join(', ')}`}>
        {nums.map((v, i) => {
          const inLast = lo !== null && hi !== null && i >= lo && i < hi
          return (
            <div key={i} className={`pc-item${inLast ? ' pc-item--last' : ''}`}>
              <span className="pc-val">{v}</span>
              <span className="pc-idx">{i}</span>
            </div>
          )
        })}
      </div>
      {lo !== null && hi !== null && <p className="pc-bracket">Last part: indices {lo} to {hi - 1}, sum {prefix[hi] - prefix[lo]}, cost {(prefix[hi] - prefix[lo]) * (prefix[hi] - prefix[lo] + 1) / 2}.</p>}
      <table className="pc-table">
        <thead>
          <tr>
            <th scope="col">parts \ prefix</th>
            {cols.map(i => <th key={i} scope="col">{i}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(j => (
            <tr key={j}>
              <th scope="row">{j}</th>
              {cols.map(i => {
                const value = step.dp[j] ? step.dp[j][i] : null
                const cur = step.j === j && step.i === i
                return <td key={i} className={cur ? 'pc-cell pc-cell--cur' : value !== null && value !== undefined ? 'pc-cell pc-cell--set' : 'pc-cell'}>{value === null || value === undefined ? '' : value}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="pc-message">{step.message}</p>
    </section>
  )
}
