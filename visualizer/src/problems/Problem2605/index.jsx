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
    { label: 'Own case 1', input: '{"nums1":[5,2,4],"nums2":[6,8]}' },
    { label: 'Own case 2', input: '{"nums1":[4,6,3,7],"nums2":[4,2,8]}' },
    { label: 'Single digit lists', input: '{"nums1":[1],"nums2":[2]}' },
    { label: 'Equal lists', input: '{"nums1":[4,1],"nums2":[4,1]}' },
    { label: 'All nine digits in reverse order', input: '{"nums1":[1,2,3,4,5,6,7,8,9],"nums2":[9,8,7,6,5,4,3,2,1]}' },
    { label: 'Long run: five and four digits', input: '{"nums1":[6,2,9,4,1],"nums2":[8,3,7,5]}' },
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
