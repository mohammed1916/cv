import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Locate', description: 'Find each value of arr inside mat.' },
    { id: 'paint', label: 'Paint', description: 'Paint the next cell and update its row and column counts.' },
    { id: 'done', label: 'Complete', description: 'Report the first index that completes a row or column.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with arr (paint order) and mat (grid)',
  url: 'https://leetcode.com/problems/first-completely-painted-row-or-column/',
  complexity: 'O(mn) time and O(m + n) extra space for the counts. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"arr":[1,3,4,2],"mat":[[1,4],[2,3]]}' },
    { label: 'Example 2', input: '{"arr":[2,8,7,4,1,3,5,6,9],"mat":[[3,2,5],[1,4,6],[8,7,9]]}' },
  ],
}

export default function FirstPainted() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const painted = step.painted.map(({ row, col }) => ({ row, col }))
    return <>
      <MatrixGrid label="Matrix" matrix={run.input.mat} highlightedCells={painted}
        activeCell={step.row >= 0 ? { row: step.row, col: step.col } : null} />
      <output aria-label="Paint status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each value is painted at a known cell. A row is complete when its count reaches the number of columns, and a column is complete when its count reaches the number of rows.</p>
    <p>Counting instead of rescanning the grid after each paint keeps every step constant time.</p>
  </>} />
}
