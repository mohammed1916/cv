import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'base', label: 'Base', description: 'Score the original actions.' },
    { id: 'window', label: 'Window', description: 'Rewrite one window and measure the change.' },
    { id: 'done', label: 'Result', description: 'Add the best change to the original profit.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with prices, strategy (-1, 0, 1 per day) and an even k',
  url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-using-strategy/',
  complexity: 'O(n * k) time here for clarity; a sliding update reaches O(n).',
  examples: [
    { label: 'Example', input: '{"prices":[6,1,9],"strategy":[1,0,-1],"k":2}' },
    { label: 'Flat', input: '{"prices":[3,7],"strategy":[1,1],"k":2}' },
  ],
}

export default function BestTimeStrategy() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="prices" length={run.input.prices.length} valueAt={i => run.input.prices[i]}
      active={step.start >= 0 ? step.start : -1}
      roleAt={i => (step.start >= 0 && i >= step.start && i <= step.end ? 'window' : '')} />
    <output aria-label="Strategy change">{`window ${step.start >= 0 ? step.start : 'none'}, change ${step.change}, best change ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>One window is rewritten to hold on its first half and sell on its second half. Only that window's profit changes.</p>
    <p>Keep the largest change seen, including zero for leaving the strategy as it is.</p>
  </>} />
}
