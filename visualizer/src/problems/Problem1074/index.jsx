import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the count to zero and choose the rows to collapse.' },
    { id: 'band', label: 'Row band', description: 'Collapse rows top to bottom into column sums and count target subarrays.' },
    { id: 'done', label: 'Complete', description: 'Report the number of submatrices.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Matrix and target (JSON)',
  url: 'https://leetcode.com/problems/number-of-submatrices-that-sum-to-target/',
  complexity: 'O(rows^2 * cols) time and O(cols) extra space. The visualization caps input at 6 by 6 with values from -9 to 9.',
  examples: [
    { label: 'Mixed signs, target six', input: '{"matrix":[[3,-1,4],[1,0,2],[-2,5,1]],"target":6}' },
    { label: 'Pair', input: '{"matrix":[[1,-1],[-1,1]],"target":0}' },
    { label: 'Single cell', input: '{"matrix":[[5]],"target":5}' },
    { label: 'Extreme values, target zero', input: '{"matrix":[[-9,9],[9,-9]],"target":0}' },
    { label: 'Largest grid, repeated rows', input: '{"matrix":[[1,2,3,4,5,6],[1,2,3,4,5,6],[1,2,3,4,5,6],[1,2,3,4,5,6],[1,2,3,4,5,6],[1,2,3,4,5,6]],"target":12}' },
    { label: 'Long run: 6 by 6 mixed signs', input: '{"matrix":[[-1,6,2,-2,-3,3],[-9,-9,-5,-6,7,1],[-5,7,7,-9,-8,6],[7,-9,0,6,2,-7],[-8,7,-8,3,-7,-9],[3,-9,4,-1,4,-4]],"target":7}' },
  ],
}

export default function SubmatricesSumToTarget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const highlighted = []
    if (step.top >= 0) for (let r = step.top; r <= step.bottom; r++) for (let c = 0; c < run.input.matrix[0].length; c++) highlighted.push({ row: r, col: c })
    return <>
      <MatrixGrid matrix={run.input.matrix} label="Matrix (rows in the highlighted band)" highlightedCells={highlighted} cellWidth={44} cellHeight={40} />
      <IndexedSequence label="Column sums across the band" length={run.input.matrix[0].length} valueAt={i => step.columnSums[i] ?? '-'} />
      <output aria-label="Count">{`Matches so far: ${step.count} (target ${run.input.target})`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>With the rows fixed, a submatrix is a contiguous run of column sums. A running sum minus the target has been seen before exactly when a matching earlier prefix exists, so a map counts them in one pass.</p>
  </>} />
}
