import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Hour 0', description: 'Start on either drink.' },
    { id: 'hour', label: 'Hour', description: 'Compare staying on a drink with switching after one idle hour.' },
    { id: 'done', label: 'Complete', description: 'Report the best ending.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with energy_drink_a and energy_drink_b (equal-length arrays of 1 to 10)',
  url: 'https://leetcode.com/problems/maximum-energy-boost-from-two-drinks/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 8 hours.',
  examples: [
    { label: 'Stay on B', input: '{"energy_drink_a":[1,3,1],"energy_drink_b":[3,1,1]}' },
    { label: 'Switch once', input: '{"energy_drink_a":[4,1,1],"energy_drink_b":[1,1,3]}' },
  ],
}

export default function TwoDrinks() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DPTable title="best energy ending on each drink" values={[step.a, step.b]} rowLabels={['A', 'B']}
      activeCell={step.hour > 0 ? { row: 0, column: step.hour } : null} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Staying on a drink adds its energy to the previous hour. Switching skips the hour in between, so the switch looks two hours back.</p>
  </>} />
}
