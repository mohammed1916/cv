import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every element starts unmarked.' },
    { id: 'mark', label: 'Mark', description: 'The queried index is marked if it was not.' },
    { id: 'order', label: 'Order', description: 'Unmarked indices sorted by value, then index.' },
    { id: 'smallest', label: 'Smallest', description: 'Mark the next smallest unmarked element.' },
    { id: 'record', label: 'Record', description: 'Save the unmarked sum for this query.' },
    { id: 'done', label: 'Result', description: 'The sums after every query.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (1 to 12 integers) and queries ([index, k] pairs)',
  url: 'https://leetcode.com/problems/mark-elements-on-array-by-performing-queries/',
  complexity: 'O(q * n log n) in this trace. A heap of unmarked values gives O(n log n + q * k log n) in the contest form.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,2,1,2,3,1],"queries":[[1,2],[3,3],[4,2]]}' },
  ],
}

export default function MarkElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums (marked elements show as marked)" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.query ? step.query[0] : -1}
      roleAt={i => (step.marked[i] ? 'marked' : '')} />
    <output aria-label="Unmarked sum">{`unmarked sum = ${step.total}; answers so far: [${step.answer.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Each query marks one index if it is unmarked, then marks the k smallest unmarked values. Ties go to the smaller index.</p>
    <p>The running total is updated as each element is marked, so the sum after each query is read without rescanning.</p>
  </>} />
}
