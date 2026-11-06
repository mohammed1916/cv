import PointerRail from '../../components/shared/PointerRail'
import './MaxRangeView.css'

// Bars show each value. The active index brackets the range where it stays a maximum, between the boundary greater values.
export default function MaxRangeView({ run, step }) {
  const nums = run.input
  const top = Math.max(...nums, 1)
  const i = step.index
  const lo = i >= 0 ? step.left[i] + 1 : -1
  const hi = i >= 0 ? step.right[i] - 1 : -1
  return <div className="max-range">
    <div className="max-range__bars" role="list" aria-label="Values">
      {nums.map((v, j) => {
        const inRange = i >= 0 && j >= lo && j <= hi && step.phase !== 'left'
        const classes = ['max-range__bar']
        if (j === i) classes.push('is-active')
        if (inRange) classes.push('is-inside')
        if (step.stack.includes(j)) classes.push('is-stacked')
        if (step.popped === j) classes.push('is-popped')
        return <div key={j} role="listitem" className={classes.join(' ')} aria-label={`index ${j} value ${v}`}>
          <div className="max-range__fill" style={{ height: `${(v / top) * 100}%` }}><span>{v}</span></div>
          <small>{j}</small>
          {step.left[j] >= 0 && step.phase !== 'left' && <em className="max-range__mark max-range__mark--left">L{step.left[j]}</em>}
          {step.right[j] < nums.length && step.phase === 'answer' && <em className="max-range__mark max-range__mark--right">R{step.right[j]}</em>}
        </div>
      })}
    </div>
    <div className="max-range__stack" aria-label="Monotonic stack">
      <span>Stack (bottom to top):</span>
      {step.stack.length ? step.stack.map((j, k) => <b key={`${j}-${k}`}>{j}</b>) : <i>empty</i>}
    </div>
    {step.answer && <p className="max-range__answer" aria-label="Range lengths so far">Lengths: {step.answer.join(', ')}</p>}
    <PointerRail
      title="Pointers on the array"
      values={nums}
      pointers={i >= 0 ? [
        { id: 'i', label: 'i', index: i, tone: 'primary' },
        ...(step.left[i] >= 0 ? [{ id: 'L', label: 'L', index: step.left[i], tone: 'warning' }] : []),
        ...(step.right[i] < nums.length ? [{ id: 'R', label: 'R', index: step.right[i], tone: 'warning' }] : []),
      ] : []}
      note="i is the index being measured. L and R are the nearest strictly greater values found so far."
    />
    <p className="max-range__legend">Teal bars are inside the active index&apos;s range. Index labels sit under each bar; L and R show the boundary indices found so far.</p>
    <output aria-label="Pass state">{step.phase === 'answer' || step.phase === 'done' ? 'Ranges are complete' : `${step.phase === 'right' ? 'Right' : 'Left'} pass${i >= 0 ? `, index ${i}` : ''}`}</output>
  </div>
}
