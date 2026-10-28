import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty table.' },
    { id: 'fill', label: 'Fill from right', description: 'Add this start’s energy to the best run k places ahead.' },
    { id: 'done', label: 'Complete', description: 'Report the largest total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with energy (integers -10 to 10) and k (jump length)',
  url: 'https://leetcode.com/problems/taking-maximum-energy-from-the-mystic-dungeon/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"energy":[5,2,-10,-5,1],"k":3}' },
    { label: 'All negative', input: '{"energy":[-2,-3,-1],"k":2}' },
  ],
}

export default function MysticDungeon() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="total[i]: energy collected from start i" values={[step.total]} rowLabels={['total']}
      activeCell={step.index >= 0 ? { row: 0, column: step.index } : null} />
    <p aria-label="Energies">{`energy: ${run.input.energy.join(', ')}; jump ${run.input.k}`}</p>
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Starting at i collects energy[i] and then the same best outcome from i + k, so the table is filled from the right.</p>
  </>} />
}
