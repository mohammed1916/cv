import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Mines are zeros.' },
    { id: 'arm', label: 'Measure plus', description: 'Extend the four arms while every cell is a 1.' },
    { id: 'skip', label: 'Mine', description: 'A mine cannot be a centre.' },
    { id: 'done', label: 'Complete', description: 'The largest arm length is the order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'n and mines (JSON object)',
  url: 'https://leetcode.com/problems/largest-plus-sign/',
  complexity: 'O(n^3) for this direct version; a run-length table gives O(n^2).',
  examples: [
    { label: 'Central', input: '{"n":5,"mines":[[1,1],[3,3]]}' },
    { label: 'Dense', input: '{"n":4,"mines":[[0,0],[2,3]]}' }, { label: 'Single cell', input: '{"n":1,"mines":[]}' }, { label: 'One mine in a 2 by 2 grid', input: '{"n":2,"mines":[[0,0]]}' }, { label: 'No plus fits', input: '{"n":2,"mines":[[0,0],[0,1],[1,0],[1,1]]}' }, { label: 'Long run: 12 by 12 with 20 mines', input: '{"n":12,"mines":[[1,3],[4,10],[5,7],[5,5],[8,8],[9,7],[3,5],[10,3],[9,3],[9,10],[0,10],[6,11],[6,5],[1,4],[4,2],[9,11],[10,7],[7,1],[3,9],[3,1]]}' },
  ],
}

export default function LargestPlusSign() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Grid (1 = open, 0 = mine)" matrix={step.grid}
      activeCell={step.cell ? { row: step.cell[0], col: step.cell[1] } : null}
      highlightedCells={step.bestCell && step.phase === 'done' ? [{ row: step.bestCell[0], col: step.bestCell[1] }] : []} />
    <output aria-label="Best order">{`Best order so far: ${step.best}${step.bestCell ? ` at (${step.bestCell[0]}, ${step.bestCell[1]})` : ''}`}</output>
    <p role="status">{step.message}</p>
    <p>{`Grid size ${run.input.n} by ${run.input.n}.`}</p>
  </>} renderReasoning={() => <>
    <p>Each cell can be the centre of a plus whose order is the shortest arm among its four directions, because a single mine on any arm stops the plus.</p>
  </>} />
}
