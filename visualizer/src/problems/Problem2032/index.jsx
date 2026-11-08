import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2032',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Three integer arrays (JSON)',
  url: 'https://leetcode.com/problems/two-out-of-three/',
  complexity: 'O(n1 + n2 + n3) expected time with hash sets.',
  examples: [
    { label: 'Common pair', input: '{"nums1":[7,8],"nums2":[8,9],"nums3":[4,9]}' },
    { label: 'Repeats', input: '{"nums1":[5,5,5],"nums2":[6],"nums3":[7]}' },
    { label: 'Disjoint', input: '{"nums1":[1],"nums2":[2],"nums3":[3]}' }, { label: "Single values", input: "{\"nums1\":[1],\"nums2\":[1],\"nums3\":[1]}" }, { label: "Repeated values", input: "{\"nums1\":[2,2],\"nums2\":[2,2],\"nums3\":[2]}" }, { label: "Maximum value", input: "{\"nums1\":[100,1],\"nums2\":[100],\"nums3\":[100,50]}" }, { label: "Long run: 20 each", input: "{\"nums1\":[60,37,72,17,31,12,20,71,28,6,65,33,72,61,8,25,13,15,30,82],\"nums2\":[8,39,68,31,91,53,47,97,28,56,28,11,66,86,42,17,25,77,15,6],\"nums3\":[79,85,7,3,39,12,25,99,27,28,72,4,100,90,50,59,80,92,34,38]}" },
  ],
}

const NAMES = ['nums1', 'nums2', 'nums3']

export default function TwoOutOfThree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { arrays, value, counts, answer } = step.snapshot
    return <>
      <div aria-label="Membership of the current value" style={{ display: 'grid', gap: 4 }}>
        {arrays.map((arr, i) => <div key={i} style={{ color: 'var(--text)', fontFamily: 'monospace' }}>
          {NAMES[i]}: {[...new Set(arr)].join(', ')}
          {counts && <strong style={{ marginLeft: 8, color: counts[i] ? 'var(--primary)' : 'var(--text-muted)' }}>{counts[i] ? `has ${value}` : 'no'}</strong>}
        </div>)}
      </div>
      <p>Answer so far: <strong>{answer.length ? answer.join(', ') : 'none'}</strong></p>
    </>
  }} renderReasoning={() => <p>Each distinct value is checked against the three sets once; a value qualifies when at least two sets contain it.</p>} />
}
