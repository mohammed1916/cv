import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2233',
  phases: [
    { id: 'setup', label: 'Sort', description: 'Sort the values so the smallest is at the front.' },
    { id: 'increment', label: 'Increment', description: 'Spend one operation on the smallest value.' },
    { id: 'sift', label: 'Reorder', description: 'Move the raised value back into its sorted place.' },
    { id: 'done', label: 'Product', description: 'Multiply the values modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [5, 1, 4], "k": 3}',
  url: 'https://leetcode.com/problems/maximum-product-after-k-increments/',
  complexity: 'O(k * n) time and O(n) space here, or O((n + k) log n) with a real heap. The visualization caps n at 8 and k at 20.',
  examples: [
    { label: 'Example', input: '{"nums":[5,1,4],"k":3}' },
    { label: 'Two values', input: '{"nums":[2,7],"k":4}' },
  ],
}

export default function MaximumProductAfterIncrements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="sorted values as a min-heap" length={step.heap.length} valueAt={i => step.heap[i]} active={step.at}
      roleAt={i => (i === 0 ? 'smallest' : '')} />
    <output aria-label="Operations left">{`${step.left} increment${step.left === 1 ? '' : 's'} left`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The product is largest when the values are as close together as possible, so every increment goes to the current smallest value.</p>
    <p>A sorted array plays the role of a min-heap here: the smallest value sits at the front, and a raised value sifts right until the order is restored.</p>
  </>} />
}
