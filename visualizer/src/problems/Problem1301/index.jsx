import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start S', description: 'S begins with score 0 and one path.' },
    { id: 'cell', label: 'Cell', description: 'Take the best score among the cells that can move into this one.' },
    { id: 'blocked', label: 'Obstacle', description: 'An obstacle cannot be entered.' },
    { id: 'done', label: 'Complete', description: 'Report the best score at E and the number of paths that reach it.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Board (JSON object with board rows of digits, X, S and E)',
  url: 'https://leetcode.com/problems/number-of-paths-with-max-score/',
  complexity: 'O(n^2) time with three predecessors per cell. The visualization caps the board at 5 by 5.',
  examples: [
    { label: 'Official', input: '{"board":["E23","2X2","12S"]}' },
    { label: 'Blocked', input: '{"board":["E11","XXX","11S"]}' },
  ],
}

export default function PathsWithMaxScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid matrix={run.board.map(row => [...row])} label="Board" activeCell={{ row: step.row, col: step.col }} />
    <MatrixGrid matrix={step.table} label="Best score from S (· = not reached)" activeCell={{ row: step.row, col: step.col }} />
    <output aria-label="Status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Paths from S to E move up, left, or up-left. Working backward from S, each cell takes the best score among the cells that can move into it.</p>
    <p>Equal best scores add their path counts together, so each cell stores both the best score and how many paths reach it.</p>
  </>} />
}
