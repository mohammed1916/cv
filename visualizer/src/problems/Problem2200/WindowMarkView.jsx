import IndexedSequence from '../../components/shared/IndexedSequence'

// The current key index j sits inside the window [l, r] = [j - k, j + k]; marked indices are shaded in the role column.
export default function WindowMarkView({ run, step }) {
  const { nums, key, k } = run.input
  const roleAt = index => {
    if (step.j === index) return 'key here'
    if (step.l === index) return 'l'
    if (step.r === index) return 'r'
    return step.marked[index] ? 'marked' : ''
  }
  return (
    <div className="window-mark-view">
      <IndexedSequence label={`nums (key ${key}, distance ${k})`} length={nums.length} valueAt={index => nums[index]} active={step.j ?? -1} roleAt={roleAt} />
      {step.j >= 0 && <p>Window for index {step.j}: from {step.l} to {step.r}.</p>}
      <p>Marked so far: {step.marked.map((m, i) => (m ? i : null)).filter(i => i !== null).join(', ') || 'none'}</p>
    </div>
  )
}
