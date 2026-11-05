import IndexedSequence from '../../components/shared/IndexedSequence'

// i and j are drawn as pointers over the array; the current pair is compared by value and by i * j.
export default function PairScanView({ run, step }) {
  const { nums, k } = run.input
  const roleAt = index => (step.i === index ? 'i' : step.j === index ? 'j' : '')
  return (
    <div className="pair-scan-view">
      <IndexedSequence label="nums" length={nums.length} valueAt={index => nums[index]} active={step.j >= 0 ? step.j : -1} roleAt={roleAt} />
      {step.i >= 0 && <p>Pair (i, j) = ({step.i}, {step.j}): values {nums[step.i]} and {nums[step.j]}; i * j = {step.i * step.j}, which {step.divisible ? 'is' : 'is not'} divisible by k = {k}.</p>}
      <p>Pairs counted so far: <strong>{step.ans}</strong></p>
    </div>
  )
}
