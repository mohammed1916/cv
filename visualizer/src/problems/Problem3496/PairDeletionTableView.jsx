import './PairDeletionTableView.css'

// The array row with the window being scored outlined, and a triangular table of best scores per window (row = left end, column = right end).
export default function PairDeletionTableView({ run, step }) {
  if (!run || !step) return <section className="pd-view"><p className="pd-empty">Press Play to score every window from short to long.</p></section>
  const nums = run.input
  const n = nums.length
  const { dp, l, r, options, chosen } = step
  const inWindow = i => l >= 0 && i >= l && i <= r
  return (
    <section className="pd-view" aria-label="Pair deletion windows">
      <div className="pd-array" aria-label="Values">
        {nums.map((v, i) => (
          <span key={i} className={`pd-value${inWindow(i) ? ' pd-value--window' : ''}${l >= 0 && (i === l || i === l + 1) ? ' pd-value--front' : ''}${l >= 0 && (i === r || i === r - 1) && r > l + 1 ? ' pd-value--back' : ''}`}>
            {v}
            <small>{i}</small>
          </span>
        ))}
      </div>
      <table className="pd-table" aria-label="Best score for each window">
        <caption>Best score for nums[left..right]</caption>
        <thead>
          <tr><th>l \ r</th>{Array.from({ length: n }, (_, c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: n }, (_, row) => (
            <tr key={row}>
              <th scope="row">{row}</th>
              {Array.from({ length: n }, (_, col) => {
                const cell = col >= row ? dp && dp[row][col] : undefined
                const active = row === l && col === r
                return (
                  <td key={col} className={`${col < row ? 'pd-cell--empty' : ''}${active ? ' pd-cell--active' : ''}`}>
                    {cell === null || cell === undefined ? (col < row ? '' : '·') : cell}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {options && (
        <p className="pd-options">
          First two: {options.first} · Last two: {options.last} · Both ends: {options.ends}
          {chosen ? ` · kept ${chosen}` : ''}
        </p>
      )}
      <p className="pd-summary">{step.message}</p>
    </section>
  )
}
