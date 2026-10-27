import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Build', description: 'Build the segment tree of ones over nums1.' },
    { id: 'flip', label: 'Flip', description: 'Flip a range of nums1 with a lazy tag.' },
    { id: 'add', label: 'Add', description: 'Add p times the ones count to the sum.' },
    { id: 'query', label: 'Sum', description: 'Report the current sum of nums2.' },
    { id: 'done', label: 'Complete', description: 'Report every sum query answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums1, nums2 and queries',
  url: 'https://leetcode.com/problems/handling-sum-queries-after-update/',
  complexity: 'O((n + q) log n) time. The visualization caps nums1 at 10 values and queries at 8.',
  examples: [
    { label: 'Example 1', input: '{"nums1":[1,0,1],"nums2":[0,0,0],"queries":[[1,1,1],[2,1,0],[3,0,0]]}' },
    { label: 'Two flips', input: '{"nums1":[0,0],"nums2":[1,0],"queries":[[1,0,1],[2,2,0],[3,0,0],[1,0,0],[2,1,0],[3,0,0]]}' },
  ],
}

export default function HandlingSumQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="nums1 bits" length={step.bits.length} valueAt={index => step.bits[index]} />
    <output aria-label="Ones and sum">{`Ones in nums1: ${step.ones} · Sum of nums2: ${step.sum}`}</output>
    <output aria-label="Answers">{`Answers so far: [${step.answers.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>A flip changes every bit in its range, so each node keeps its ones count and a flag saying its children still need flipping.</p>
    <p>An add query needs only the number of ones in nums1, because each one adds p to the matching nums2 entry.</p>
  </>} />
}
