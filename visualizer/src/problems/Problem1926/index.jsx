import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1926',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with maze (rows of . empty and + wall) and entrance [row, col]',
  url: 'https://leetcode.com/problems/nearest-exit-from-entrance-in-maze/',
  complexity: 'O(m·n) time and space: each empty cell is queued at most once.',
  examples: [
    { label: 'Exit one step away', input: '{"maze":["+.+","...","+.+"],"entrance":[1,1]}' },
    { label: 'Walled in', input: '{"maze":["+++","+.+","+++"],"entrance":[1,1]}' },
    { label: 'Single open cell', input: '{"maze":["."],"entrance":[0,0]}' },
    { label: 'Corridor of open cells', input: '{"maze":["....."],"entrance":[0,2]}' },
    { label: 'Long run: 8 by 8 generated maze', input: '{"maze":["....+...","...+...+","+...+...","+...+...",".+++..++","..+.....","+.......","..+....."],"entrance":[0,0]}' },
  ],
}

export default function Problem1926Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const { maze, entrance } = run.input
      const grid = {
        rows: maze.length, cols: maze[0].length,
        blocked: (r, c) => maze[r][c] === '+',
        text: (r, c) => (maze[r][c] === '+' ? '#' : step.dist[r][c] >= 0 ? String(step.dist[r][c]) : ''),
      }
      const visited = step.reached
      const done = []
      return <>
        <GraphTraversalView title="Breadth-first search from the entrance" grid={grid}
          current={step.current} neighbour={step.neighbour} visited={visited} frontier={step.frontier} done={done}
          frontierKind="queue" frontierTitle="Queue (front first)" legend={{ done: 'finished' }} />
        <p>The entrance is at {entrance[0]}, {entrance[1]}. Numbers in cells are step counts from the entrance. Border cells that are reached are exits.</p>
        {step.result !== undefined && <output aria-label="Nearest exit">Nearest exit: {step.result}</output>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
