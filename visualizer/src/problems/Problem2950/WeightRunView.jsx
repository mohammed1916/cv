import './WeightRunView.css'

export default function WeightRunView({ run, step }) {
  const { word } = run.input
  const KEYPAD = ['ab', 'cde', 'fgh', 'ijk', 'lmn', 'opq', 'rst', 'uvw', 'xyz']
  const weightOf = ch => KEYPAD.findIndex(group => group.includes(ch)) + 1
  const seen = new Map(step.seen ?? [])
  return (
    <div className="weight-run-view">
      <p className="weight-rule">Each letter has a keypad weight from 1 to 9. A substring is divisible when its average weight is a whole number, so each average q is checked separately with weight minus q.</p>
      <table className="weight-table">
        <caption>Letters with weights{step.q ? `, average q = ${step.q}` : ''}</caption>
        <thead>
          <tr>
            <th scope="col">letter</th>
            {[...word].map((ch, i) => <th key={i} scope="col" className={i === step.index ? 'is-current' : ''}>{ch}</th>)}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">weight</th>
            {[...word].map((ch, i) => <td key={i} className={i === step.index ? 'is-current' : ''}>{weightOf(ch)}</td>)}
          </tr>
          <tr>
            <th scope="row">weight minus q</th>
            {[...word].map((ch, i) => <td key={i} className={i === step.index ? 'is-current' : ''}>{step.q ? weightOf(ch) - step.q : '-'}</td>)}
          </tr>
          <tr>
            <th scope="row">running</th>
            {[...word].map((ch, i) => <td key={i} className={i === step.index ? 'is-current' : ''}>{step.index >= i ? (i === step.index ? step.running : '') : ''}</td>)}
          </tr>
        </tbody>
      </table>
      <dl className="weight-facts">
        <div><dt>Average q</dt><dd>{step.q || 'none'}</dd></div>
        <div><dt>Earlier equal values</dt><dd>{step.add ?? '-'}</dd></div>
        <div><dt>Total so far</dt><dd>{step.total}</dd></div>
      </dl>
      <div className="weight-seen" aria-label="Running values seen so far">
        <span className="weight-seen-label">Seen counts</span>
        <ul>
          {[...seen].sort((a, b) => a[0] - b[0]).map(([value, count]) => (
            <li key={value} className={value === step.running ? 'is-current' : ''}>{value}: {count}</li>
          ))}
        </ul>
      </div>
      <output className="weight-message" aria-label="Run status">{step.message}</output>
    </div>
  )
}
