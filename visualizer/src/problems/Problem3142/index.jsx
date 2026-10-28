import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the top-left cell.' },
    { id: 'check', label: 'Check cells', description: 'Compare each cell with the cell below and the cell to its right.' },
    { id: 'fail', label: 'Violation', description: 'A cell breaks a rule, so the answer is false.' },
    { id: 'done', label: 'Complete', description: 'Every cell passes both checks.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a grid of digits',
  url: 'https://leetcode.com/problems/check-if-grid-satisfies-conditions/',
  complexity: 'O(mn) time and O(1) extra space. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Satisfies', input: '{"grid":[[1,0,2],[1,0,2],[1,0,2]]}' },
    { label: 'Fails below', input: '{"grid":[[1,1,1],[0,0,0],[0,0,0]]}' },
  ],
}

export default function CheckGridConditions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Grid" matrix={run.input.grid} activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null}
      foundCell={step.ok === false && step.cell ? { row: step.cell[0], col: step.cell[1] } : null} />
    <output aria-label="Check status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each cell is compared with the cell directly below it, which must be equal, and with the cell directly to its right, which must be different.</p>
    <p>The first cell that breaks a rule settles the answer, so the scan stops there.</p>
  </>} />
}
