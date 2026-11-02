import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Sort nums2 as the target.' },
    { id: 'try', label: 'Try', description: 'Remove this pair and test the shift.' },
    { id: 'valid', label: 'Valid', description: 'Every value lines up; keep the smaller shift.' },
    { id: 'done', label: 'Result', description: 'The smallest shift that works.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 (3 to 10 integers) and nums2 (two fewer values)',
  url: 'https://leetcode.com/problems/find-the-integer-added-to-array-ii/',
  complexity: 'O(n^3 log n) time in this trace: every pair of removals is tested. The trace caps n at 10.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[4,20,16,12,8],"nums2":[14,18,10]}' },
    { label: 'Example 2', input: '{"nums1":[3,5,5,3],"nums2":[7,7]}' },
  ],
}

export default function AddedIntegerII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Removed pair">{step.i === null ? 'no pair yet' : `removed indices ${step.i} and ${step.j}, shift ${step.x}`}</output>
    <output aria-label="Best shift">{`best shift so far: ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Exactly two values are removed from nums1. For each choice, the smallest remaining value must map to the smallest value of nums2, and the sorted rest must line up with the sorted target after that shift.</p>
  </>} />
}
