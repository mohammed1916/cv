import './SubsetSumStrip.css'

export default function SubsetSumStrip({ run, step }) {
  const bits = Math.max(1, step.total.toString(2).length)
  const resultBits = (step.result ?? 0).toString(2).padStart(bits, '0')
  return (
    <div className="ss-view">
      <p className="ss-rule">
        Numbers: [{run.input.nums.join(', ')}]. A cell is lit when some subsequence adds to that sum.
        {step.x >= 0 ? ` Current number x = ${step.x}.` : ''}
      </p>
      <div className="ss-strip" role="list" aria-label="Reachable subsequence sums">
        {step.reach.map((on, sum) => {
          const role = sum === step.marked ? 'marked' : sum === step.s ? 'checking' : sum === step.folded ? 'folded' : on ? 'on' : 'off'
          return (
            <div key={sum} role="listitem" className={`ss-cell ss-cell--${role}`} data-state={role}>
              <span className="ss-cell__sum">{sum}</span>
              <span className="ss-cell__mark" aria-hidden="true">{on ? '1' : '0'}</span>
            </div>
          )
        })}
      </div>
      <div className="ss-bits" aria-label="Result bits">
        <span className="ss-bits__title">Result bits</span>
        {[...resultBits].map((bit, i) => (
          <span key={i} className={`ss-bit${bit === '1' ? ' ss-bit--set' : ''}`}>{bit}</span>
        ))}
        <output className="ss-bits__value" aria-label="Running OR">= {step.result}</output>
      </div>
    </div>
  )
}
