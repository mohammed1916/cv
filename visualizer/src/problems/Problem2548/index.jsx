import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BagFillView from './BagFillView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2548',
  phases: [
    { id: 'check', label: 'Feasible', description: 'Check that the items can fill the bag.' },
    { id: 'sort', label: 'Rank', description: 'Order items by price per unit weight.' },
    { id: 'setup', label: 'Setup', description: 'Start with the full capacity as room.' },
    { id: 'take', label: 'Take', description: 'Take as much of the next item as fits.' },
    { id: 'done', label: 'Result', description: 'Report the total or -1.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with items ([price, weight] pairs) and capacity',
  url: 'https://leetcode.com/problems/maximum-price-to-fill-a-bag/',
  complexity: 'O(n log n) time for n items to sort by price per unit weight, and O(n) space. Fractional items are allowed, so the greedy choice is exact. The statement is read as filling the bag to exactly capacity, returning -1 when the total weight is too small. The visualization caps n at 8.',
  examples: [
    { label: 'Mixed ratios', input: '{"items":[[30,4],[50,10],[10,2],[24,6]],"capacity":9}' },
    { label: 'Exact pair', input: '{"items":[[7,2],[6,3]],"capacity":5}' },
    { label: 'Too heavy', input: '{"items":[[5,2],[4,1]],"capacity":4}' },
  ],
}

export default function MaximumPriceToFillABag() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BagFillView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Each unit of room goes to the item that pays the most per unit, so the greedy order is optimal.</p>}
    />
  )
}
