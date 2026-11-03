import './MinimumIndexSumView.css'

// Two aligned rows: nums1 above, nums2 below. The current pair is joined by a labelled sum.
export default function MinimumIndexSumView({ run, step }) {
  if (!run || !step) return <section className="mis-view"><p className="mis-empty">Press Play to compare the two arrays.</p></section>
  const { nums1, nums2 } = run.input
  const firstIn2 = value => nums2.indexOf(value)
  const isRepeat = (values, index) => values.indexOf(values[index]) !== index
  const seenSet = new Set(step.seen)
  const answer = new Set(step.answer)

  const row = (label, values, activeIndex, pickIndex) => (
    <div className="mis-row" role="group" aria-label={`${label} values`}>
      <span className="mis-label">{label}</span>
      <div className="mis-cells">
        {values.map((value, index) => {
          const classes = ['mis-cell']
          if (index === activeIndex) classes.push('mis-cell--current')
          if (index === pickIndex) classes.push('mis-cell--partner')
          if (isRepeat(values, index)) classes.push('mis-cell--repeat')
          if (answer.has(value) && !isRepeat(values, index)) classes.push('mis-cell--answer')
          return (
            <div key={index} className={classes.join(' ')}>
              <span className="mis-value">{value}</span>
              <span className="mis-index">{index}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  const partnerValue = step.i >= 0 && step.j >= 0 ? nums1[step.i] : null
  return (
    <section className="mis-view" aria-label="Minimum index sum comparison">
      {row('nums1', nums1, step.i, -1)}
      {row('nums2', nums2, -1, step.j)}
      <div className="mis-readout">
        {step.i >= 0 && step.j >= 0 && partnerValue !== null
          ? <span>{`Value ${partnerValue}: ${step.i} + ${step.j} = ${step.total}`}</span>
          : <span>{step.i >= 0 ? `Value ${nums1[step.i]} at nums1[${step.i}] (${step.status})` : 'Each new value of nums1 is checked against the first positions in nums2.'}</span>}
        <span className="mis-best">{step.best === null ? 'best: none' : `best sum: ${step.best}`}</span>
      </div>
      <div className="mis-answer" aria-label="Answer so far">
        {[...answer].sort((a, b) => a - b).map(value => <span key={value} className="mis-chip">{value}</span>)}
        {answer.size === 0 ? <span className="mis-none">no answer yet</span> : null}
        <span className="mis-seen">{`${seenSet.size} distinct value${seenSet.size === 1 ? '' : 's'} handled`}</span>
      </div>
      <p className="mis-key">Gold: current position in nums1. Teal: first position in nums2. Dimmed: repeat. Violet: in the answer.</p>
    </section>
  )
}
