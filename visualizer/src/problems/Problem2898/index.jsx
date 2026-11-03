import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import StockKeyView from './StockKeyView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No group has been started.' },
    { id: 'key', label: 'Key', description: 'Subtract the index from the price.' },
    { id: 'add', label: 'Add', description: 'Add the price to its group total.' },
    { id: 'best', label: 'Best', description: 'This group now holds the largest total.' },
    { id: 'done', label: 'Result', description: 'Report the best group total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a prices list, e.g. {"prices":[4,7,2,9,5,11]}',
  url: 'https://leetcode.com/problems/maximum-linear-stock-score/',
  complexity: 'O(n) time and O(n) space with a hash map keyed by price minus index. The visualization caps the list at 12 days with prices from 1 to 30.',
  examples: [
    { label: 'Mixed run', input: '{"prices":[4,7,2,9,5,11]}' },
    { label: 'Equal prices', input: '{"prices":[3,3,3]}' },
  ],
}

export default function MaximumLinearStockScore() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <StockKeyView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Days with the same price-minus-index key can all be chosen, so the answer is the largest sum over one key.</p>
    </>} />
}
