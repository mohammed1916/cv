import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the full bottles and the first exchange cost.' },
    { id: 'drink', label: 'Drink', description: 'Drink every full bottle and collect the empties.' },
    { id: 'exchange', label: 'Exchange', description: 'Trade empties for a full bottle; the cost rises by one.' },
    { id: 'done', label: 'Complete', description: 'Report the total drunk.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with numBottles and numExchange',
  url: 'https://leetcode.com/problems/water-bottles-ii/',
  complexity: 'O(answer) time for the drink rounds, which is small for the capped inputs.',
  examples: [
    { label: 'Example 1', input: '{"numBottles":13,"numExchange":6}' },
    { label: 'Example 2', input: '{"numBottles":10,"numExchange":3}' },
  ],
}

export default function WaterBottlesII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <output aria-label="Bottles">{`Full ${step.full}, empty ${step.empty}, next exchange costs ${step.cost}, drunk ${step.drunk}`}</output>
  </>} renderReasoning={() => <>
    <p>Each round drinks every full bottle, then trades the empties for one more full bottle when there are enough of them.</p>
    <p>The exchange cost rises by one after every trade, so each later trade needs more empties.</p>
  </>} />
}
