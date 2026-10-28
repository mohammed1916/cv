import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Gather', description: 'Collect and sort every price.' },
    { id: 'buy', label: 'Buy', description: 'Buy the cheapest remaining item on this day.' },
    { id: 'done', label: 'Complete', description: 'Report the total spending.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Shops as rows of prices, each row from highest to lowest (JSON)',
  url: 'https://leetcode.com/problems/maximum-spending-after-buying-items/',
  complexity: 'O(m * n log(m * n)) for the sort. The visualization caps the grid at 4 by 4.',
  examples: [
    { label: 'Single shop', input: '[[3,2,1]]' },
    { label: 'Two shops', input: '[[2,1],[2,1]]' },
  ],
}

export default function MaximumSpending() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Purchase order (price)" length={step.bought.length} valueAt={i => step.bought[i]}
      active={step.day - 1} roleAt={i => `day ${i + 1}`} />
    <output aria-label="Spending so far">{`Day ${step.day}, total spending ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Prices are multiplied by the day they are bought, so the largest multipliers should go to the largest prices and the cheapest items should come first.</p>
    <p>Each shop lists its prices from highest to lowest, so its cheapest remaining item is always at the end and is always available.</p>
  </>} />
}
