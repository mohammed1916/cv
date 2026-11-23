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
  question: "Find the minimum cost to acquire every fruit when buying a fruit lets you take the next ones for free, with a larger input size.",
  approaches: [
    { name: "Backward DP with deque", intuition: "Compute the cheapest cost from each index from the end, keeping the minimum over the reachable window in a monotonic deque.", time: "O(n)", space: "O(n)" },
    { name: "Backward DP scanning range", intuition: "Scan every purchase that frees the following fruits for each index.", time: "O(n^2)", space: "O(n)" },
  ],
  examples: [
    { label: 'Five fruits', input: '{"prices":[5,1,3,2,4]}' },
    { label: 'Three fruits', input: '{"prices":[3,1,2]}' },
    { label: 'Single fruit', input: '{"prices":[7]}' },
    { label: 'Equal prices', input: '{"prices":[3,3,3,3]}' },
    { label: 'Upper length, extremes', input: '{"prices":[30,1,30,1,30,1,30,1,30,1,30,1,30,1,30,1,30,1,30,1]}' },
    { label: 'Long run: 20 fruits', input: '{"prices":[2,24,1,23,13,8,26,12,14,30,20,26,9,12,15,8,25,27,18,2]}' },
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
