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
    { label: 'Six days, two trades', input: '{"prices":[3,8,1,9,4,10],"k":2}' },
    { label: 'Flat prices, one trade', input: '{"prices":[5,5],"k":1}' },
    { label: 'Two days, one trade', input: '{"prices":[1,5],"k":1}' },
    { label: 'Equal prices', input: '{"prices":[7,7,7,7],"k":2}' },
    { label: 'Largest prices, k is half the days', input: '{"prices":[100,1,100,1,100,1,100,1,100,1],"k":5}' },
    { label: 'Long run: 10 days', input: '{"prices":[84,22,23,7,68,41,74,32,11,32],"k":3}' },
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
