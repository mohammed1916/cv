import './CounterView.css'

// The closure's stored value as a box. A call reads the box and returns it; then the box grows by one.
export default function CounterView({ view }) {
  const answers = view.answers || []
  return <section className="counter-view" aria-label="Counter state">
    <div className="counter-view__box">
      <span className="counter-view__label">Stored value</span>
      <strong className="counter-view__value">{view.current}</strong>
    </div>
    <ol className="counter-view__calls" role="list">
      {answers.length === 0 && <li className="counter-view__empty">No call has been made yet.</li>}
      {answers.map((value, index) => <li key={index} className={`counter-view__call${index === view.focus ? ' counter-view__call--current' : ''}`}>
        <span>{`call ${index + 1}`}</span><strong>{`returns ${value}`}</strong>
      </li>)}
    </ol>
    {view.summary && <p className="counter-view__note">{view.summary.startsWith('[') ? `Answers: ${view.summary}` : view.summary}</p>}
  </section>
}
