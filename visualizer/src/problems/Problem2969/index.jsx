import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FruitWindowView from './FruitWindowView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sentinel', description: 'The fruit past the end costs nothing.' },
    { id: 'push', label: 'Add', description: 'A fruit enters the candidate deque.' },
    { id: 'expire', label: 'Reach', description: 'Candidates beyond the reach are dropped.' },
    { id: 'compute', label: 'Cost', description: 'Price plus the cheapest candidate.' },
    { id: 'done', label: 'Result', description: 'Report the cost of fruit one.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a prices list, e.g. {"prices":[5,1,3,2,4]}',
  url: 'https://leetcode.com/problems/minimum-number-of-coins-for-fruits-ii/',
  complexity: 'O(n) time and O(n) space with a monotone deque over the reach window. The visualization caps the list at 20 fruits with prices from 1 to 30.',
  examples: [
    { label: 'Five fruits', input: '{"prices":[5,1,3,2,4]}' },
    { label: 'Three fruits', input: '{"prices":[3,1,2]}' },
  ],
}

export default function MinimumNumberOfCoinsForFruitsII() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <FruitWindowView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>The window of reachable next purchases moves left as the scan goes back, so a deque that keeps only useful candidates gives each fruit a constant amortised cost.</p>
    </>} />
}
