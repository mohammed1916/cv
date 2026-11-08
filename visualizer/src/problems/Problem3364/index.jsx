import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No positive sum has been found yet.' },
    { id: 'window', label: 'Window', description: 'Sum one window of the allowed lengths.' },
    { id: 'better', label: 'Better', description: 'This positive sum is the smallest so far.' },
    { id: 'done', label: 'Result', description: 'Report the smallest positive sum, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, l and r',
  url: 'https://leetcode.com/problems/minimum-positive-sum-subarray/',
  complexity: 'O(n * r) time for the sums of every allowed window, with O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '{"nums":[5,-3,2,-1,4],"l":2,"r":3}' },
    { label: 'No positive sum', input: '{"nums":[-2,2,-3,1],"l":2,"r":3}' },
    { label: 'Single negative value', input: '{"nums":[-4],"l":1,"r":1}' },
    { label: 'Equal values across the range', input: '{"nums":[3,3,3,3],"l":1,"r":4}' },
    { label: 'Extremes alternate', input: '{"nums":[-100,100,-100,100,-100,100,-100,100,-100,100,-100,100],"l":1,"r":12}' },
    { label: 'Long run: 12 values', input: '{"nums":[91,-90,90,-100,40,-15,-51,87,-30,-95,58,-19],"l":3,"r":11}' },
  ],
}

export default function MinimumPositiveSumSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={step.window ? step.window[0] : -1}
      roleAt={i => (step.window && i === step.window[0] ? 'l' : step.window && i === step.window[1] - 1 ? 'r' : step.window && i > step.window[0] && i < step.window[1] - 1 ? 'window' : '')} />
    <output aria-label="Best positive sum">{`best: ${step.best === -1 ? 'none yet' : step.best}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Every window whose length is allowed is summed once.</p>
    <p>Only positive sums compete, and the smallest of them is kept. If none is positive, the answer is -1.</p>
  </>} />
}
