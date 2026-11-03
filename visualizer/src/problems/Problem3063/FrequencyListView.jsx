import './FrequencyListView.css'

export default function FrequencyListView({ run, step }) {
  const values = run.input
  const counted = new Set(step.counts.map(([value]) => value))
  return (
    <div className="flv">
      <section aria-label="Input list">
        <h3 className="flv__title">Input list</h3>
        <ol className="flv__row">
          {values.map((value, i) => (
            <li key={i} className={`flv__node${step.value === value && step.phase === 'count' ? ' is-current' : ''}`}>{value}</li>
          ))}
        </ol>
      </section>
      <section aria-label="Count map">
        <h3 className="flv__title">Count map (first-seen order)</h3>
        {step.counts.length === 0 ? <p className="flv__empty">Empty so far.</p> : (
          <table className="flv__table">
            <thead><tr><th>value</th><th>count</th></tr></thead>
            <tbody>
              {step.counts.map(([value, count]) => (
                <tr key={value} className={step.value === value ? 'is-current' : ''}>
                  <td>{value}</td>
                  <td><span className="flv__bar" style={{ width: `${count * 22}px` }} />{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section aria-label="Result list">
        <h3 className="flv__title">Result list of counts</h3>
        <ol className="flv__row">
          {step.result.length === 0 ? <li className="flv__empty">No nodes yet.</li> : step.result.map((count, i) => (
            <li key={i} className="flv__node flv__node--result">{count}</li>
          ))}
        </ol>
        <p className="flv__note">{counted.size} distinct value{counted.size === 1 ? '' : 's'} seen so far.</p>
      </section>
    </div>
  )
}
