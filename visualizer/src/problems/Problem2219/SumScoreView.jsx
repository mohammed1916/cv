import './SumScoreView.css'

// Bars show nums. Blue bars are the prefix up to the current index, orange bars the suffix from it; the table lists each index.
export default function SumScoreView({ run, step }) {
  const { nums } = run.input
  const max = Math.max(1, ...nums.map(v => Math.abs(v)))
  const bestIndex = step.rows.length ? step.rows.reduce((acc, row) => (row.score > acc.score ? row : acc), step.rows[0]).i : -1
  return (
    <div className="score-view">
      <div className="score-bars" role="img" aria-label="nums as bars">
        {nums.map((value, i) => {
          const height = Math.max(4, (Math.abs(value) / max) * 130)
          return <div key={i} className="score-col">
            <span className="score-value">{value}</span>
            <div className={`score-bar${step.index >= 0 && i <= step.index ? ' score-bar--prefix' : ''}${step.index >= 0 && i >= step.index && step.index < nums.length ? ' score-bar--suffix' : ''}${value < 0 ? ' score-bar--neg' : ''}`} style={{ height }} />
            <span className="score-value">[{i}]</span>
          </div>
        })}
      </div>
      <table className="score-table" aria-label="Prefix and suffix per index">
        <thead><tr><th>index</th><th>prefix</th><th>suffix</th><th>score</th></tr></thead>
        <tbody>
          {nums.map((_, i) => {
            const row = step.rows.find(r => r.i === i)
            const cls = i === step.index ? 'is-current' : row && i === bestIndex ? 'is-best' : ''
            return <tr key={i} className={cls}>
              <th>{i}</th>
              <td>{row ? row.prefix : '-'}</td>
              <td>{row ? row.suffix : '-'}</td>
              <td>{row ? row.score : '-'}</td>
            </tr>
          })}
        </tbody>
      </table>
      <p className="score-caption">Best so far: {step.best ?? '-'}</p>
    </div>
  )
}
