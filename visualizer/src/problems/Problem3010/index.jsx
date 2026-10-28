import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'first', label: 'First', description: 'The first subarray starts at position 0.' },
    { id: 'pick', label: 'Pick', description: 'Start another subarray at one of the two smallest later values.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum total cost.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of 3 to 12 integers from 1 to 50 (JSON)',
  url: 'https://leetcode.com/problems/divide-an-array-into-subarrays-with-minimum-cost-i/',
  complexity: 'O(n log n) with the sort. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '[1,2,3,12]' },
    { label: 'Example 2', input: '[10,3,1,1]' },
  ],
}

export default function MinimumCostSplit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.length} valueAt={i => run.input[i]}
      roleAt={i => (step.picked.includes(i) ? 'subarray start' : '')} />
    <output aria-label="Total cost so far">{`Total cost so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each subarray pays only its first value, and the first subarray must start at position 0.</p>
    <p>The other two subarrays should start at the two smallest values after position 0, placed in order.</p>
  </>} />
}
