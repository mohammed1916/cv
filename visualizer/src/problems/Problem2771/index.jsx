import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Index 0', description: 'Either array starts a run of length 1.' },
    { id: 'step', label: 'Extend', description: 'Extend each source from the previous index when the values do not decrease.' },
    { id: 'done', label: 'Complete', description: 'Report the longest run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2 of equal length (JSON)',
  url: 'https://leetcode.com/problems/longest-non-decreasing-subarray-from-two-arrays/',
  complexity: 'O(n) time and O(n) space for the table. The visualization caps n at 10.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[2,3,1],"nums2":[1,2,1]}' },
    { label: 'Example 2', input: '{"nums1":[1,3,2,1],"nums2":[2,2,3,4]}' },
  ],
}

export default function LongestNonDecreasingFromTwo() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DPTable title="Longest run ending at each index" values={step.table} rowLabels={['from nums1', 'from nums2']}
      activeCell={step.phase === 'step' ? { row: 0, column: step.index } : null} />
    <output aria-label="Best">{`Index ${step.index}: best so far ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A run can switch sources at any index as long as the new value is not smaller than the value before it from the source it came from.</p>
    <p>For each index, the best run ending there from each source depends only on the two previous runs, so one pass is enough.</p>
  </>} />
}
