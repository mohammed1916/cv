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
    { label: 'Mixed values, two queries', input: '{"nums":[4,1,4,6,1],"queries":[[0,2],[4,1]]}' },
    { label: "Single element", input: "{\"nums\":[5],\"queries\":[[0,1]]}" },
    { label: "Equal values use the smaller index", input: "{\"nums\":[2,2,2,2],\"queries\":[[1,1],[3,2]]}" },
    { label: "Zero k leaves values unmarked", input: "{\"nums\":[3,1,4],\"queries\":[[0,0],[2,0]]}" },
    { label: "Largest values and 12 queries", input: "{\"nums\":[20,1,20,1,20,1,20,1,20,1,20,1],\"queries\":[[0,12],[1,11],[2,10],[3,9],[4,8],[5,7],[6,6],[7,5],[8,4],[9,3],[10,2],[11,1]]}" },
    { label: "Long run: 12 items and 12 queries", input: "{\"nums\":[8,19,14,1,20,15,18,17,12,3,10,1],\"queries\":[[3,10],[9,8],[11,10],[9,8],[3,6],[1,4],[7,10],[5,0],[11,2],[1,0],[11,6],[9,4]]}" },
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
