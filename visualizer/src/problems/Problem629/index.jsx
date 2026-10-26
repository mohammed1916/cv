import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'

const definition = {
  phases: [
    { id: 'start', label: 'Base case', description: 'Zero elements have zero inversions.' },
    { id: 'row', label: 'Add element', description: 'Each row sums a sliding window of the previous row.' },
    { id: 'done', label: 'Complete', description: 'Read the requested cell.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Parameters (JSON object with n and k)',
  url: 'https://leetcode.com/problems/k-inverse-pairs-array/',
  complexity: 'O(n·k) time and O(k) space in the solver. The visualization keeps the full table for display, so it is limited to n ≤ 12 and k ≤ 60.',
  examples: [
    { label: 'Three, one pair', input: '{"n":3,"k":1}' },
    { label: 'Three, zero pairs', input: '{"n":3,"k":0}' },
    { label: 'Four, three pairs', input: '{"n":4,"k":3}' },
  ],
}

export default function KInversePairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Permutations with j inverse pairs (rows: n, columns: j)" values={step.table}
      rowLabels={step.table.map((_, i) => `n=${i}`)} columnLabels={step.table[0].map((_, j) => j)}
      activeCell={step.phase === 'done' ? { row: run.input.n, column: run.input.k } : { row: step.row, column: 0 }} />
    <output aria-label="Count">{step.phase === 'done' ? `Count: ${step.result}` : `Row ${step.row} built`}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Recurrence:</strong> placing element i with t inversions (0 ≤ t ≤ i − 1) adds t pairs to a permutation of i − 1 elements. The prefix sums cover every t at once.</p>
    <p>{run.input.n > 12 ? '' : `Table size: ${step.table.length} rows × ${step.table[0].length} columns.`}</p>
  </>} />
}
