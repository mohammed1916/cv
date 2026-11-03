import './RangeLetterView.css'

export default function RangeLetterView({ run, step }) {
  const { s, queries } = run.input
  const [l, r] = step.range ?? [-1, -1]
  const inRange = i => i >= l && i <= r && l >= 0
  const letters = [...new Set(s)].sort()
  return (
    <div className="range-letter-view">
      <p className="range-rule">Only the letters that sit inside the range count. A letter that appears c times gives c times (c + 1) over 2 same-end substrings.</p>
      <ol className="range-strip" aria-label="String positions">
        {[...s].map((ch, i) => (
          <li key={i} className={`range-cell${inRange(i) ? ' is-inside' : ''}${step.letter === ch && inRange(i) ? ' is-counted' : ''}`}>
            <span className="range-index">{i}</span>
            <strong>{ch}</strong>
          </li>
        ))}
      </ol>
      <table className="range-table">
        <caption>Letters in the current range</caption>
        <thead><tr><th scope="col">letter</th><th scope="col">count</th><th scope="col">pairs</th></tr></thead>
        <tbody>
          {letters.map(c => {
            const current = step.letter === c
            const count = current ? step.count : null
            return (
              <tr key={c} className={current ? 'is-current' : ''}>
                <th scope="row">{c}</th>
                <td>{count ?? '-'}</td>
                <td>{current ? step.pairs : '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="range-answer">Query {step.query >= 0 ? step.query + 1 : '-'} of {queries.length}: running answer {step.answer ?? '-'}</p>
      <ul className="range-answers" aria-label="Answers so far">
        {step.answers.map((a, i) => <li key={i}>Query {i + 1}: {a}</li>)}
      </ul>
      <output className="range-message" aria-label="Range status">{step.message}</output>
    </div>
  )
}
