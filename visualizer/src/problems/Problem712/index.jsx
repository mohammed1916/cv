import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefixes', description: 'Fill the first row and column with running ASCII sums.' },
    { id: 'match', label: 'Match', description: 'Equal characters are kept without cost.' },
    { id: 'choose', label: 'Choose delete', description: 'Pay for the cheaper of the two deletions.' },
    { id: 'done', label: 'Complete', description: 'The bottom-right cell is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two strings (JSON object with s1 and s2)',
  url: 'https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/',
  complexity: 'O(m * n) time and O(m * n) space for the table.',
  examples: [
    { label: 'Gap', input: '{"s1":"tree","s2":"tea"}' },
    { label: 'Swap', input: '{"s1":"cab","s2":"abc"}' },
  ],
}

export default function MinimumAsciiDeleteSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="dp table: rows follow s1, columns follow s2" matrix={step.table}
      activeCell={step.row ? { row: step.row, col: step.column } : null}
      highlightedCells={step.sources.map(([row, col]) => ({ row, col }))} />
    <p><strong>Characters now:</strong> s1[{step.row - 1 >= 0 ? step.row - 1 : '–'}] = {step.row ? `'${run.input.s1[step.row - 1]}'` : '–'}, s2[{step.column - 1 >= 0 ? step.column - 1 : '–'}] = {step.column ? `'${run.input.s2[step.column - 1]}'` : '–'}</p>
    <output aria-label="Result">{step.phase === 'done' ? `Answer: ${step.result}` : `Cell [${step.row}, ${step.column}] = ${step.table[step.row]?.[step.column] ?? 0}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>Row i and column j describe the prefixes s1[0..i) and s2[0..j). Each cell is the cheapest total of deleted ASCII codes that makes those prefixes equal.</p>
    <p>Highlighted cells are the ones this cell reads. A matching pair copies the diagonal; a mismatch pays the cheaper of the two deletions.</p>
    {step.phase === 'done' && <p>The answer sits in the bottom-right cell, after both prefixes are complete.</p>}
  </>} />
}
