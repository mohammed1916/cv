import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Single stones', description: 'A segment of one stone scores nothing.' },
    { id: 'split', label: 'Try a split', description: 'Compare the two parts and add the score of the part Alice keeps.' },
    { id: 'interval', label: 'Segment best', description: 'Keep the best split for this segment.' },
    { id: 'done', label: 'Complete', description: 'Report the best score for the whole row.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Stones (JSON object with stones as a list of positive values)',
  url: 'https://leetcode.com/problems/stone-game-v/',
  complexity: 'O(n^3) time and O(n^2) space. The visualization caps input at 8 stones.',
  examples: [
    { label: 'Six stones', input: '{"stones":[6,2,3,4,5,5]}' },
    { label: 'Seven equal', input: '{"stones":[7,7,7,7,7,7,7]}' },
  ],
}

export default function StoneGameV() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <DPTable title="best[i][j]: score from stones i to j" values={step.table}
      rowLabels={step.table.map((_, i) => i + 1)} columnLabels={step.table.map((_, j) => j + 1)}
      activeCell={step.cell ? { row: step.cell[0], column: step.cell[1] } : null} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Bob always throws away the larger part, so Alice scores the smaller part and continues in it.</p>
    <p>A segment's best score is the best split: the smaller side's sum plus the best score of the side that is kept. A tie lets Alice pick the better side.</p>
  </>} />
}
