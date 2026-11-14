import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'prefix', label: 'Prefix sums', description: 'Turn the values into running totals so any window sum is a subtraction.' },
    { id: 'start', label: 'Start', description: 'Set the allowed lengths and an empty running minimum.' },
    { id: 'window', label: 'Window', description: 'Check one window [left, right): its length, then its sum.' },
    { id: 'better', label: 'Better', description: 'A positive sum in range that beats the running minimum.' },
    { id: 'done', label: 'Result', description: 'Report the smallest positive sum, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, l and r',
  url: 'https://leetcode.com/problems/minimum-positive-sum-subarray/',
  complexity: 'O(n^2) time for every window, O(n) extra space for the prefix sums.',
  examples: [
    { label: 'Mixed signs', input: '{"nums":[5,-3,2,-1,4],"l":2,"r":3}' },
    { label: 'No positive sum', input: '{"nums":[-2,2,-3,1],"l":2,"r":3}' },
    { label: 'Single negative value', input: '{"nums":[-4],"l":1,"r":1}' },
    { label: 'Equal values across the range', input: '{"nums":[3,3,3,3],"l":1,"r":4}' },
    { label: 'Extremes alternate', input: '{"nums":[-100,100,-100,100,-100,100,-100,100,-100,100,-100,100],"l":1,"r":12}' },
    { label: 'Long run: 12 values', input: '{"nums":[91,-90,90,-100,40,-15,-51,87,-30,-95,58,-19],"l":3,"r":11}' },
  ],
}

export default function MinimumPositiveSumSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [left, right] = step.window || [-1, -1]
    const prefix = run.prefix
    const roleFor = i => {
      if (!step.window) return ''
      if (i === left) return 'left'
      if (i === right) return 'right'
      return ''
    }
    const outcome = !step.window ? '-'
      : !step.inRange ? 'length outside range'
      : step.positive ? 'length ok, sum positive' : 'length ok, sum not positive'
    return <>
      <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
        active={left} roleAt={i => (step.window && i >= left && i < right ? 'window' : '')} />
      <IndexedSequence label="prefix sums" length={prefix.length} valueAt={i => prefix[i]}
        active={right} roleAt={roleFor} />
      <dl className="algorithm-stats" aria-label="Window check">
        <div><dt>Allowed length</dt><dd>{`${run.input.l} to ${run.input.r}`}</dd></div>
        <div><dt>Window length</dt><dd>{step.length ?? '-'}</dd></div>
        <div><dt>Window sum</dt><dd>{step.total ?? '-'}</dd></div>
        <div><dt>Running minimum</dt><dd>{step.best === -1 ? 'none yet' : step.best}</dd></div>
        <div><dt>Check</dt><dd>{outcome}</dd></div>
      </dl>
      <output aria-label="Step explanation">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Prefix sums turn each window into one subtraction: the window [left, right) sums to prefix[right] - prefix[left].</p>
    <p>A window counts only if its length is between l and r and its sum is positive. The smallest counted sum is kept; if none counts, the answer is -1.</p>
  </>} />
}
