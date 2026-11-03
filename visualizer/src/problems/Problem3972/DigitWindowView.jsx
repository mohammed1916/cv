import './DigitWindowView.css'

export default function DigitWindowView({ run, step }) {
  const { nums, x } = run.input
  const hasWindow = step.start !== null && step.end !== null
  const text = step.total === null || step.total === undefined ? '' : String(step.total)
  const first = text ? text[0] : '-'
  const last = text ? text[text.length - 1] : '-'
  const positive = step.total !== null && step.total > 0
  return (
    <figure className="digit-window" aria-label="Subarray window and digit check">
      <ol className="digit-window__row">
        {nums.map((v, i) => {
          const inside = hasWindow && i >= step.start && i <= step.end
          const cls = ['digit-window__cell', inside ? 'is-inside' : '', inside && i === step.start ? 'is-start' : '', inside && i === step.end ? 'is-end' : ''].filter(Boolean).join(' ')
          return <li key={i} className={cls}><span>{v}</span><small>{i}</small></li>
        })}
      </ol>
      <dl className="digit-window__check">
        <div><dt>Window sum</dt><dd>{step.total ?? '-'}</dd></div>
        <div><dt>First digit</dt><dd>{positive ? first : '-'}</dd></div>
        <div><dt>Last digit</dt><dd>{positive ? last : '-'}</dd></div>
        <div><dt>Target x</dt><dd>{x}</dd></div>
        <div><dt>Count</dt><dd>{step.count}</dd></div>
      </dl>
      <p className="digit-window__note">{step.phase === 'match' ? 'Both digits equal x.' : step.phase === 'miss' ? 'Not counted.' : ''}</p>
    </figure>
  )
}
