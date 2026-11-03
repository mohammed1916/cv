import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import TankView from './TankView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3987',
  phases: [
    { id: 'start', label: 'Setup', description: 'Load the free units and zero the purchase count.' },
    { id: 'demand', label: 'Demand', description: 'Look at the next demand.' },
    { id: 'buy', label: 'Refill', description: 'Buy one more refill; its price is the new count.' },
    { id: 'consume', label: 'Consume', description: 'Subtract the demand from the tank.' },
    { id: 'done', label: 'Result', description: 'Report the total cost modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with demands and k (e.g. {"demands":[3,5,2],"k":4})',
  url: 'https://leetcode.com/problems/minimum-total-cost-to-process-all-elements/',
  complexity: 'O(n + r) time where r is the number of refills bought; a closed form uses the count of refills directly. The visualization caps demands at 10 values of at most 40 and k at 10.',
  examples: [
    { label: 'Three demands', input: '{"demands":[3,5,2],"k":4}' },
    { label: 'Large first demand', input: '{"demands":[10,1],"k":3}' },
  ],
}

export default function MinimumTotalCost() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <TankView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Refills are bought only when a demand cannot be met, and the n-th refill costs n, so buying late never costs more.</p>
    </>} />
}
