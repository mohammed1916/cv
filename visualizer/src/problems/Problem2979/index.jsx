import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CostGridView from './CostGridView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Cost zero is payable with no coins.' },
    { id: 'reach', label: 'Payable', description: 'This cost can be paid.' },
    { id: 'gap', label: 'Gap', description: 'This cost cannot be paid.' },
    { id: 'done', label: 'Result', description: 'Report the largest gap.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with coins, a pair of distinct primes, e.g. {"coins":[5,7]}',
  url: 'https://leetcode.com/problems/most-expensive-item-that-can-not-be-bought/',
  complexity: 'O(a * b) time and O(a * b) space for the marking table. The visualization caps each prime at 17, so the grid has at most 289 costs.',
  examples: [
    { label: 'Five and seven', input: '{"coins":[5,7]}' },
    { label: 'Three and eleven', input: '{"coins":[3,11]}' },
    { label: "Smallest primes", input: '{"coins":[2,3]}' },
    { label: "Largest primes", input: '{"coins":[13,17]}' },
    { label: "Smallest and largest", input: '{"coins":[2,17]}' },
  ],
}

export default function MostExpensiveItemThatCannotBeBought() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <CostGridView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Distinct primes share no factor, so past the largest gap every cost is payable; the answer is a times b minus a minus b.</p>
    </>} />
}
