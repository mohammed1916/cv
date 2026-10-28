import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Start at the top-left with score 0 and cost 0.' },
    { id: 'cell', label: 'Cell', description: 'Combine the best paths from above and from the left.' },
    { id: 'done', label: 'Complete', description: 'Read the best score at the bottom-right.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with grid and k, for example {"grid":[[0,1],[2,0]],"k":1}',
  url: 'https://leetcode.com/problems/maximum-path-score-in-a-grid/',
  complexity: 'O(m * n * k) time. The visualization caps the grid at 4 by 4 and k at 12.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[0,1],[2,0]],"k":1}' },
    { label: 'Example 2', input: '{"grid":[[0,1],[1,2]],"k":1}' },
  ],
}

export default function MaximumPathScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Grid" matrix={run.input.grid} activeCell={{ row: step.row, col: step.col }} />
    <output aria-label="Reach">{`Cell (${step.row}, ${step.col}), best reaching score: ${step.reach}, budget k = ${run.input.k}`}</output>
  </>} renderReasoning={() => <>
    <p>Each cell keeps the best score for every cost it can be reached with. A cell takes the better of the cells above and to its left, then adds its own value and cost.</p>
    <p>The answer reads the bottom-right cell over all costs up to k, or -1 when no cost fits.</p>
  </>} />
}
