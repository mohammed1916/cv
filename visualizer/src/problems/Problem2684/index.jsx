import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First column', description: 'Every cell in the first column starts with zero moves.' },
    { id: 'cell', label: 'Cell', description: 'Look at the three cells to the left that hold a smaller value.' },
    { id: 'done', label: 'Complete', description: 'Report the most moves that reach any cell.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON object with grid rows of integers from 1 to 99, up to 6 by 6)',
  url: 'https://leetcode.com/problems/maximum-number-of-moves-in-a-grid/',
  complexity: 'O(m * n) time with three neighbours per cell. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Official', input: '{"grid":[[2,4,3,5],[5,4,9,3],[3,4,2,11],[10,9,13,15]]}' },
    { label: 'No move', input: '{"grid":[[3,2,4],[2,1,9],[1,1,7]]}' },
  ],
}

export default function MaxMoves() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.grid} label="Grid" activeCell={{ row: step.row, col: step.col }} />
    <MatrixGrid matrix={step.table} label="Moves needed to reach each cell (· = not reached)" activeCell={{ row: step.row, col: step.col }} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A move goes one column right and up to one row up or down, and only to a strictly larger value.</p>
    <p>Sweeping left to right, each cell takes one more than the best reached neighbour on the left that holds a smaller value.</p>
  </>} />
}
