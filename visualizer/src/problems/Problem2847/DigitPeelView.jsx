import './DigitPeelView.css'

// The remaining value is shown as a stack of factor tiles. Each digit taken off appears in the digit row.
export default function DigitPeelView({ run, step }) {
  return <div className="digit-peel">
    <div className="digit-peel__remaining" aria-label="Remaining value">
      <span>Remaining</span>
      <strong>{step.remaining}</strong>
    </div>
    <div className="digit-peel__tries" role="list" aria-label="Digits tried from 9 down to 2">
      {[9, 8, 7, 6, 5, 4, 3, 2].map(d => <span key={d} role="listitem"
        className={`digit-peel__try${step.divisor === d ? ' is-active' : ''}${step.divisor === d && step.remaining % d === 0 ? ' is-divides' : ''}`}>{d}</span>)}
    </div>
    <div className="digit-peel__digits" aria-label="Digits collected">
      <span>Digits:</span>
      {step.digits.length ? step.digits.map((d, i) => <b key={i}>{d}</b>) : <i>none yet</i>}
    </div>
    {step.result !== undefined && <p className="digit-peel__result" aria-label="Result">Result: {step.result}</p>}
    <p className="digit-peel__legend">Teal digits divide the remaining value. Once only 1 remains, the sorted digits form the answer; any other leftover means -1.</p>
    <output>{`${step.message}`}</output>
  </div>
}
