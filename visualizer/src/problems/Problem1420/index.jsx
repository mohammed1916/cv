import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty array', description: 'One way to build an empty array: largest value 0, cost 0.' },
    { id: 'cell', label: 'Fill cell', description: 'Count arrays of this length with this largest value and cost.' },
    { id: 'done', label: 'Complete', description: 'Add every largest value that reaches exactly k costs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, m and k (JSON)',
  url: 'https://leetcode.com/problems/build-array-where-you-can-find-the-maximum-exactly-k-comparisons/',
  complexity: 'O(n * m * m * k) time for the direct sum. The visualization caps n at 8 and m at 6.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"m":2,"k":1}' },
    { label: 'Example 2', input: '{"n":2,"m":3,"k":2}' },
  ],
}

export default function BuildArrayMaximumComparisons() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title={`Arrays of length ${step.length} by largest value (rows) and cost (columns)`} values={step.table}
      activeCell={step.row >= 0 ? { row: step.row, column: step.column } : null} />
    <output aria-label="Result">{step.total === null ? `Working with n = ${run.input.n}, m = ${run.input.m}, k = ${run.input.k}` : `Answer: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>The search cost counts how often the running maximum grows. Tracking the largest value and the cost so far is enough to decide the next step.</p>
    <p>Appending a value no larger than the current maximum keeps the cost, which gives the factor j. Appending a larger value raises the cost by one.</p>
  </>} />
}
