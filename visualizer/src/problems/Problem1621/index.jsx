import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'pascal', label: 'Pascal table', description: 'Fill the binomial table one entry at a time.' },
    { id: 'done', label: 'Complete', description: 'Read off C(n+k-1, 2k).' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Points and segments (JSON object with n points and k segments)',
  url: 'https://leetcode.com/problems/number-of-sets-of-k-non-overlapping-line-segments/',
  complexity: 'O((n + k) * k) time for the binomial table. The visualization caps n at 12 and k at 6.',
  examples: [
    { label: 'Three points', input: '{"n":3,"k":1}' },
    { label: 'Four points', input: '{"n":4,"k":2}' },
  ],
}

export default function NonOverlapping() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DPTable title="Pascal’s triangle: C(i, j)" values={step.table}
      rowLabels={step.table.map((_, i) => i)} columnLabels={step.table[0].map((_, j) => j)}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A set of k segments on n points is a choice of 2k endpoints with repetition allowed only where segments touch, which turns into C(n + k - 1, 2k).</p>
    <p>Pascal’s triangle gives the binomial coefficient without large factorials, and the table shows each step.</p>
  </>} />
}
