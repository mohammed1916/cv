import IndexedSequence from '../../components/shared/IndexedSequence'

// The array with the current window: l and r mark its ends, inside cells are the window.
export default function View({ run, step }) {
  const nums = run.input
  const { l, r } = step
  const has = l >= 0 && r >= 0
  return <div className="erasure-view">
    <IndexedSequence label="nums" length={nums.length} active={has ? r : -1}
      valueAt={i => nums[i]}
      roleAt={i => (!has || i < l || i > r ? '' : i === l && i === r ? 'l, r' : i === l ? 'l' : i === r ? 'r' : 'window')} />
    <dl>
      <dt>Window sum</dt><dd>{step.snapshot.sum}</dd>
      <dt>Best so far</dt><dd>{step.snapshot.best}</dd>
    </dl>
    <p>{step.message}</p>
  </div>
}
