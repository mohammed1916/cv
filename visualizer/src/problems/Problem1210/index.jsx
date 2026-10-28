import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The snake lies flat across the top left corner.' },
    { id: 'pop', label: 'Expand', description: 'Try the legal slides and rotations from this snake position.' },
    { id: 'found', label: 'Target', description: 'The snake lies flat in the bottom right corner.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum number of moves, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with grid (square, 0 empty, 1 blocked)',
  url: 'https://leetcode.com/problems/minimum-moves-to-reach-target-with-rotations/',
  complexity: 'O(n^2) states with O(1) moves each. The visualization caps the board at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[0,0,0,0,0,1],[1,1,0,0,1,0],[0,0,1,0,1,0],[1,1,0,0,0,1],[1,1,1,0,0,1],[1,1,1,0,0,0]]}' },
    { label: 'Open board', input: '{"grid":[[0,0],[0,0]]}' },
  ],
}

export default function MinimumMovesWithRotations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { grid } = run.input
    const n = grid.length
    const view = { rows: n, cols: n, text: () => '', blocked: (r, c) => grid[r][c] === 1 }
    const snake = step.tail && step.head ? [step.tail, step.head] : []
    return <>
      <GraphTraversalView title="Board (snake tail and head)" grid={view} current={step.tail} neighbour={step.head} visited={step.visited} showFrontier={false} />
      <output aria-label="Snake status">{step.message}{snake.length ? ` Tail ${snake[0].join(',')}, head ${snake[1].join(',')}.` : ''}</output>
    </>
  }} renderReasoning={() => <>
    <p>The snake is described by its tail cell and whether it lies flat or upright, so the whole position fits in n by n by 2 states.</p>
    <p>A rotation pivots around the tail, and it is allowed only when the other two cells of the 2 by 2 square are empty.</p>
  </>} />
}
