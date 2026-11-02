import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare the answer list.' },
    { id: 'query', label: 'Query', description: 'Read k and the trim length.' },
    { id: 'keys', label: 'Trim', description: 'Keep the last trim digits of each number.' },
    { id: 'sort', label: 'Sort', description: 'Order by trimmed value, then by index.' },
    { id: 'pick', label: 'Pick', description: 'Take the kth index.' },
    { id: 'done', label: 'Result', description: 'Return all answers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (equal-length digit strings) and queries ([k, trim] pairs)',
  url: 'https://leetcode.com/problems/query-kth-smallest-trimmed-number/',
  complexity: 'O(q * n * (L + log n)) time for q queries over n numbers of length L. The visualization caps the sizes.',
  examples: [
    { label: 'Example', input: '{"nums":["102","473","251","814"],"queries":[[1,1],[2,3],[4,2],[1,2]]}' },
    { label: 'Ties', input: '{"nums":["24","37","96","04"],"queries":[[2,1],[2,2]]}' },
  ],
}

export default function QueryKthSmallestTrimmedNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={step.at} roleAt={i => (step.order.length && step.order[0] === i ? 'first' : '')} />
    <output aria-label="Trimmed order">{step.trim === null ? `answers so far: [${(step.result || []).join(', ')}]` : `trim ${step.trim}, k ${step.k}, order [${step.order.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>A trimmed number is the last trim digits of the original string. Equal-length digit strings compare the same way their numeric values do.</p>
    <p>Sorting by the pair (trimmed value, index) breaks ties by original position, so the kth entry is the kth smallest in that order.</p>
  </>} />
}
