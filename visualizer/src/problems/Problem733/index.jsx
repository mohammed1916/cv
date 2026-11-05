import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start pixel', description: 'Remember the colour being replaced.' },
    { id: 'paint', label: 'Paint', description: 'A neighbour of the old colour gets the new colour.' },
    { id: 'visit', label: 'Expand', description: 'Check the four neighbours of the next cell on the stack.' },
    { id: 'done', label: 'Complete', description: 'Return the repainted image.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'image, sr, sc and color (JSON object)',
  url: 'https://leetcode.com/problems/flood-fill/',
  complexity: 'O(rows * columns) time and O(rows * columns) space for the stack in the worst case.',
  examples: [
    { label: 'Corner fill', input: '{"image":[[3,3,0],[3,0,0],[0,3,3]],"sr":0,"sc":0,"color":7}' },
    { label: 'Ring', input: '{"image":[[5,5,5],[5,1,5],[5,5,5]],"sr":0,"sc":1,"color":9}' },
    { label: 'Same colour', input: '{"image":[[4,4],[4,2]],"sr":0,"sc":0,"color":4}' },
  ],
}

export default function FloodFill() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Image (the fill frontier is on the stack)" matrix={step.grid}
      activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null}
      highlightedCells={step.painted.map(([row, col]) => ({ row, col }))}
      dimmedCells={[]} />
    <p><strong>Stack:</strong> {step.stack.length ? step.stack.map(([r, c]) => `(${r}, ${c})`).join(' ') : 'empty'}</p>
    <output aria-label="Message">{step.message}</output>
    <p>{`Start (${run.input.sr}, ${run.input.sc}) replaces ${run.input.image[run.input.sr][run.input.sc]} with ${run.input.color}.`}</p>
  </>} renderReasoning={() => <>
    <p>A pixel is repainted only when it is connected to the start through pixels of the old colour along sides, not diagonals.</p>
    <p>The stack holds painted pixels whose neighbours are not yet checked. When it empties, the whole connected region has been reached.</p>
  </>} />
}
