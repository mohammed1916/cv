import IndexedSequence from '../../components/shared/IndexedSequence'

// The array with the query window marked: l and r are the ends, inside cells are the window.
export default function View({ run, step }) {
  const { nums } = run.input
  const { l, r } = step
  const hasWindow = l >= 0 && r >= 0
  const part = step.snapshot.part ?? []
  return <div className="arithmetic-view">
    <IndexedSequence label="Array nums" length={nums.length} active={hasWindow ? l : -1}
      valueAt={i => nums[i]}
      roleAt={i => (!hasWindow ? '' : i === l ? 'l' : i === r ? 'r' : i > l && i < r ? 'window' : '')} />
    {part.length > 0 && <IndexedSequence label="Sorted copy of the slice" length={part.length} active={step.phase === 'check' ? 1 : -1}
      valueAt={i => part[i]} roleAt={i => (i > 0 ? `gap ${part[i] - part[i - 1]}` : '')} />}
    <p>{step.phase === 'done' ? `Answers: ${run.result.join(', ')}` : step.message}</p>
  </div>
}
