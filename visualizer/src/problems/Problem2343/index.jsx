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
    { label: 'Example', input: '{"nums":["12","95","37","60"],"queries":[[1,1],[2,2],[4,1]]}' },
    { label: 'Ties', input: '{"nums":["20","11","30"],"queries":[[2,1],[1,2]]}' },
    { label: 'One number, one digit', input: '{"nums":["7"],"queries":[[1,1]]}' },
    { label: 'Equal trimmed values keep index order', input: '{"nums":["12","21","12"],"queries":[[2,1],[3,1],[1,2]]}' },
    { label: 'Leading zeros are kept', input: '{"nums":["007","120","099"],"queries":[[1,3],[2,1]]}' },
    { label: 'Largest input: 12 numbers of 12 digits', input: '{"nums":["170395214182","399559937272","042894044106","510844780028","117708498180","081405914866","816200484510","280663106336","351996855532","485965691398","918480612746","995274258064"],"queries":[[1,9],[2,2],[3,1],[4,7],[5,4],[6,4],[7,9],[8,1]]}' },
    { label: 'Long run: 12 numbers, 8 queries', input: '{"nums":["849795","020344","109020","118830","759408","215144","510646","090353","187642","386537","337039","212820"],"queries":[[9,6],[1,2],[7,4],[7,1],[3,5],[11,6],[7,3],[12,6]]}' },
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
