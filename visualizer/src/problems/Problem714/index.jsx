import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Day 0', description: 'Buy on day 0 or stay in cash.' },
    { id: 'day', label: 'Next day', description: 'Sell with the fee, or buy, whichever is better.' },
    { id: 'done', label: 'Complete', description: 'Return the cash state after the last day.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Prices and fee (JSON object)',
  url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/',
  complexity: 'O(n) time and O(1) extra space: two running states.',
  examples: [
    { label: 'Fee 2', input: '{"prices":[1,3,2,8,4,9],"fee":2}' },
    { label: 'Fee 3', input: '{"prices":[1,3,7,5,10,3],"fee":3}' },
  ],
}

export default function StockWithFee() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Prices" length={run.input.prices.length} active={step.day} valueAt={i => run.input.prices[i]} />
    <output aria-label="States">Cash {step.cash} · holding {step.hold}{step.phase === 'done' ? ` · result ${step.result}` : ''}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Two states:</strong> cash means no share is held; hold means one share is held. Selling costs {run.input.fee}, paid only once per sale.</p>
  </>} />
}
