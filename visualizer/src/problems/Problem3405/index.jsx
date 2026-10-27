import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'pascal', label: 'Binomial', description: 'Fill Pascal’s triangle to get C(n-1, k), the ways to choose the equal pairs.' },
    { id: 'power', label: 'Changing pairs', description: 'Multiply by m-1 for each neighbouring pair that must differ.' },
    { id: 'done', label: 'Complete', description: 'Multiply by the m choices for the first value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Parameters (JSON object with n, m, and k)',
  url: 'https://leetcode.com/problems/count-the-number-of-arrays-with-k-matching-adjacent-elements/',
  complexity: 'O(n * k + log n) time. The visualization caps n at 10 and m at 6.',
  examples: [
    { label: 'Equal run', input: '{"n":3,"m":4,"k":2}' },
    { label: 'Two values', input: '{"n":3,"m":2,"k":0}' },
  ],
}

export default function MatchingArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DPTable title="Pascal’s triangle: C(i, j)" values={step.table}
      rowLabels={step.table.map((_, i) => i)} columnLabels={step.table[0].map((_, j) => j)}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />
    <output aria-label="Status">{step.power === null ? step.message : `${step.message} Power so far: ${step.power}.`}</output>
  </>} renderReasoning={() => <>
    <p>Choose which k of the n - 1 neighbouring pairs are equal: C(n-1, k) ways.</p>
    <p>The first value has m choices. Each pair that must differ has m - 1 choices, since it cannot repeat the value before it.</p>
  </>} />
}
