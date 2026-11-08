import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no best placement.' },
    { id: 'rows', label: 'Rows', description: 'Try every column choice for one set of three rows.' },
    { id: 'done', label: 'Complete', description: 'Report the best placement found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid, a rectangle of integers from -9 to 9 with 3 to 6 rows and columns, for example {"grid":[[1,2,3],[4,5,6],[7,8,9]]}',
  url: 'https://leetcode.com/problems/maximum-value-sum-by-placing-three-rooks-i/',
  complexity: 'O(m^3 * n^3) time with this enumeration. The visualization caps the board at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[-3,1,1,-3],[-3,1,-3,1],[-3,2,1,2]]}' },
    { label: 'Example 2', input: '{"grid":[[1,2,3],[4,5,6],[7,8,9]]}' },
    { label: 'All zero grid', input: '{"grid":[[0,0,0],[0,0,0],[0,0,0]]}' },
    { label: 'Equal values', input: '{"grid":[[5,5,5],[5,5,5],[5,5,5]]}' },
    { label: 'Extreme values', input: '{"grid":[[-9,9,-9,9,-9,9],[9,-9,9,-9,9,-9],[-9,9,-9,9,-9,9],[9,-9,9,-9,9,-9],[-9,9,-9,9,-9,9],[9,-9,9,-9,9,-9]]}' },
    { label: 'Long run: generated 6x6 grid', input: '{"grid":[[5,7,-8,-9,-8,5],[-8,8,1,7,7,8],[-3,-4,3,6,3,4],[-7,-1,-9,6,0,-3],[-3,1,1,8,-5,-8],[-2,7,8,-4,-5,0]]}' },
  ],
}

const toCell = ([row, col]) => ({ row, col })

export default function ThreeRooks() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.input.grid} label="Board (best placement shown)" highlightedCells={step.cells.map(toCell)} />
    <output aria-label="Best sum">{`Best sum so far: ${step.best ?? 'none yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Three rooks that do not attack each other use three different rows and three different columns, so the choice is a set of rows and an assignment of columns.</p>
    <p>Trying every set of three rows, and every column assignment with no repeats, covers all valid placements.</p>
  </>} />
}
