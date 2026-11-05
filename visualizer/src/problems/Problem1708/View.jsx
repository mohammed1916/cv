import IndexedSequence from '../../components/shared/IndexedSequence'

// The array with the current candidate window (k cells) and the best window so far.
export default function View({ run, step }) {
  const { nums, k } = run.input
  const cur = step.start
  const best = step.snapshot.best
  const inWindow = (i, start) => i >= start && i < start + k
  return <div className="largest-subarray-view">
    <IndexedSequence label="nums" length={nums.length} active={cur}
      valueAt={i => nums[i]}
      roleAt={i => (inWindow(i, best) && inWindow(i, cur) ? 'best and current' : inWindow(i, best) ? 'best' : inWindow(i, cur) ? 'candidate' : '')} />
    <p>Best start so far: index {best}; window length {k}.</p>
    <p>{step.message}</p>
  </div>
}
