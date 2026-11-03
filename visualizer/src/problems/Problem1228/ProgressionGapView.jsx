import './ProgressionGapView.css'

export default function ProgressionGapView({ run, step }) {
  const arr = run.input
  const slots = arr.length + 1
  const first = arr[0]
  const stepValue = step.step ?? (arr[arr.length - 1] - arr[0]) / arr.length
  const expectedValues = Array.from({ length: slots }, (_, k) => first + k * stepValue)
  const inRange = index => step.lo >= 0 && index >= step.lo && index <= step.hi
  return <div className="gap-view">
    <section aria-label="Array values">
      <p className="gap-view__label">array (remaining terms)</p>
      <ol className="gap-view__row">
        {arr.map((value, index) => <li key={index}
          className={['gap-view__cell', index === step.mid ? 'is-mid' : '', inRange(index) ? 'in-bracket' : ''].join(' ').trim()}>
          <span>{value}</span><small>{index}</small>
        </li>)}
      </ol>
    </section>
    <section aria-label="Progression slots">
      <p className="gap-view__label">progression with {slots} terms, step {stepValue}</p>
      <ol className="gap-view__row">
        {expectedValues.map((value, k) => {
          const present = arr.includes(value)
          const classes = ['gap-view__cell', present ? 'is-present' : 'is-missing']
          if (step.missing !== null && value === step.missing) classes.push('is-answer')
          return <li key={k} className={classes.join(' ')}>
            <span>{present ? value : '?'}</span><small>{value}</small>
          </li>
        })}
      </ol>
    </section>
    <output aria-label="Binary search state">
      {step.lo >= 0 ? `lo ${step.lo} · hi ${step.hi}${step.mid >= 0 ? ` · mid ${step.mid}` : ''}` : 'Not searching yet'}
      {step.missing !== null ? ` · missing ${step.missing}` : ''}
    </output>
  </div>
}
