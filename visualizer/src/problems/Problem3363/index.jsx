import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Diagonal', description: 'The first child collects the main diagonal.' },
    { id: 'improve', label: 'Better pair', description: 'This pair of paths collects more fruit than any earlier pair.' },
    { id: 'done', label: 'Complete', description: 'Report the largest total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Fruit grid (JSON object with a square fruits grid of 0 to 99, 2 to 5 on a side)',
  url: 'https://leetcode.com/problems/find-the-maximum-number-of-fruits-collected/',
  complexity: 'O(3^n * 3^n * n^2) time by enumerating paths; the visualization caps the grid at 5 by 5.',
  examples: [
    { label: 'Official', input: '{"fruits":[[1,2,3,4],[5,6,8,7],[9,10,11,12],[13,14,15,16]]}' },
    { label: 'Two by two', input: '{"fruits":[[1,2],[3,4]]}' },
  ],
}

export default function MaxFruitsCollected() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.fruits} label="Fruit (highlighted cells are collected)" highlightedCells={step.cells.map(([row, col]) => ({ row, col }))} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>The first child moves diagonally, so its path is fixed. The other two children each choose among a few paths, and every cell they visit is counted once.</p>
    <p>The search keeps the largest total over all pairs of paths, using the union of the cells on all three paths.</p>
  </>} />
}
