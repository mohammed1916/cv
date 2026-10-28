import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the balls in each colour.' },
    { id: 'sell', label: 'Sell', description: 'Sell from the colour with the most balls; it earns that count.' },
    { id: 'done', label: 'Complete', description: 'Report the total value modulo 1e9+7.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with inventory (1 to 4 colour counts, each 1 to 8) and orders',
  url: 'https://leetcode.com/problems/sell-diminishing-valued-colored-balls/',
  complexity: 'O(orders * colours) time for the visualization. A heap gives O(orders log colours) for large inputs.',
  examples: [
    { label: 'Example 1', input: '{"inventory":[2,5],"orders":4}' },
    { label: 'Example 2', input: '{"inventory":[3,5],"orders":6}' },
  ],
}

export default function SellColoredBalls() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Balls left per colour" length={step.counts.length} valueAt={i => step.counts[i]} active={step.index} roleAt={i => (i === step.index ? 'sold' : '')} />
    <output aria-label="Running total">{`Total value: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A ball sells for the number of balls of its colour still in stock, so selling from the largest pile gives the largest value and shrinks that pile by one.</p>
    <p>Selling in this greedy order is optimal because each sale reduces the best future value by the least amount possible.</p>
  </>} />
}
