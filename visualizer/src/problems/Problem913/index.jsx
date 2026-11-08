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
    { label: 'Own case 1', input: '[[5,2],[3],[5,4,0],[5,4,1],[3,2],[3,2,0]]' },
    { label: 'Own case 2', input: '[[3,1],[0],[3],[2,0]]' },
    { label: 'Another mouse win', input: '[[1,2],[0,2],[0,1,3],[2]]' },
    { label: 'Smallest path', input: '[[1],[0,2],[1]]' },
    { label: 'Star with three leaves', input: '[[1,2,3],[0],[0],[0]]' },
    { label: 'Cycle of 16', input: '[[15,1],[0,2],[1,3],[2,4],[3,5],[4,6],[5,7],[6,8],[7,9],[8,10],[9,11],[10,12],[11,13],[12,14],[13,15],[14,0]]' },
    { label: 'Long run: 16 nodes, random edges', input: '[[1,8,15],[0,2,6,7,13],[1,3,10],[2,4,9,13],[3,5,8,14],[4,6,14],[1,5,7,12],[1,6,8,12,14],[0,4,7,9],[3,8,10],[2,9,11,15],[10,12,14],[6,7,11,13],[1,3,12,14],[4,5,7,11,13,15],[0,10,14]]' },
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
