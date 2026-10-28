import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Each array keeps half of its entries.' },
    { id: 'classify', label: 'Classify', description: 'Split the values into only-in-one and shared.' },
    { id: 'exclusive', label: 'Exclusive', description: 'Keep values that only one array has.' },
    { id: 'shared', label: 'Shared', description: 'Fill the spare slots with shared values.' },
    { id: 'done', label: 'Complete', description: 'Report the largest set size.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1 and nums2, equal even lengths from 2 to 10 (JSON)',
  url: 'https://leetcode.com/problems/maximum-size-of-a-set-after-removals/',
  complexity: 'O(n) time with hash sets. The visualization caps each array at 10 values.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[1,2,1,2],"nums2":[1,1,1,1]}' },
    { label: 'Example 2', input: '{"nums1":[1,2,3,4,5,6],"nums2":[2,3,2,3,2,3]}' },
  ],
}

export default function SetAfterRemovals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums1, nums2 } = run.input
    const set1 = new Set(nums1)
    const set2 = new Set(nums2)
    return <>
      <IndexedSequence label="nums1" length={nums1.length} valueAt={i => nums1[i]}
        roleAt={i => (set2.has(nums1[i]) ? 'shared' : 'only in nums1')} />
      <IndexedSequence label="nums2" length={nums2.length} valueAt={i => nums2[i]}
        roleAt={i => (set1.has(nums2[i]) ? 'shared' : 'only in nums2')} />
      <output aria-label="Kept so far">{`Kept: ${step.keep1} from nums1-only, ${step.keep2} from nums2-only, ${step.sharedKept} shared; set size ${step.result}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Values that only one array contains can only be kept through that array, so they are kept first, up to half of each array.</p>
    <p>Shared values can be kept through either array, so they fill whatever slots remain.</p>
  </>} />
}
