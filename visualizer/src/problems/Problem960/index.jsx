import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Single columns', description: 'Each column alone is a chain of length 1.' },
    { id: 'fill', label: 'Extend chains', description: 'Attach this column to an earlier one when every row stays sorted.' },
    { id: 'done', label: 'Best chain', description: 'The longest chain gives the columns to keep.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Strings (JSON array)',
  url: 'https://leetcode.com/problems/delete-columns-to-make-sorted-iii/',
  complexity: 'O(rows * columns^2) time. The visualization caps the grid at 6 rows and 10 columns.',
  examples: [
    { label: 'Example 1', input: '["babca","bbazb"]' },
    { label: 'Descending', input: '["edcba"]' },
  ],
}

export default function DeleteColumnsIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Columns" length={run.cols} active={step.column ?? -1} valueAt={i => `col ${i}`} />
    <IndexedSequence label="Longest kept chain ending at each column" length={run.cols} active={step.column ?? -1} valueAt={i => step.dp[i]} />
    <output aria-label="Result">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Keeping columns in order is valid only if every row is sorted across the kept columns. That condition is checked between consecutive kept columns, so a longest-chain DP over columns finds the answer.</p>
    <p>The number of deletions is the number of columns minus the longest chain.</p>
  </>} />
}
