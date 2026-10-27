import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Board', description: 'Start with the given candies.' },
    { id: 'mark', label: 'Find runs', description: 'Mark every candy in a run of three or more equal candies.' },
    { id: 'clear', label: 'Crush', description: 'Marked candies become empty.' },
    { id: 'drop', label: 'Gravity', description: 'Candies fall into the empty cells below them.' },
    { id: 'done', label: 'Stable', description: 'No run of three remains.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Board (JSON array of arrays, 0 = empty)',
  url: 'https://leetcode.com/problems/candy-crush/',
  complexity: 'Each round scans the board; the number of rounds is bounded by the board size. The visualization caps the board at 8 by 8.',
  examples: [
    { label: 'Single run', input: '[[1,1,1]]' },
    { label: 'Falling candies', input: '[[1,1,1,2],[2,2,2,3]]' },
  ],
}

export default function CandyCrush() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DPTable title={`Board after round ${step.round}`} values={step.board} relatedCells={step.crushed} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Every run of three or more equal candies is crushed at the same time, and the candies above fall down. Runs can appear after a fall, so the process repeats.</p>
    <p>The board is stable when a scan finds no run of three.</p>
  </>} />
}
