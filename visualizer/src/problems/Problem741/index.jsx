import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Both walkers begin at the top-left corner.' },
    { id: 'step', label: 'Step', description: 'Both walkers advance one diagonal and the best totals are updated.' },
    { id: 'done', label: 'Complete', description: 'Read the total at the bottom-right corner.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON array of rows with 1, 0 or -1)',
  url: 'https://leetcode.com/problems/cherry-pickup/',
  complexity: 'O(n^3) time and O(n^2) space for the two-walker table.',
  examples: [
    { label: 'Corridor', input: '[[0,1,0],[1,-1,1],[1,1,1]]' },
    { label: 'Blocked', input: '[[1,-1],[-1,1]]' },
    { label: 'Diagonal', input: '[[1,1,0],[0,-1,1],[0,1,1]]' },
  ],
}

export default function CherryPickup() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label={`Grid with walkers after step ${step.k}`} matrix={run.input}
      activeCell={step.walkers[0] ? { row: step.walkers[0][0], col: step.walkers[0][1] } : null}
      highlightedCells={step.walkers.slice(1).map(([row, col]) => ({ row, col }))} />
    <RecordStateTable label="Best totals for the row pairs (r1, r2) at this step" columns={['row 1', 'row 2', 'best total']}
      rows={run.input.length ? step.dp.flatMap((row, r1) => row.map((v, r2) => ({ r1, r2, v }))).filter(x => x.r2 >= x.r1 && x.v !== '–').slice(0, 12).map(x => ({ 'row 1': x.r1, 'row 2': x.r2, 'best total': x.v })) : []} activeRow={-1} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>One walker goes out and the other comes back, so they are treated as two walkers moving together. Both always sit on the same anti-diagonal, which fixes their columns once the rows are known.</p>
    <p>A cherry on a shared cell is collected once. A thorn removes a state entirely. The answer is the best total at the bottom-right corner, or 0 if no round trip exists.</p>
  </>} />
}
