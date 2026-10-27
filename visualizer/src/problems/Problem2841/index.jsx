import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty window and no best sum.' },
    { id: 'add', label: 'Add', description: 'Enter the next value into the window and its tally.' },
    { id: 'remove', label: 'Remove', description: 'Drop the value that falls out of the length-k window.' },
    { id: 'check', label: 'Check', description: 'When the window has at least m distinct values, keep its sum if it is the best.' },
    { id: 'done', label: 'Complete', description: 'Report the largest qualifying sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums (1 to 40 values from 1 to 100), m and k, for example {"nums":[2,6,7,3,1,7],"m":3,"k":4}',
  url: 'https://leetcode.com/problems/maximum-sum-of-almost-unique-subarray/',
  complexity: 'O(n) time with a tally of the window. The visualization caps nums at 40 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,6,7,3,1,7],"m":3,"k":4}' },
    { label: 'No window', input: '{"nums":[1,2,1,2,1,2,1],"m":3,"k":3}' },
  ],
}

export default function AlmostUniqueSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.right}
      roleAt={index => (step.right >= 0 && step.left <= index && index <= step.right ? 'window' : '')} />
    <output aria-label="Window state">{`Window sum ${step.window}, distinct values ${step.distinct} (need ${run.input.m}). Best: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Every candidate is a window of exactly k values, so the window slides one step at a time.</p>
    <p>A tally of the window gives its distinct count in constant time per step, which decides whether its sum may be used.</p>
  </>} />
}
