import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty heap', description: 'Start with an empty heap.' },
    { id: 'add', label: 'Add', description: 'Add the new obstacle distance.' },
    { id: 'trim', label: 'Trim', description: 'Drop the largest distance when more than k are kept.' },
    { id: 'answer', label: 'Answer', description: 'Read the kth nearest distance, or -1.' },
    { id: 'done', label: 'Complete', description: 'Report all answers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with queries ([x, y] points) and k (JSON)',
  url: 'https://leetcode.com/problems/k-th-nearest-obstacle-queries/',
  complexity: 'O(q log k) time for q queries. The visualization caps the input at 8 queries.',
  examples: [
    { label: 'Example 1', input: '{"queries":[[1,2],[3,4],[2,3],[-3,0]],"k":2}' },
    { label: 'Example 2', input: '{"queries":[[5,5],[4,4],[3,3]],"k":1}' },
  ],
}

export default function KthNearestObstacles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Answers so far" length={step.answers.length} valueAt={i => step.answers[i]}
      active={step.current} roleAt={i => `query ${i + 1}`} />
    <output aria-label="Heap">{`Max-heap (largest on top): [${step.heap.join(', ')}]${step.distance === null ? '' : `, new distance ${step.distance}`}`}</output>
    <p>{`Queries: ${run.input.queries.map(([x, y]) => `(${x}, ${y})`).join(' ')}`}</p>
  </>} renderReasoning={() => <>
    <p>The kth nearest obstacle is the kth smallest Manhattan distance. A max-heap holding the k smallest distances keeps its largest on top, so the answer is read in constant time.</p>
    <p>When a new distance arrives, it joins the heap, and if the heap grows past k the largest is dropped.</p>
  </>} />
}
