import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The snake is in cell 0.' },
    { id: 'move', label: 'Move', description: 'Apply one command to the row and column.' },
    { id: 'done', label: 'Complete', description: 'Encode the final cell as row times n plus column.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n and commands (UP, DOWN, LEFT, RIGHT)',
  url: 'https://leetcode.com/problems/snake-in-matrix/',
  complexity: 'O(commands) time. The visualization caps n at 8 and the commands at 40.',
  examples: [
    { label: 'Example 1', input: '{"n":2,"commands":["RIGHT","DOWN"]}' },
    { label: 'Example 2', input: '{"n":3,"commands":["DOWN","RIGHT","UP"]}' },
  ],
}

export default function SnakeInMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const matrix = Array.from({ length: run.input.n }, (_, r) => Array.from({ length: run.input.n }, (_, c) => r * run.input.n + c))
    return <>
      <MatrixGrid label="Cell indices" matrix={matrix} activeCell={step.row >= 0 ? { row: step.row, col: step.col } : null} cellWidth={44} cellHeight={40} />
      <output aria-label="Position">{`Row ${step.row}, column ${step.col}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each command changes one coordinate by one. The snake never leaves the grid, so the final cell is always valid.</p>
    <p>Cell (row, column) has index row times n plus column.</p>
  </>} />
}
