import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Single pieces', description: 'Any prefix can be one piece.' },
    { id: 'extend', label: 'Extend', description: 'Add a piece after an earlier piece whose sum does not exceed it.' },
    { id: 'done', label: 'Complete', description: 'Report the most pieces.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of positive integers (JSON array, up to 8 entries)',
  url: 'https://leetcode.com/problems/find-maximum-non-decreasing-array-length/',
  complexity: 'O(n^3) time in this direct form and O(n^2) space for the table. The visualization caps input at 8 entries.',
  examples: [
    { label: 'Example 1', input: '[5,2,2]' },
    { label: 'Merge the middle', input: '[4,3,2,6]' },
  ],
}

export default function NonDecreasingPieces() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DPTable title="ways[i][j]: most pieces for the first i numbers whose last piece starts at j"
      values={step.ways.map(row => row.map(v => (v === null ? '-' : v)))}
      rowLabels={step.ways.map((_, i) => i)}
      activeCell={step.start !== null && step.end > 0 ? { row: step.end, column: step.start } : null} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Merging neighbours is the same as cutting the array into contiguous pieces and replacing each piece by its sum.</p>
    <p>The last piece must not have a smaller sum than the piece before it, so the table remembers where the last piece starts.</p>
  </>} />
}
