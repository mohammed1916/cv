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
    { label: 'Dip then rise', input: '{"prices":[6,1,9],"strategy":[1,0,-1],"k":2}' },
    { label: 'Flat', input: '{"prices":[3,7],"strategy":[1,1],"k":2}' },
    { label: 'Two days, one trade', input: '{"prices":[4,6],"strategy":[0,0],"k":2}' },
    { label: 'Equal prices', input: '{"prices":[3,3,3,3],"strategy":[1,-1,0,1],"k":2}' },
    { label: 'Longest run and largest k', input: '{"prices":[12,11,10,9,8,7,6,5,4,3,2,1],"strategy":[1,1,1,1,1,1,1,1,1,1,1,1],"k":12}' },
    { label: 'Long run: 12 days', input: '{"prices":[37,5,1,18,28,4,24,43,39,1,36,39],"strategy":[1,0,1,1,1,0,0,-1,0,1,0,1],"k":6}' },
  ],
}

export default function BestTimeStrategy() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="prices" length={run.input.prices.length} valueAt={i => run.input.prices[i]}
      active={step.start >= 0 ? step.start : -1}
      roleAt={i => (step.start < 0 ? '' : i === step.start ? 'l' : i === step.mid ? 'mid' : i === step.end ? 'r' : i > step.start && i < step.end ? 'window' : '')} />
    <output aria-label="Strategy change">{`window ${step.start >= 0 ? step.start : 'none'}, change ${step.change}, best change ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>One window is rewritten to hold on its first half and sell on its second half. Only that window's profit changes.</p>
    <p>Keep the largest change seen, including zero for leaving the strategy as it is.</p>
  </>} />
}
