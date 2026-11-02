import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
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
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Minimums">{`min(nums1) = ${step.min1}, min(nums2) = ${step.min2}`}</output>
    <output aria-label="Added integer">{step.x === null ? 'x not yet known' : `x = ${step.x}`}</output>
  </>} renderReasoning={() => <>
    <p>If adding x to every value of nums1 gives nums2 as a multiset, the smallest value of nums1 plus x must be the smallest value of nums2.</p>
  </>} />
}
