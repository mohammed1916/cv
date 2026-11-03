import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Count the copies of k already present.' },
    { id: 'try', label: 'Try a value', description: 'Find the block that helps one value most.' },
    { id: 'done', label: 'Result', description: 'Report the best frequency of k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers from 1 to 9) and k (1 to 9)',
  url: 'https://leetcode.com/problems/maximum-frequency-after-subarray-operation/description/',
  complexity: 'O(n * d) time for n values with d distinct values. The visualization caps nums at 12 values.',
  examples: [
    { label: 'Invented row', input: JSON.stringify({ nums: [4, 8, 4, 2, 7, 4], k: 4 }) },
    { label: 'Repeated k', input: JSON.stringify({ nums: [9, 3, 9, 6, 3, 3], k: 9 }) },
  ],
}

export default function MaximumFrequencyAfterSubarrayOperation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      roleAt={i => (step.at >= 0 && i >= step.at && i <= step.end ? 'window' : '')} />
    <output aria-label="Frequency check">{`value ${step.value ?? '-'} lands on ${run.input.k}; block ${step.at >= 0 ? `${step.at}..${step.end}` : 'none'}; frequency ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Only one shift is allowed, so every element in the chosen block moves by the same amount. A value v in the block lands on k exactly when the shift is k minus v.</p>
    <p>Copies of v inside the block gain a match, while copies of k inside the block are pushed away. The best block maximises that difference.</p>
  </>} />
}
