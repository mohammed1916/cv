import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the costs before the first column.' },
    { id: 'column', label: 'Column', description: 'Price each colour for this column.' },
    { id: 'done', label: 'Complete', description: 'Report the cheapest total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON object with grid)',
  url: 'https://leetcode.com/problems/minimum-number-of-operations-to-satisfy-conditions/',
  complexity: 'O(m * n * 10^2) time and O(10) space in this trace. The visualization caps the grid at 4 by 4.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,0,2],[1,0,2]]}' },
    { label: 'Example 2', input: '{"grid":[[1,1,1],[0,0,0]]}' },
  ],
}

export default function SatisfyConditions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <output aria-label="Column costs">{step.column < 0 ? 'Before the first column' : `Column ${step.column}: ${step.previous.join(', ')}`}</output>
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each column takes one colour, and the cost is the number of cells that must change to that colour; neighbouring columns cannot share a colour.</p>
  </>} />
}
