import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Day 0', description: 'Set the two states for the first price.' },
    { id: 'sell', label: 'Sell', description: 'Selling from the hold state beats staying in cash.' },
    { id: 'buy', label: 'Buy', description: 'Buying from the cash state beats keeping the share.' },
    { id: 'wait', label: 'Wait', description: 'Neither move helps; both states carry over.' },
    { id: 'done', label: 'Complete', description: 'Read the cash state after the last day.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'prices and fee (JSON object)',
  url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/',
  complexity: 'O(n) time and O(1) extra space when only the latest pair is kept. The table here keeps every day to show the states.',
  examples: [
    { label: 'Two swings', input: '{"prices":[4,6,3,9,5,8],"fee":1}' },
    { label: 'Fee wins', input: '{"prices":[2,4,3,6],"fee":3}' },
  ],
}

export default function StockWithFee() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="prices by day" length={run.input.prices.length} active={step.day}
      valueAt={i => run.input.prices[i]}
      roleAt={i => (i === step.day ? 'today' : i < step.day ? step.actions[i] ?? '' : '')} />
    <MatrixGrid label="States by day: row 0 = cash, row 1 = holding" matrix={[step.cashRow, step.holdRow]}
      activeCell={{ row: 0, col: step.day }} highlightedCells={[{ row: 1, col: step.day }]} />
    <output aria-label="Current day">{`Day ${step.day}: cash ${step.cashRow[step.day]}, hold ${step.holdRow[step.day]}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>Two states describe each day: the best profit while holding no share (cash) and the best profit while holding one share (hold).</p>
    <p>Selling pays the fee once. A buy moves profit from cash into hold at today's price, so each day both states are compared with yesterday's pair.</p>
    {step.phase === 'done' && <p>The answer is the cash state after the final day, since holding a share at the end is never better than selling it.</p>}
  </>} />
}
