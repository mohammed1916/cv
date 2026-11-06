import './FrequencyWindowView.css'
import PointerRail from '../../components/shared/PointerRail'

export default function FrequencyWindowView({ run, step }) {
  const { nums, k } = run.input
  const win = step.window
  return (
    <div className="fw-view">
      <p className="fw-rule">Window length k = {k}. Score = sum of value^count over distinct values in the window, reduced mod 1000000007.</p>
      <div className="fw-row" role="list" aria-label="Numbers with the current window">
        {nums.map((value, i) => {
          const inWindow = step.i >= 0 && i <= step.i && i >= Math.max(0, step.i - k + 1)
          const role = i === step.i ? 'now' : step.leaving === i ? 'leaving' : inWindow ? 'inside' : i > step.i ? 'ahead' : 'out'
          return (
            <div key={i} role="listitem" className={`fw-cell fw-cell--${role}`} data-role={role}>
              <span className="fw-cell__index">{i}</span>
              <span className="fw-cell__value">{value}</span>
            </div>
          )
        })}
      </div>
      {win && <PointerRail title="Pointers on the numbers" values={nums} pointers={[{ id: 'l', label: 'l', index: win.from, tone: 'primary' }, { id: 'r', label: 'r', index: win.to, tone: 'success' }]} />}
      {win && <p className="fw-note">Window [{win.from}..{win.to}]</p>}
      <table className="fw-table" aria-label="Terms of the current window">
        <thead><tr><th scope="col">Value</th><th scope="col">Count</th><th scope="col">Term value^count</th></tr></thead>
        <tbody>
          {step.terms.length === 0 && <tr><td colSpan={3}>Window empty</td></tr>}
          {step.terms.map(row => (
            <tr key={row.value}>
              <th scope="row">{row.value}</th>
              <td>{row.count}</td>
              <td>{row.term}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <output className="fw-score" aria-label="Score and best">Score {step.score} · best {step.best}</output>
    </div>
  )
}
