import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Keep a short list of the largest distinct sums.' },
    { id: 'rhombus', label: 'Rhombus', description: 'Sum one rhombus border and update the top three.' },
    { id: 'done', label: 'Complete', description: 'Report the three largest distinct sums.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with a grid of positive integers',
  url: 'https://leetcode.com/problems/get-biggest-three-rhombus-sums-in-a-grid/',
  complexity: 'O(mn * min(m, n)) time for all borders, with a constant-size top list. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[3,4,5,1,3],[3,3,4,2,3],[20,1,0,3,4]]}' },
    { label: 'Single row', input: '{"grid":[[7,7,7]]}' },
  ],
}

export default function BiggestRhombusSums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Grid" matrix={run.input.grid} highlightedCells={step.cells.map(([row, col]) => ({ row, col }))} />
    <output aria-label="Top three sums">{`Top sums: ${step.top.join(', ') || '(none yet)'}${step.sum !== null ? `. This rhombus: ${step.sum}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A rhombus is the border of a diamond around a center cell. Radius 0 is the center cell alone, and each larger radius adds one ring of four edges.</p>
    <p>Only distinct sums count, so the list keeps the three largest values seen so far.</p>
  </>} />
}
