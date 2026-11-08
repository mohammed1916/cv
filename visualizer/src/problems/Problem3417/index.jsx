import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the top-left corner with the position counter at zero.' },
    { id: 'keep', label: 'Keep', description: 'An even position is kept.' },
    { id: 'skip', label: 'Skip', description: 'An odd position is skipped.' },
    { id: 'done', label: 'Complete', description: 'Return the kept values in traversal order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"grid": [[...], ...]}',
  url: 'https://leetcode.com/problems/zigzag-grid-traversal-with-skip/',
  complexity: 'One pass over the cells: O(m n) time. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,2],[3,4]]}' },
    { label: 'Example 2', input: '{"grid":[[2,1],[2,1],[2,1]]}' },
    { label: 'Single cell', input: '{"grid":[[7]]}' },
    { label: 'Equal cells tie', input: '{"grid":[[5,5],[5,5]]}' },
    { label: 'Extreme cell values', input: '{"grid":[[100,1,100,1,100,1],[100,1,100,1,100,1],[100,1,100,1,100,1],[100,1,100,1,100,1],[100,1,100,1,100,1],[100,1,100,1,100,1]]}' },
    { label: 'Long run: 6 by 6', input: '{"grid":[[53,44,48,20,100,6],[91,10,86,33,91,4],[25,2,13,62,41,49],[70,59,74,7,12,54],[81,2,34,64,51,76],[30,40,58,6,6,2]]}' },
  ],
}

export default function ZigzagSkip() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.input.grid} label="Grid" activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null} cellWidth={44} cellHeight={40} />
    <output aria-label="Kept">{`Position ${step.index ?? '-'}; kept so far: ${step.kept.join(', ') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>The zigzag order reverses every odd row, so the position counter follows the snake path rather than the row layout.</p>
    <p>Keeping even positions takes the first, third, fifth cell and so on along that path.</p>
  </>} />
}
