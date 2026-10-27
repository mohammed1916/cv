import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the count to zero.' },
    { id: 'cell', label: 'Corner', description: 'Count X and Y in the rectangle from the top-left corner to this cell.' },
    { id: 'done', label: 'Complete', description: 'Report the number of qualifying submatrices.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid of X, Y and . rows (JSON)',
  url: 'https://leetcode.com/problems/count-submatrices-with-equal-frequency-of-x-and-y/',
  complexity: 'O(m * n) time and space with two prefix-count tables. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example', input: '{"grid":["XY.","Y.."]}' },
    { label: 'No X', input: '{"grid":["..",".."]}' },
  ],
}

export default function EqualXY() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const cells = run.input.grid.map(row => [...row].map(ch => ch))
    const active = step.cell ? { row: step.cell[0], col: step.cell[1] } : null
    const highlighted = []
    if (step.cell) for (let r = 0; r <= step.cell[0]; r++) for (let c = 0; c <= step.cell[1]; c++) highlighted.push({ row: r, col: c })
    return <>
      <MatrixGrid matrix={cells} label="Grid" activeCell={active} highlightedCells={highlighted} cellWidth={40} cellHeight={40} />
      {step.diff && <MatrixGrid matrix={step.diff} label="X minus Y in each rectangle from the top-left" activeCell={active} cellWidth={40} cellHeight={40} />}
      <output aria-label="Count">{`Qualifying submatrices so far: ${step.count}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each submatrix containing the top-left cell is a rectangle from (0, 0). Its X count and Y count come from prefix tables, so each corner is checked in constant time.</p>
  </>} />
}
