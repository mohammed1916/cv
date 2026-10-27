import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'check', label: 'Check', description: 'Look at each neighbouring pair in the window: each must rise by exactly one.' },
    { id: 'record', label: 'Record', description: 'Keep the largest value when the run holds, or -1 otherwise.' },
    { id: 'done', label: 'Complete', description: 'Report the power of every window.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (1 to 40 values from 1 to 50) and k, for example {"nums":[1,2,3,4,3,2,5],"k":3}',
  url: 'https://leetcode.com/problems/find-the-power-of-k-size-subarrays-i/',
  complexity: 'O(n * k) time by checking every window. The visualization caps nums at 40 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4,3,2,5],"k":3}' },
    { label: 'Example 3', input: '{"nums":[3,2,3,2,3,2],"k":2}' },
  ],
}

export default function PowerOfKSubarraysI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.right}
      roleAt={index => (step.right >= 0 && step.left <= index && index <= step.right ? 'window' : '')} />
    <output aria-label="Powers">{`Window check: ${step.run === null ? 'done' : step.run ? 'run holds' : 'run breaks'}. Powers so far: [${step.results.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>A window has power equal to its maximum only when it is a run of consecutive integers in increasing order; otherwise the power is -1.</p>
    <p>For such a window the maximum is simply its last value, so checking each neighbouring pair is enough.</p>
  </>} />
}
