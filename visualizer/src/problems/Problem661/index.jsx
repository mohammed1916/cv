import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Blank output', description: 'The smoothed image starts empty.' },
    { id: 'cell', label: 'Average a cell', description: 'Highlight the neighbourhood and take the floor of its average.' },
    { id: 'done', label: 'Smoothed', description: 'Every pixel has been replaced.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Image (JSON array of equal-length rows)',
  url: 'https://leetcode.com/problems/image-smoother/',
  complexity: 'O(rows × cols) time and O(rows × cols) space for the output.',
  examples: [
    { label: 'Dark centre', input: '[[2,4,6],[4,0,4],[6,4,2]]' },
    { label: 'Corner', input: '[[9,9],[9,1]]' },
    { label: 'Row', input: '[[5,10,15,20]]' },
  ],
}

export default function ImageSmoother() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Input image" matrix={run.input} activeCell={step.row === null ? null : { row: step.row, col: step.col }}
      highlightedCells={step.cells} />
    <MatrixGrid label="Smoothed output" matrix={step.out} activeCell={step.row === null ? null : { row: step.row, col: step.col }} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why fewer neighbours at the edge:</strong> only cells that exist are averaged, so a corner uses four values and an edge uses six.</p>
  </>} />
}
