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
    { label: 'Cheap pair fits', input: '{"prices":[4,1,3,6],"money":7}' },
    { label: 'Pair too costly', input: '{"prices":[5,9],"money":12}' },
  ],
}

export default function BuyTwoChocolates() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="prices" length={run.input.prices.length} valueAt={i => run.input.prices[i]} active={step.index}
      roleAt={i => (step.first !== null && i === step.firstIndex ? 'first' : step.second !== null && i === step.secondIndex ? 'second' : '')} />
    <output aria-label="Cheapest pair">{`first = ${step.first ?? 'none'}, second = ${step.second ?? 'none'}${step.leftover !== null && step.leftover !== undefined ? `, leftover = ${step.leftover}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>The cheapest pair of chocolates is always the two smallest prices, so one pass that tracks the two smallest values is enough.</p>
    <p>If the pair costs more than the money, the answer is the original money, because no purchase is made.</p>
  </>} />
}
