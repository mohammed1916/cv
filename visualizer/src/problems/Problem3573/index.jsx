import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No transaction is open and none has been opened.' },
    { id: 'day', label: 'Day', description: 'Each day performs at most one open or close action.' },
    { id: 'done', label: 'Complete', description: 'Report the best closed profit.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with prices and k (JSON)',
  url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-v/',
  complexity: 'O(n * k) time and O(k) space. The visualization caps the days at 10.',
  examples: [
    { label: 'Example 1', input: '{"prices":[1,7,9,8,2],"k":2}' },
    { label: 'Example 2', input: '{"prices":[12,16,19,19,8,1,19,13,9],"k":3}' },
  ],
}

export default function BestTimeStockV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Prices by day" length={run.input.prices.length} valueAt={i => run.input.prices[i]} active={step.day} roleAt={i => (i < step.day ? 'passed' : '')} />
    <output aria-label="Best">{`Best closed profit: ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A day can open or close one trade, never both, so each day's update reads the tables from the day before.</p>
  </>} />
}
