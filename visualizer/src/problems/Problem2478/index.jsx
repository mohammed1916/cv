import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'Zero digits split into zero parts in one way.' },
    { id: 'skip', label: 'Prime end', description: 'A part cannot end on a prime digit.' },
    { id: 'cell', label: 'Fill cell', description: 'Sum the ways that end just before a valid part starting on a prime digit.' },
    { id: 'done', label: 'Complete', description: 'Report the ways for k parts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (digits 1 to 9), k and min_length (JSON)',
  url: 'https://leetcode.com/problems/number-of-beautiful-partitions/',
  complexity: 'O(n^2 * k) time and O(n * k) space. The visualization caps n at 12, k at 6 and min_length at 6.',
  examples: [
    { label: 'Example 1', input: '{"s":"23542185131","k":3,"min_length":2}' },
    { label: 'Example 2', input: '{"s":"2468","k":1,"min_length":4}' },
  ],
}

export default function NumberOfBeautifulPartitions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title={`Ways by end position (rows) and parts (columns), s = ${run.input.s}`} values={step.table}
      activeCell={step.parts > 0 ? { row: step.end, column: step.parts } : null} />
    <output aria-label="Result">{step.total === null ? `Ending at digit ${step.end} of ${run.input.s.length}` : `Answer: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A beautiful part starts with a prime digit and ends with a non-prime digit, so a cut is allowed only where the digit before it is non-prime.</p>
    <p>Each cell adds up the ways to finish the earlier prefix with one fewer part, using only starts that leave the part long enough.</p>
  </>} />
}
