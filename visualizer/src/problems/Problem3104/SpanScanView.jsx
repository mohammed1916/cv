import './SpanScanView.css'

export default function SpanScanView({ run, step }) {
  const s = run.input
  const n = s.length
  const first = {}
  const last = {}
  for (let i = 0; i < n; i++) {
    if (first[s[i]] === undefined) first[s[i]] = i
    last[s[i]] = i
  }
  const [lo, hi] = step.span || [-1, -1]
  return (
    <div className="ssv">
      <ol className="ssv__cells" aria-label="Characters of the string">
        {[...s].map((ch, i) => {
          const inside = lo >= 0 && i >= lo && i <= hi
          const isStart = i === step.l
          const isEnd = i === step.k
          return (
            <li key={i} className={`ssv__cell${inside ? ' is-inside' : ''}${isEnd ? ' is-end' : ''}${isStart ? ' is-start' : ''}`}>
              <span className="ssv__pos">{i}</span>
              <span className="ssv__ch">{ch}</span>
              <span className="ssv__mark">{isStart ? 'l' : ''}{isEnd && !isStart ? 'k' : ''}{isEnd && isStart ? ' l,k' : ''}</span>
            </li>
          )
        })}
      </ol>
      <table className="ssv__table">
        <thead><tr><th>letter</th><th>first</th><th>last</th></tr></thead>
        <tbody>
          {Object.keys(first).sort().map(ch => (
            <tr key={ch} className={step.l >= 0 && s[step.l] === ch ? 'is-start-letter' : ''}>
              <td>{ch}</td><td>{first[ch]}</td><td>{last[ch]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="ssv__status" role="status">
        {step.r >= 0 ? `r = ${step.r}. ` : ''}{step.message} Best so far: {step.best}.
      </p>
    </div>
  )
}
