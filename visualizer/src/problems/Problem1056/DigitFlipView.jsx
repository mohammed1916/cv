import './DigitFlipView.css'

export default function DigitFlipView({ run, step }) {
  const digits = run.input.toString().split('')
  const flipped = step.flipped
  const failing = step.phase === 'reject'
  return (
    <figure className="dfv" aria-label="Digits of the number rotated 180 degrees, read from the last digit">
      <div className="dfv__row">
        <span className="dfv__label">number</span>
        <div className="dfv__tiles">
          {digits.map((digit, index) => {
            const isCurrent = index === step.current
            const isDone = flipped[index] !== null
            return (
              <span key={index} className={`dfv__tile${isCurrent ? ' dfv__tile--current' : ''}${isDone ? ' dfv__tile--done' : ''}${isCurrent && failing ? ' dfv__tile--bad' : ''}`}>
                {digit}
                {isCurrent && failing && <i aria-hidden="true"> ✕</i>}
              </span>
            )
          })}
        </div>
      </div>
      <div className="dfv__row">
        <span className="dfv__label">rotated</span>
        <div className="dfv__tiles">
          {digits.map((_, index) => (
            <span key={index} className={`dfv__tile dfv__tile--out${flipped[index] === null ? ' dfv__tile--empty' : ''}`}>
              {flipped[index] === null ? '·' : flipped[index]}
            </span>
          ))}
        </div>
      </div>
      <p className="dfv__value" role="status">
        Rotated so far: {step.processed ? step.rotated : 0}
        {step.verdict !== null && (step.verdict ? ' · differs from the number: confusing' : ' · not confusing')}
      </p>
      <p className="dfv__rule">Allowed: 0→0, 1→1, 6→9, 8→8, 9→6. Read from the last digit, so each rotated digit lands in the mirrored position.</p>
    </figure>
  )
}
