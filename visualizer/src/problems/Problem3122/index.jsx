import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecurrenceGrid from '../../components/shared/RecurrenceGrid'
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
    { label: 'Example 1', input: '{"grid":[[3,3,7],[3,6,7],[3,6,6]]}' },
    { label: 'Example 2', input: '{"grid":[[4,4],[5,4]]}' },
    { label: "Single cell", input: "{\"grid\":[[5]]}" },
    { label: "Equal values in a row", input: "{\"grid\":[[2,2]]}" },
    { label: "Largest digits in a 4 by 4 grid", input: "{\"grid\":[[9,0,9,0],[0,9,0,9],[9,0,9,0],[0,9,0,9]]}" },
    { label: "Long run: 4 by 4 grid", input: "{\"grid\":[[7,4,3,0],[3,0,7,6],[7,2,7,2],[5,0,5,4]]}" },
  ],
}

export default function SatisfyConditions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <RecurrenceGrid
        rowLabels={Array.from({ length: 10 }, (_, c) => `colour ${c}`)}
        columnLabels={run.input.grid[0].map((_, j) => `column ${j}`)}
        row={-1}
        column={step.column}
        label="Cheapest cost per colour, column by column"
        valueAt={(r, c) => (step.history[c] ? step.history[c][r] : '')}
        roleAt={(r, c) => (c === step.column ? 'current' : step.history[c] ? 'filled' : '')} />
      <output aria-label="Column costs">{step.column < 0 ? 'Before the first column' : `Column ${step.column}: ${step.previous.join(', ')}`}</output>
    </>
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each column takes one colour, and the cost is the number of cells that must change to that colour; neighbouring columns cannot share a colour.</p>
  </>} />
}
