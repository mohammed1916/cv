import IndexedSequence from '../../components/shared/IndexedSequence'

// Scores dp with the window of the last k positions shaded; the deque holds the candidates.
export default function View({ run, step }) {
  const { nums, k } = run.input
  const dp = step.snapshot.dp
  const window = step.snapshot.window ?? []
  const [lo, hi] = window
  const inWindow = i => lo !== undefined && i >= lo && i <= hi
  return <div className="jump-game-view">
    <IndexedSequence label="nums" length={nums.length} active={step.i}
      valueAt={i => nums[i]} roleAt={i => (inWindow(i) ? 'window' : '')} />
    <IndexedSequence label={`Best score ending at each index (window size ${k})`} length={dp.length} active={step.i}
      valueAt={i => (i <= step.i ? dp[i] : '…')} roleAt={i => (inWindow(i) ? 'window' : '')} />
    <p>Deque (candidates, best at front): [{step.snapshot.deque.join(', ')}]</p>
    <p>{step.message}</p>
  </div>
}
