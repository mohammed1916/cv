import './DecompView.css'

// Digits as tiles with the block under test, beside the reach table reach[i][twos].
export default function DecompView({ run, step }) {
  const { s } = run.input
  const span = step.i >= 0 && step.length > 0 ? { from: step.i, to: step.i + step.length } : null
  const tileClass = index => {
    if (!span || index < span.from || index >= span.to) return 'decomp-digit'
    if (step.ok === true) return 'decomp-digit decomp-digit--ok'
    if (step.ok === false) return 'decomp-digit decomp-digit--bad'
    return 'decomp-digit decomp-digit--span'
  }
  return (
    <div className="decomp-view">
      <div className="decomp-digits" aria-label="Digits">
        {[...s].map((digit, index) => <span key={index} className={tileClass(index)}>{digit}</span>)}
      </div>
      <p className="decomp-caption">
        {span ? `Testing block s[${span.from}..${span.to - 1}] with ${step.twos} length-2 block(s) used before it.` : 'Scanning reachable prefixes.'}
      </p>
      <table className="decomp-table" aria-label="Reachable prefixes">
        <thead><tr><th>prefix length</th><th>0 length-2 blocks</th><th>1 length-2 block</th></tr></thead>
        <tbody>
          {step.reach.map((row, i) => (
            <tr key={i} className={step.i === i || (step.i >= 0 && span && i === span.from) ? 'is-current' : ''}>
              <th>{i}</th>
              <td>{row[0] ? 'reachable' : '·'}</td>
              <td>{row[1] ? 'reachable' : '·'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
