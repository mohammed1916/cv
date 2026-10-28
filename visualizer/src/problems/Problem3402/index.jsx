import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the top of the first column.' },
    { id: 'cell', label: 'Cell', description: 'Raise this cell until it is above the cell before it.' },
    { id: 'done', label: 'Complete', description: 'Report the total number of increments.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid, a rectangle of integers from 0 to 9, for example {"grid":[[3,2],[1,3],[3,4],[0,1]]}',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-columns-strictly-increasing/',
  complexity: 'O(m * n) time and O(1) extra space. The visualization caps the grid at 5 by 5.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[3,2],[1,3],[3,4],[0,1]]}' },
    { label: 'Example 2', input: '{"grid":[[3,2,1],[0,3,2]]}' },
  ],
}

const toCell = ([row, col]) => ({ row, col })

export default function StrictlyIncreasingColumns() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.input.grid} label="Grid (values as given)"
      activeCell={step.cell ? toCell(step.cell) : null} />
    <output aria-label="Increments">{`Increments so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each column is independent, so the work goes top to bottom in each column.</p>
    <p>A cell that is not above the cell before it is raised to exactly one more than that cell, the smallest change that works.</p>
  </>} />
}
