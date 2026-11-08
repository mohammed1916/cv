import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Own case 1', input: '{"arr":[2,4,3,1],"mat":[[2,3],[1,4]]}' },
    { label: 'Own case 2', input: '{"arr":[9,6,5,3,1,4,7,8,2],"mat":[[8,7,9],[1,4,6],[3,2,5]]}' },
    { label: 'Single cell', input: '{"arr":[1],"mat":[[1]]}' },
    { label: 'Row-shaped 1 by 6', input: '{"arr":[6,5,4,3,2,1],"mat":[[1,2,3,4,5,6]]}' },
    { label: 'Largest grid: 6 by 6', input: '{"arr":[36,35,34,33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1],"mat":[[1,2,3,4,5,6],[7,8,9,10,11,12],[13,14,15,16,17,18],[19,20,21,22,23,24],[25,26,27,28,29,30],[31,32,33,34,35,36]]}' },
    { label: 'Long run: 6 by 6 shuffled', input: '{"arr":[1,31,12,3,27,30,9,25,5,7,18,10,2,15,33,36,28,13,29,23,11,6,21,19,17,35,32,8,4,24,14,26,20,34,22,16],"mat":[[2,9,34,30,8,15],[10,18,28,3,5,17],[14,33,4,13,23,12],[25,31,24,7,35,27],[36,16,11,22,21,26],[6,20,32,19,1,29]]}' },
  ],
}

export default function FirstPainted() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const painted = step.painted.map(({ row, col }) => ({ row, col }))
    return <>
      <IndexedSequence label="Paint order (arr)" length={run.input.arr.length} valueAt={i => run.input.arr[i]} active={step.index} />
      <MatrixGrid label="Matrix" matrix={run.input.mat} highlightedCells={painted}
        activeCell={step.row >= 0 ? { row: step.row, col: step.col } : null} />
      <output aria-label="Paint status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each value is painted at a known cell. A row is complete when its count reaches the number of columns, and a column is complete when its count reaches the number of rows.</p>
    <p>Counting instead of rescanning the grid after each paint keeps every step constant time.</p>
  </>} />
}
