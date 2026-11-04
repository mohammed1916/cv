import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Minimums', description: 'Find the smallest value in each array.' },
    { id: 'done', label: 'Result', description: 'The difference is the added integer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2 (equal-length integer arrays)',
  url: 'https://leetcode.com/problems/find-the-integer-added-to-array-i/',
  complexity: 'O(n) time to find the two minimums.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[2,6,4],"nums2":[9,7,5]}' },
    { label: 'Example 2', input: '{"nums1":[10],"nums2":[5]}' },
  ],
}

export default function AddedIntegerI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const sorted1 = [...run.input.nums1].sort((a, b) => a - b)
    const sorted2 = [...run.input.nums2].sort((a, b) => a - b)
    const x = step.x
    const rows = sorted1.map((value, k) => ({
      'smallest first': k,
      'nums1 sorted': value,
      'nums1 plus x': x === null ? '—' : value + x,
      'nums2 sorted': sorted2[k],
    }))
    return <>
      <RecordStateTable label="Sorted arrays side by side" columns={['smallest first', 'nums1 sorted', 'nums1 plus x', 'nums2 sorted']} rows={rows} activeRow={0} />
      <output aria-label="Minimums">{`min(nums1) = ${step.min1}, min(nums2) = ${step.min2}`}</output>
      <output aria-label="Added integer">{x === null ? 'x not yet known' : `x = ${x}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>If adding x to every value of nums1 gives nums2 as a multiset, the smallest value of nums1 plus x must be the smallest value of nums2. Once sorted, the two columns line up one row at a time.</p>
  </>} />
}
