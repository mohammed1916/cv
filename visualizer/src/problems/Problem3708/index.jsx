import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Any two neighbours start a run of length 2.' },
    { id: 'extend', label: 'Extend', description: 'The value is the sum of the two before it, so the run grows.' },
    { id: 'reset', label: 'Restart', description: 'The value breaks the pattern, so the run restarts at 2.' },
    { id: 'compare', label: 'Compare', description: 'Keep the longest run seen.' },
    { id: 'done', label: 'Complete', description: 'Report the longest run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums, for example {"nums":[1,1,1,1,2,3,5,1]}',
  url: 'https://leetcode.com/problems/longest-fibonacci-subarray/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,1,1,1,2,3,5,1]}' },
    { label: 'Example 2', input: '{"nums":[5,2,7,9,16]}' },
  ],
}

export default function LongestFibonacciSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} roleAt={index => (index <= step.index && index >= step.index - step.run + 1 && step.run > 2 ? 'run' : '')} />
    <output aria-label="Run">{`Current run: ${step.run}, best: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A run is a contiguous stretch where each value equals the sum of the two values before it. Any two neighbours always form a run of length 2.</p>
    <p>Scanning left to right, the run grows when the pattern continues and restarts at 2 when it breaks, so one pass finds the longest run.</p>
  </>} />
}
