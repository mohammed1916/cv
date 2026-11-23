import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GridBoard from '../../components/shared/GridBoard'
import { buildTrace, parseInput, code, python } from './algorithm'
import { snakeTutorial } from './tutorial'
import { examples } from './presets.js'

const phases = [
  { id: 'start', label: 'Start', description: 'The snake starts at the top-left cell.' },
  { id: 'move', label: 'Move', description: 'The head steps into the next cell.' },
  { id: 'eat', label: 'Eat', description: 'Food makes the snake grow.' },
  { id: 'slide', label: 'Slide', description: 'The tail follows the head.' },
  { id: 'lose', label: 'Game over', description: 'The head hit a wall or the body.' },
  { id: 'done', label: 'Result', description: 'Report every move result.' },
]

const goalDiagram = (
  <svg className="goal-diagram" width="220" viewBox="0 0 220 110" role="img" aria-label="A 3 by 2 grid. The snake occupies the top-left and the cell to its right; food sits at the lower right. One right move and one down move eat the food.">
    {[0, 1, 2].map(c => [0, 1].map(r => <rect key={`${r}-${c}`} x={20 + c * 60} y={20 + r * 40} width="54" height="34" rx="5" style={{ fill: r === 0 && c < 2 ? 'var(--success, #16a34a)' : r === 1 && c === 2 ? 'var(--warning, #d97706)' : 'var(--surface2)' }} stroke="currentColor" strokeWidth="1.2" opacity={r === 0 && c < 2 ? .7 : 1} />))}
    <text x="110" y="100" textAnchor="middle" fontSize="11" fill="currentColor">green: snake · amber: food</text>
  </svg>
)

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  pythonLineMap: Object.fromEntries(code.map(line => [line.line, line.line])),
  inputLabel: 'Object with width, height, food ([row, col] list, in order) and moves (U, D, L or R)',
  url: 'https://leetcode.com/problems/design-snake-game/',
  complexity: 'Each move is O(1) on average with a set for the body and a deque for the order, and O(L) space for a snake of length L. The visualization caps the grid at 4 by 4.',
  goal: {
    summary: 'Simulate a snake on a grid that grows when it eats food, and report the score after every move, or -1 when the game ends.',
    requirement: [
      'The snake starts at the top-left cell [0, 0] with length 1. Food appears one piece at a time, in the order given.',
      'Each move U, D, L or R moves the head one cell. The move returns the number of food pieces eaten so far.',
      'Leaving the grid, or moving the head into the body, ends the game, and the move returns -1.',
      'The tail leaves its cell before the collision check, so the head may move into the cell the tail just vacated.',
      'Input limits used by this visualizer: grid up to 4 by 4, up to 4 food pieces, up to 10 moves.',
    ],
    example: 'On a 2 by 2 grid with no food, the moves R then R return 0 and -1, because the second move leaves the grid.',
  },
  goalDiagram,
  tutorial: snakeTutorial,
  examples,
}

export default function SnakeGame() {
  return <AlgorithmWorkspace definition={definition} tutorial={snakeTutorial} narration="353" renderVisual={({ run, step }) => {
    const { width, height } = run.input
    const cellAt = (r, c) => {
      const isHead = step.body[0] && step.body[0][0] === r && step.body[0][1] === c
      const inBody = step.body.some(([br, bc]) => br === r && bc === c)
      const isFood = step.food.some(([fr, fc]) => fr === r && fc === c)
      if (isHead) return { className: 'is-head', label: 'H' }
      if (inBody) return { className: 'is-body' }
      if (isFood) return { className: 'is-food', label: 'F' }
      return null
    }
    return <>
      <GridBoard rows={height} cols={width} cellAt={cellAt} label="Snake board" />
      <output aria-label="Score">{`Score ${step.score} · length ${step.body.length}`}</output>
      <output aria-label="Results">{`Results: ${step.result !== null && step.result !== undefined ? step.result : ''} ${run.result.length && step.phase === 'done' ? `[${run.result.join(', ')}]` : ''}`.trim()}</output>
    </>
  }} renderReasoning={() => <>
    <p>The body is kept as a queue of cells, so each move adds a new head and removes the tail, unless the snake eats.</p>
  </>} />
}
