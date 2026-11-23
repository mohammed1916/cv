import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GridBoard from '../../components/shared/GridBoard'
import { buildTrace, parseInput, code, python } from './algorithm'
import { mazeTutorial } from './tutorial'
import { examples } from './presets.js'

const phases = [
  { id: 'start', label: 'Start', description: 'The ball starts at its start cell.' },
  { id: 'pick', label: 'Closest stop', description: 'Finish the closest unfinished stop.' },
  { id: 'roll', label: 'Roll', description: 'Roll in one direction until a wall.' },
  { id: 'relax', label: 'Shorter route', description: 'Record a shorter distance to a stop.' },
  { id: 'done', label: 'Destination', description: 'The destination is finished.' },
  { id: 'lose', label: 'No route', description: 'No destination is reachable.' },
]

const goalDiagram = (
  <svg className="goal-diagram" width="200" viewBox="0 0 200 120" role="img" aria-label="A 3 by 3 maze with one wall in the middle column; the ball rolls down the left column and then right along the bottom to stop at the destination.">
    {[0, 1, 2].map(r => [0, 1, 2].map(c => <rect key={`${r}-${c}`} x={20 + c * 50} y={10 + r * 34} width="44" height="28" rx="4" style={{ fill: r === 1 && c === 1 ? '#1f2937' : 'var(--surface2)' }} stroke="currentColor" strokeWidth="1" />))}
    <path d="M 42 24 L 42 104 L 142 104" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
    <text x="100" y="118" textAnchor="middle" fontSize="11" fill="currentColor">the ball rolls until a wall stops it</text>
  </svg>
)

const definition = {
  number: '505',
  title: 'The Maze II',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with maze (0 empty, 1 wall), start [row, col] and destination [row, col]',
  url: 'https://leetcode.com/problems/the-maze-ii/',
  complexity: 'Dijkstra over stopping cells. With the simple selection used here it is O(V squared) for V stopping cells. The visualization caps the maze at 5 by 5.',
  goal: {
    summary: 'Find the shortest distance a rolling ball travels to stop exactly at the destination.',
    requirement: [
      'The maze is a grid of 0 (empty) and 1 (wall). The ball starts at start and must stop at destination.',
      'The ball rolls in one direction until the next cell is a wall or the edge. It can only change direction when it stops.',
      'The distance is the number of empty cells the ball moves through. Return the shortest distance to the destination, or -1 if it cannot stop there.',
      'Input limits used by this visualizer: maze up to 5 by 5, with start and destination as empty cells.',
    ],
    example: 'In the first preset, the ball rolls down one cell, then right two cells to the edge, then down one cell to the destination: 1 + 2 + 1 = 4.',
  },
  goalDiagram,
  tutorial: mazeTutorial,
  examples,
}

export default function TheMazeII() {
  return <AlgorithmWorkspace definition={definition} tutorial={mazeTutorial} narration="505" renderVisual={({ run, step }) => {
    const rows = run.input.maze.length
    const cols = run.input.maze[0].length
    const cellAt = (r, c) => {
      if (run.input.maze[r][c] === 1) return { className: 'is-wall' }
      const d = step.dist[r][c]
      const isDone = step.done.some(([dr, dc]) => dr === r && dc === c)
      const isCurrent = step.current && step.current[0] === r && step.current[1] === c
      const isNext = step.next && step.next[0] === r && step.next[1] === c
      const isStart = run.input.start[0] === r && run.input.start[1] === c
      const isTarget = run.input.destination[0] === r && run.input.destination[1] === c
      const cls = [isDone ? 'is-done' : '', isCurrent ? 'is-current' : '', isStart ? 'is-start' : '', isTarget ? 'is-target' : ''].join(' ')
      return { className: cls, label: d === Infinity ? '' : d, title: `[${r}, ${c}]` }
    }
    return <>
      <GridBoard rows={rows} cols={cols} cellAt={cellAt} label="Maze with distances" />
      <output aria-label="Current">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>The ball only stops at walls, so the shortest route is found over stopping cells, always finishing the closest unfinished one next.</p>
  </>} />
}
