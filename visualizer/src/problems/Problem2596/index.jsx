import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The move numbers must begin at the top-left cell with 0.' },
    { id: 'check', label: 'Check move', description: 'Compare the cells of move k and move k plus 1.' },
    { id: 'fail', label: 'Not a tour', description: 'A consecutive pair is not a knight move.' },
    { id: 'done', label: 'Complete', description: 'Every move is a knight move.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with grid (n by n, values 0 to n squared minus 1)',
  url: 'https://leetcode.com/problems/check-knight-tour-configuration/',
  complexity: 'O(n^2) time and space. The visualization caps the grid at 7 by 7.',
  examples: [
    { label: 'Valid tour', input: '{"grid":[[0,11,16,5,20],[17,4,19,10,15],[12,1,8,21,6],[3,18,23,14,9],[24,13,2,7,22]]}' },
    { label: 'Not a tour', input: '{"grid":[[0,3,6],[5,8,1],[2,7,4]]}' },
  ],
}

export default function KnightTour() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Move numbers" matrix={run.input.grid}
      activeCell={step.to ? { row: step.to[0], col: step.to[1] } : null}
      highlightedCells={step.from ? [{ row: step.from[0], col: step.from[1] }] : []} cellWidth={44} cellHeight={40} />
    <output aria-label="Move check">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A valid configuration is a knight's tour: move 0 sits in the corner, and every later number sits one knight move from the number before it.</p>
    <p>Checking the consecutive pairs in order is enough, because the grid already holds each number exactly once.</p>
  </>} />
}
