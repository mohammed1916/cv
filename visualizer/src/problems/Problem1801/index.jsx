import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HeapView from '../../components/shared/HeapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Start with no unmatched orders.' },
    { id: 'order', label: 'Match order', description: 'Match the incoming order against the best opposite order, then keep any remainder.' },
    { id: 'done', label: 'Total', description: 'Add the backlog amounts and take the modulo.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with orders: [price, amount, type] triples, type 0 for buy and 1 for sell (JSON)',
  url: 'https://leetcode.com/problems/number-of-orders-in-the-backlog/',
  complexity: 'O(n log n) time with two heaps. The visualization caps the input at 8 orders.',
  examples: [
    { label: 'Example 1', input: '{"orders":[[10,5,0],[15,2,1],[25,1,1],[30,4,0]]}' },
    { label: 'Example 2', input: '{"orders":[[7,1000000000,1],[15,3,0],[5,999999995,0],[5,1,1]]}' },
  { label: 'Single buy order', input: "{\"orders\":[[5,3,0]]}" },
  { label: 'Equal prices match', input: "{\"orders\":[[10,4,0],[10,4,1]]}" },
  { label: 'Largest prices and amounts', input: "{\"orders\":[[1000000000,1000000000,1],[1000000000,1000000000,0]]}" },
  { label: 'Long run: 8 orders', input: "{\"orders\":[[22,8,1],[39,17,1],[14,7,1],[48,16,1],[39,9,1],[15,2,0],[40,12,1],[18,13,1]]}" },
  ],
}

export default function NumberOfOrdersBacklog() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HeapView title="Buy backlog (max heap by price)" items={step.buy.map(e => `${e.price}×${e.amount}`)} order="max" />
    <HeapView title="Sell backlog (min heap by price)" items={step.sell.map(e => `${e.price}×${e.amount}`)} order="min" />
  </>} renderReasoning={() => <>
    <p>A buy matches the cheapest sell it can afford, and a sell matches the highest buy it can meet. Each match removes the smaller of the two amounts.</p>
    <p>Whatever cannot match waits in its heap, so the top of each heap is always the order that the next arrival would meet first.</p>
  </>} />
}
