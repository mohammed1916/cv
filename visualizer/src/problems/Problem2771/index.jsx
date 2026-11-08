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
    { label: 'Three pairs, no ties', input: '{"nums1":[5,1,6],"nums2":[2,4,1]}' },
    { label: 'Six pairs with repeats', input: '{"nums1":[9,9,4,1,7,3],"nums2":[9,2,4,1,8,3]}' },
    { label: 'Single pair', input: '{"nums1":[1],"nums2":[1]}' },
    { label: 'Equal values in both arrays', input: '{"nums1":[4,4,4],"nums2":[4,4,4]}' },
    { label: 'Boundary: values 20 and 1', input: '{"nums1":[20,1,20,1,20,1,20,1,20,1],"nums2":[1,20,1,20,1,20,1,20,1,20]}' },
    { label: 'Long run: 10 pairs', input: '{"nums1":[4,14,6,3,4,8,8,1,8,18],"nums2":[16,13,2,18,14,18,7,2,10,16]}' },
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
