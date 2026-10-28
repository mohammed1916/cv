import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Plan', description: 'Size the answer to the number of 3 by 3 windows.' },
    { id: 'window', label: 'Scan windows', description: 'Take the largest value under each window.' },
    { id: 'done', label: 'Complete', description: 'Return the local maxima grid.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a square grid',
  url: 'https://leetcode.com/problems/largest-local-values-in-a-matrix/',
  complexity: 'O(n^2) windows with 9 comparisons each, so O(9 n^2) time. The visualization caps the grid at 7 by 7.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[9,9,8,1],[5,6,2,6],[8,2,6,4],[6,2,2,2]]}' },
    { label: 'Example 2', input: '{"grid":[[1,1,1,1,1],[1,1,1,1,1],[1,1,2,1,1],[1,1,1,1,1],[1,1,1,1,1]]}' },
  ],
}

export default function LargestLocalValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const window = []
    if (step.top >= 0) for (let a = step.top; a < step.top + 3; a++) for (let b = step.left; b < step.left + 3; b++) window.push({ row: a, col: b })
    return <>
      <MatrixGrid label="Input grid" matrix={run.input.grid} highlightedCells={window} activeCell={step.top >= 0 ? { row: step.top + 1, col: step.left + 1 } : null} />
      <MatrixGrid label="Largest local values" matrix={step.answer} tone="accent" showRowLabels={false} />
    </>
  }} renderReasoning={() => <>
    <p>Each answer entry is the maximum of the 3 by 3 block whose top-left corner is at the same position, so the answer is one row and one column smaller than the grid.</p>
    <p>The highlighted center cell marks the middle of the current window.</p>
  </>} />
}
