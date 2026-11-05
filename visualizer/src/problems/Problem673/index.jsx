import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Base runs', description: 'Each value starts as a run of length 1 with count 1.' },
    { id: 'extend', label: 'Extend a run', description: 'A longer run from an earlier smaller value replaces the cell.' },
    { id: 'tie', label: 'Add a tie', description: 'Another run of the same length adds to the count.' },
    { id: 'done', label: 'Answer', description: 'Add the counts of every cell with the longest length.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array (JSON array of integers, up to 30)',
  url: 'https://leetcode.com/problems/number-of-longest-increasing-subsequence/',
  complexity: 'O(n²) time and O(n) space for the two tables.',
  examples: [
    { label: 'Ties', input: '[2,4,3,5,4,7,2]' },
    { label: 'Flat', input: '[6,6,6,6]' },
    { label: 'Zigzag', input: '[3,1,2,1,4]' },
  ],
}

export default function NumberOfLis() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const labels = run.input.map(String)
    const related = step.j !== null ? [{ row: 0, column: step.j }] : []
    return <>
      <DPTable title="Longest run length and count ending at each value" values={step.table} rowLabels={['length', 'count']}
        columnLabels={labels} activeCell={step.i !== null ? { row: 0, column: step.i } : null} relatedCells={related} />
      <output aria-label="Current cell">{step.i !== null ? `Ending at ${run.input[step.i]}: length ${step.table[0][step.i]}, count ${step.table[1][step.i]}` : 'Start of the table'}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why two tables:</strong> the length says how far a run can reach, and the count keeps every run of that length, which the answer must add up.</p>
  </>} />
}
