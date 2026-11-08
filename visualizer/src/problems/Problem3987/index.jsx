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
    { label: "Single demand", input: '{"demands":[7],"k":1}' },
    { label: "Equal demands", input: '{"demands":[4,4,4],"k":2}' },
    { label: "Largest demands at the limit", input: '{"demands":[40,40,40,40,40,40,40,40,40,40],"k":10}' },
    { label: "Long run: 10 demands", input: '{"demands":[32,37,31,11,24,30,36,14,31,26],"k":7}' },
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
