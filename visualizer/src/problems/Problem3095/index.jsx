import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No subarray has been checked yet.' },
    { id: 'start-index', label: 'Start index', description: 'Begin growing subarrays at this index.' },
    { id: 'extend', label: 'Extend', description: 'Include the next value and update the OR.' },
    { id: 'hit', label: 'Reaches k', description: 'The OR is at least k, so this length is a candidate.' },
    { id: 'done', label: 'Complete', description: 'Report the shortest length, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 30 values, 0 to 255) and k (1 to 255), e.g. {"nums":[1,2,3],"k":2}',
  url: 'https://leetcode.com/problems/shortest-subarray-with-or-at-least-k-i/',
  complexity: 'O(n^2) time and O(1) space. The visualization caps the input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3],"k":2}' },
    { label: 'Example 2', input: '{"nums":[2,1,8],"k":10}' },
  ],
}

export default function ShortestSubarrayOrI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const roleOf = i => (step.start <= i && i <= step.end ? 'subarray' : '')
    return <>
      <IndexedSequence label="Values" length={nums.length} valueAt={i => nums[i]} active={Math.max(step.end, step.start, 0)} roleAt={roleOf} />
      <output aria-label="Subarray OR">{`Subarray ${step.start}-${step.end}, OR ${step.or}, target k ${run.input.k}, best ${step.best ?? 'none'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each start index grows its subarray one value at a time. The OR never decreases as the subarray grows, so the first end that reaches k is the shortest for that start.</p>
    <p>Comparing those lengths over all starts gives the answer.</p>
  </>} />
}
