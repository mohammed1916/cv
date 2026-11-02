import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No cheapest price is known yet.' },
    { id: 'scan', label: 'Scan', description: 'Compare this price with the two cheapest so far.' },
    { id: 'pair', label: 'Total', description: 'Subtract the cheapest pair from the money.' },
    { id: 'done', label: 'Result', description: 'Report the leftover or the original money.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with prices (integers) and money',
  url: 'https://leetcode.com/problems/buy-two-chocolates/',
  complexity: 'O(n) time and O(1) extra space: one pass keeps the two smallest prices.',
  examples: [
    { label: 'Example 1', input: '{"prices":[1,2,2],"money":3}' },
    { label: 'Example 2', input: '{"prices":[3,2,3],"money":3}' },
  ],
}

export default function BuyTwoChocolates() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="prices" length={run.input.prices.length} valueAt={i => run.input.prices[i]} active={step.index}
      roleAt={i => (step.first !== null && run.input.prices[i] === step.first ? 'window' : '')} />
    <output aria-label="Cheapest pair">{`first = ${step.first ?? 'none'}, second = ${step.second ?? 'none'}${step.leftover !== null && step.leftover !== undefined ? `, leftover = ${step.leftover}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>The cheapest pair of chocolates is always the two smallest prices, so one pass that tracks the two smallest values is enough.</p>
    <p>If the pair costs more than the money, the answer is the original money, because no purchase is made.</p>
  </>} />
}
