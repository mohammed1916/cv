import './DigitQueueView.css'

export default function DigitQueueView({ run, step }) {
  const { k, digit1, digit2 } = run.input
  const queue = step.queue ?? []
  const shown = queue.slice(0, 14)
  const rem = step.rem
  const fill = rem === null || rem === undefined ? 0 : Math.round((rem / k) * 100)
  const verdict = step.answer !== null && step.answer !== undefined
    ? (step.answer === -1 ? 'No answer' : `Answer ${step.answer}`)
    : step.phase === 'check' ? (rem === 0 && step.current > k ? 'Qualifies' : 'Rejected') : 'Searching'
  return (
    <section className="digit-queue" aria-label="Digit queue visual">
      <header className="digit-queue__head">
        <span className="digit-queue__pill">k = {k}</span>
        {[...new Set([digit1, digit2])].sort((a, b) => a - b).map(d => <span key={d} className="digit-queue__digit">{d}</span>)}
        <span className="digit-queue__verdict" data-state={verdict.startsWith('Answer') ? 'found' : verdict === 'Rejected' ? 'reject' : 'idle'}>{verdict}</span>
      </header>
      <div className="digit-queue__lane">
        <h4>Queue, smallest first</h4>
        <ol className="digit-queue__chips">
          {shown.map((v, i) => <li key={`${v}-${i}`} className={i === 0 ? 'is-front' : ''}>{v}</li>)}
          {queue.length > shown.length && <li className="digit-queue__more">+{queue.length - shown.length} more</li>}
          {queue.length === 0 && <li className="digit-queue__more">empty</li>}
        </ol>
      </div>
      <div className="digit-queue__current">
        <h4>Current number</h4>
        <strong aria-label="current number">{step.current ?? '-'}</strong>
        <div className="digit-queue__meter" role="img" aria-label={rem === null || rem === undefined ? 'No remainder yet' : `Remainder ${rem} of ${k}`}>
          <span style={{ width: `${fill}%` }} />
        </div>
        <p>{rem === null || rem === undefined ? 'Remainder not computed yet.' : `${step.current} mod ${k} = ${rem}`}</p>
        <p>{step.current !== null && step.current !== undefined && step.current <= k && step.current !== -1 ? 'Too small: it must be above k.' : ''}</p>
      </div>
      {step.children?.length > 0 && (
        <div className="digit-queue__children" aria-label="Appended numbers">
          <h4>Appended to the back</h4>
          <ul>{step.children.map(v => <li key={v}>{v}</li>)}</ul>
        </div>
      )}
    </section>
  )
}
