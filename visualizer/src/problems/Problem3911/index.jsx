import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No query has been answered yet.' },
    { id: 'query', label: 'Query', description: 'Start with the k-th even, as if nothing were removed.' },
    { id: 'scan', label: 'Scan', description: 'Look at each number in the subarray.' },
    { id: 'shift', label: 'Shift', description: 'A removed even lies at or below the answer, so the answer moves up one even.' },
    { id: 'append', label: 'Record', description: 'Store the answer for this query.' },
    { id: 'done', label: 'Return', description: 'All answers are ready.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"nums": [...], "queries": [[l, r, k], ...]}',
  url: 'https://leetcode.com/problems/k-th-smallest-remaining-even-integer-in-subarray-queries/',
  complexity: 'O(length of each subarray) per query after the sorted input. The visualization caps nums at 8 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,4,7],"queries":[[0,2,1],[1,1,2],[0,0,3]]}' },
    { label: 'Example 2', input: '{"nums":[2,5,8],"queries":[[0,1,2],[1,2,1],[0,2,4]]}' },
  ],
}

export default function KthSmallestRemainingEven() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    return <>
      <IndexedSequence label="nums (strictly increasing)" length={run.input.nums.length} valueAt={j => run.input.nums[j]} active={step.index} />
      <output aria-label="Running answer">{`Running answer: ${step.value ?? '-'}. ${step.message}`}</output>
      <output aria-label="Answers so far">{`Answers: [${step.answers.join(', ')}]`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Without removals the k-th even is 2k. Each removed even that is at or below the running answer pushes the answer up by one even.</p>
    <p>The numbers are sorted, so the removed evens come in increasing order, and a single left-to-right pass is enough.</p>
  </>} />
}
