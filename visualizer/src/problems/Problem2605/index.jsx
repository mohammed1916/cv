import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Digit sets', description: 'Put each list’s digits in its own set.' },
    { id: 'scan', label: 'Check digits', description: 'Look for a digit present in both sets, smallest first.' },
    { id: 'shared', label: 'Shared digit', description: 'A shared digit is the smallest possible answer.' },
    { id: 'pair', label: 'Pair', description: 'Combine the two smallest digits in the better order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two digit lists as JSON: {"nums1": [...], "nums2": [...]}',
  url: 'https://leetcode.com/problems/form-smallest-number-from-two-digit-arrays/',
  complexity: 'O(1) time for at most nine digits per list, and O(n + m) to build the sets.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[4,1,3],"nums2":[5,7]}' },
    { label: 'Example 2', input: '{"nums1":[3,5,2,6],"nums2":[3,1,7]}' },
  ],
}

export default function SmallestFromDigits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Answer so far">{step.result === null ? 'Answer not decided yet' : `Answer: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>A single shared digit is the smallest possible answer, because any two-digit number is at least 10.</p>
    <p>Without a shared digit, the answer has one digit from each list. The smaller of the two orders, tens digit first, is the answer.</p>
  </>} />
}
