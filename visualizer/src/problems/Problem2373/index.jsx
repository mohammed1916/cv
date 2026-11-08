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
    { label: 'Own: three by three grid', input: '{"grid":[[4,7,2],[9,1,5],[3,8,6]]}' },
    { label: 'Own: ring with a centre value', input: '{"grid":[[2,2,2],[2,5,2],[2,2,2]]}' },
    { label: 'Smallest 3 by 3 grid', input: '{"grid":[[1,2,3],[4,5,6],[7,8,9]]}' },
    { label: 'All values equal', input: '{"grid":[[5,5,5],[5,5,5],[5,5,5]]}' },
    { label: 'Largest values, 7 by 7', input: '{"grid":[[100,1,100,1,100,1,100],[1,100,1,100,1,100,1],[100,1,100,1,100,1,100],[1,100,1,100,1,100,1],[100,1,100,1,100,1,100],[1,100,1,100,1,100,1],[100,1,100,1,100,1,100]]}' },
    { label: 'Long run: 7 by 7 grid', input: '{"grid":[[45,62,98,97,65,44,13],[100,73,4,66,59,79,25],[66,6,21,44,5,93,96],[45,43,31,55,12,31,89],[39,96,95,83,52,58,29],[48,18,22,41,93,13,16],[57,26,40,27,47,91,12]]}' },
  ],
}

export default function LargestLocalValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const window = []
    if (step.top >= 0) for (let a = step.top; a < step.top + 3; a++) for (let b = step.left; b < step.left + 3; b++) window.push({ row: a, col: b })
    return <>
      <p>{`top = ${step.top}, left = ${step.left} (3 by 3 window)`}</p>
      <MatrixGrid label="Input grid" matrix={run.input.grid} highlightedCells={window} activeCell={step.top >= 0 ? { row: step.top + 1, col: step.left + 1 } : null} />
      <MatrixGrid label="Largest local values" matrix={step.answer} tone="accent" showRowLabels={false} />
    </>
  }} renderReasoning={() => <>
    <p>Each answer entry is the maximum of the 3 by 3 block whose top-left corner is at the same position, so the answer is one row and one column smaller than the grid.</p>
    <p>The highlighted center cell marks the middle of the current window.</p>
  </>} />
}
