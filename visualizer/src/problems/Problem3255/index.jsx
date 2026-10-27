import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty run.' },
    { id: 'scan', label: 'Scan', description: 'Extend the run when the value is exactly one more than the value before, or restart it.' },
    { id: 'record', label: 'Record', description: 'Once a window is full, its power is the last value if the run is at least k.' },
    { id: 'done', label: 'Complete', description: 'Report the power of every window.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (1 to 40 values from 1 to 50) and k, for example {"nums":[1,2,3,4,3,2,5],"k":3}',
  url: 'https://leetcode.com/problems/find-the-power-of-k-size-subarrays-ii/',
  complexity: 'O(n) time with one run counter. The visualization caps nums at 40 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4,3,2,5],"k":3}' },
    { label: 'Example 2', input: '{"nums":[2,2,2,2,2],"k":4}' },
  ],
}

export default function PowerOfKSubarraysII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.at}
      roleAt={index => (step.run > 0 && step.at >= 0 && index <= step.at && index > step.at - step.run ? 'run' : '')} />
    <output aria-label="Run state">{`Current run length: ${step.run}, need ${run.input.k}. Powers so far: [${step.results.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>A window is a run only when every step rises by exactly one, so the run that ends at each position is enough to decide every window that ends there.</p>
    <p>One pass keeps the current run length, so the work per position is constant instead of checking each window again.</p>
  </>} />
}
