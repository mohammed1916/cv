import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start at (0, 0)', description: 'Trees are sorted by height; the walker starts at the top-left.' },
    { id: 'leg', label: 'Walk a leg', description: 'A breadth-first search finds the shortest walk to the next tree.' },
    { id: 'blocked', label: 'Blocked', description: 'An unreachable tree means the forest cannot be cleared.' },
    { id: 'done', label: 'Total', description: 'The sum of all legs, or −1 if a tree was unreachable.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Forest (JSON matrix: 0 blocked, 1 open, above 1 a tree)',
  url: 'https://leetcode.com/problems/cut-off-trees-for-golf-event/',
  complexity: 'O(t · m · n) time for t trees on an m × n grid, one BFS per leg.',
  examples: [
    { label: 'Two trees', input: '[[1,2,3],[0,0,4],[7,6,5]]' },
    { label: 'Blocked', input: '[[2,3,0],[0,0,4],[7,6,5]]' },
    { label: 'Corner tree', input: '[[1,1],[1,5]]' },
  ],
}

export default function CutOffTrees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const matrix = run.input.map(row => row.map(v => (v === 0 ? '#' : v === 1 ? '·' : v)))
    return <>
      <MatrixGrid label="Forest: # blocked, · open, numbers are tree heights" matrix={matrix}
        activeCell={{ row: step.at[0], col: step.at[1] }}
        highlightedCells={(step.visited ?? []).map(([row, col]) => ({ row, col }))} />
      <output aria-label="Total steps">{step.phase === 'blocked' ? 'Unreachable tree' : `Steps so far: ${step.total}`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why shortest legs:</strong> cutting in height order, each leg is a shortest path, so the sum is the fewest steps overall.</p>
  </>} />
}
