// Values are grouped; each group shows its count as pairs plus a leftover when the count is odd.
export default function PairCountView({ run, step }) {
  const { nums } = run.input
  const entries = [...step.counts.entries()]
  return (
    <div className="pair-count-view">
      <div className="pair-values" role="img" aria-label={`Values ${nums.join(', ')}`}>
        {nums.map((x, i) => <span key={i} className={`pair-value${i === step.index ? ' is-current' : ''}`}>{x}</span>)}
      </div>
      <table className="pair-count-table" aria-label="Counts per value">
        <thead><tr><th>value</th><th>count</th><th>pairs</th><th>left over</th></tr></thead>
        <tbody>
          {entries.map(([x, c]) => <tr key={x} className={step.value === x ? 'is-current' : ''}>
            <td>{x}</td><td>{c}</td><td>{Math.floor(c / 2)}</td><td>{c % 2}</td>
          </tr>)}
        </tbody>
      </table>
      <p>{step.phase === 'done' ? (step.result ? 'Every value pairs up.' : 'A value is left over.') : step.message}</p>
    </div>
  )
}
