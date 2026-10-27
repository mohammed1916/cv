import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Land on the border can never be enclosed.' },
    { id: 'seed', label: 'Border land', description: 'Mark each border land cell as reachable from outside.' },
    { id: 'expand', label: 'Flood', description: 'Spread the mark to connected land.' },
    { id: 'count', label: 'Count', description: 'Count the land that was never marked.' },
    { id: 'done', label: 'Complete', description: 'Report the number of enclaves.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid of 0 (water) and 1 (land) as JSON, e.g. {"grid": [[0,1],[1,0]]}',
  url: 'https://leetcode.com/problems/number-of-enclaves/',
  complexity: 'O(m * n) time and space. The visualization caps the grid at 8 by 8.',
  examples: [
    { label: 'Example 1', input: '{"grid": [[0,0,0,0],[1,0,1,0],[0,1,1,0],[0,0,0,0]]}' },
    { label: 'Example 2', input: '{"grid": [[0,1,1,0],[0,0,1,0],[0,0,1,0],[0,0,0,0]]}' },
  ],
}

const toCell = ([row, col]) => ({ row, col })

export default function NumberOfEnclaves() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <MatrixGrid matrix={run.input.grid} label="Grid (marked land is reachable from outside)"
        highlightedCells={step.reached.map(toCell)} activeCell={step.cell ? toCell(step.cell) : null} />
      <output aria-label="Enclaves so far">{`Enclaves counted: ${step.count}`}</output>
    </>
  )} renderReasoning={() => (
    <>
      <p>Land that can walk to the border can escape the grid, so only land that is never reached by a flood from the border is enclosed.</p>
      <p>Starting the flood from every border land cell at once marks all escapable land in a single pass.</p>
    </>
  )} />
}
