import './JobPairsView.css'

// Sorted jobs paired with sorted speeds. The bar length is the completion time; the largest time is marked.
export default function JobPairsView({ step }) {
  const maxTime = Math.max(1, ...step.rows.map(r => r.time))
  const maxRow = step.rows.reduce((acc, r) => (acc && acc.time >= r.time ? acc : r), null)
  return (
    <div className="jobs-view">
      <table className="jobs-table" aria-label="Job and speed pairs">
        <thead><tr><th>#</th><th>job</th><th>speed</th><th>time</th><th>completion</th></tr></thead>
        <tbody>
          {step.rows.map((row, i) => (
            <tr key={i} className={`${i === step.index ? 'is-current' : ''} ${maxRow && row === maxRow ? 'is-max' : ''}`.trim()}>
              <th>{i}</th><td>{row.job}</td><td>{row.speed}</td><td>{row.time}</td>
              <td style={{ textAlign: 'left' }}><span className="jobs-bar" style={{ width: `${(row.time / maxTime) * 180}px` }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="jobs-caption">Answer so far: {step.answer}</p>
    </div>
  )
}
