import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Seed', description: 'Mark terminal states and enqueue them.' },
    { id: 'propagate', label: 'Propagate', description: 'Pop a decided state and update its predecessors.' },
    { id: 'done', label: 'Complete', description: 'Read the result of the starting state.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Graph adjacency list (JSON)',
  url: 'https://leetcode.com/problems/cat-and-mouse/',
  complexity: 'O(n^3) time and O(n^2) space for n nodes (states times moves). Graphs are capped at 16 nodes.',
  examples: [
    { label: 'Example 1 (draw)', input: '[[2,5],[3],[0,4,5],[1,4,5],[2,3],[0,2,3]]' },
    { label: 'Example 2 (mouse)', input: '[[1,3],[0],[3],[0,2]]' },
    { label: 'Another mouse win', input: '[[1,2],[0,2],[0,1,3],[2]]' },
  ],
}

const cellFor = (step, turn) => step.turn === turn && step.cell ? { row: step.cell[0], column: step.cell[1] } : null
export default function CatAndMouse() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const n = step.mouseTurn.length
    const labels = Array.from({ length: n }, (_, i) => i)
    const related = turn => (step.colored ?? []).filter(c => c[0] === turn).map(c => ({ row: c[1], column: c[2] }))
    return <>
      <DPTable title="Mouse to move (rows: mouse node, cols: cat node)" values={step.mouseTurn} rowLabels={labels} columnLabels={labels} activeCell={cellFor(step, 1)} relatedCells={related(1)} />
      <DPTable title="Cat to move (rows: mouse node, cols: cat node)" values={step.catTurn} rowLabels={labels} columnLabels={labels} activeCell={cellFor(step, 2)} relatedCells={related(2)} />
      <output aria-label="Queue">M = mouse wins, C = cat wins, · = undecided. Queue length: {step.queueLength}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A state is a win for the mover if some move reaches a state already won by the mover, and a loss if every move reaches a state lost for the mover. Counting remaining moves (degree) detects the second case; states never decided are draws.</p>
  </>} />
}
