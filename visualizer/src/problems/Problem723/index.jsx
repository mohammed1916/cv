import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Board', description: 'Look for runs of three or more.' },
    { id: 'mark', label: 'Mark runs', description: 'Every candy in a run is marked at once.' },
    { id: 'clear', label: 'Clear', description: 'Marked cells become empty.' },
    { id: 'drop', label: 'Fall', description: 'Candies fall down their columns.' },
    { id: 'done', label: 'Stable', description: 'No run is left on the board.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Board (JSON array of rows, 0 = empty)',
  url: 'https://leetcode.com/problems/candy-crush/',
  complexity: 'O(rows * cols) per round, with at most one round per cleared layer.',
  examples: [
    { label: 'Two rounds', input: '[[1,2,3,4],[1,5,5,5],[2,3,4,4],[2,3,4,4]]' },
    { label: 'Column', input: '[[3,1],[3,2],[3,1],[1,2]]' },
  ],
}

export default function CandyCrush() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <MatrixGrid label={`Board, round ${step.round}`} matrix={step.board}
      highlightedCells={step.crushed.map(([row, col]) => ({ row, col }))} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A round marks every candy inside a horizontal or vertical run of three equal values, then clears those cells at the same time.</p>
    <p>Gravity then makes the remaining candies fall, and the process repeats until no run is left.</p>
  </>} />
}
