import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No cell has been checked yet.' },
    { id: 'local', label: 'Local maximum', description: 'No cell in this cell’s square is larger.' },
    { id: 'beaten', label: 'Beaten', description: 'A larger value sits inside this cell’s square.' },
    { id: 'done', label: 'Return', description: 'Report the number of local maximums.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON: {"matrix": [[...]]}',
  url: 'https://leetcode.com/problems/largest-local-values-in-a-matrix-ii/',
  complexity: 'O(n^2 * m^2) time in the worst case with the square scan, and O(1) extra space. The visualization caps the matrix at 7 by 7.',
  examples: [
    { label: 'Example 2', input: '{"matrix":[[1,2],[3,4]]}' },
    { label: 'Example 3', input: '{"matrix":[[1,0,1],[0,1,0],[1,0,1]]}' },
  ],
}

export default function LargestLocalValuesII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Matrix" matrix={run.input.matrix} activeCell={step.cell} />
    <output aria-label="Step message">{`Count: ${step.count}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>A cell's own value sets the size of its square, and the square's outer ring of corner cells is excluded.</p>
    <p>A cell is counted only if no cell in its square has a larger value, so one larger value anywhere in the square rules the cell out.</p>
  </>} />
}
