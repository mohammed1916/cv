import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Start with zero answers and an empty pool.' },
    { id: 'group', label: 'Group', description: 'Take the next nums1 value; its pool is every smaller value.' },
    { id: 'answer', label: 'Answer', description: 'Every index in this group reads the same pool total.' },
    { id: 'insert', label: 'Insert', description: 'Add the group nums2 values and keep only the k largest.' },
    { id: 'done', label: 'Result', description: 'Report the answer array.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums1, nums2 and k',
  url: 'https://leetcode.com/problems/choose-k-elements-with-maximum-sum/',
  complexity: 'O(n log n) time for the sort and the top-k inserts, with at most 12 items in this visualization.',
  examples: [
    { label: 'Example', input: '{"nums1":[2,6,4,1],"nums2":[3,8,5,9],"k":2}' },
    { label: 'Ties', input: '{"nums1":[4,4,1],"nums2":[9,3,6],"k":1}' },
    { label: 'Single pair with k 1', input: '{"nums1":[3],"nums2":[4],"k":1}' },
    { label: 'Equal values tie', input: '{"nums1":[5,5,5],"nums2":[5,5,5],"k":2}' },
    { label: 'Largest values swapped', input: '{"nums1":[50,1,50,1],"nums2":[1,50,1,50],"k":4}' },
    { label: 'Long run: 12 pairs', input: '{"nums1":[14,42,18,22,33,5,42,24,36,35,33,16],"nums2":[9,17,25,12,23,11,11,38,48,8,20,19],"k":6}' },
  ],
}

export default function ChooseKElementsWithMaximumSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums1" length={run.input.nums1.length} valueAt={i => run.input.nums1[i]} active={step.at}
      roleAt={i => (run.input.nums1[i] === step.group ? 'group' : '')} />
    <IndexedSequence label="answer" length={run.input.nums1.length} valueAt={i => step.answer[i]} active={step.at} />
    <output aria-label="Pool of nums2 values">{`pool = [${step.best.join(', ')}], k = ${run.input.k}`}</output>
  </>} renderReasoning={() => <>
    <p>Two indices can only affect each other when their nums1 values differ. Sorting the distinct nums1 values lets the sweep see exactly the strictly smaller values before each group.</p>
    <p>The pool keeps only the k largest nums2 values seen so far, so its sum is the best choice for every index in the next group.</p>
  </>} />
}
