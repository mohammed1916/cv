import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Shift amount', description: 'Reduce k modulo the row length.' },
    { id: 'row', label: 'Shift rows', description: 'Even rows move right, odd rows move left, then compare.' },
    { id: 'done', label: 'Complete', description: 'Report whether the matrix is unchanged.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with mat and k',
  url: 'https://leetcode.com/problems/matrix-similarity-after-cyclic-shifts/',
  complexity: 'O(mn) time to shift and compare each row once. The visualization caps the matrix at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '{"mat":[[1,2,1,2],[5,5,5,5],[6,3,6,3]],"k":2}' },
    { label: 'Example 2', input: '{"mat":[[2,2],[1,3]],"k":3}' },
  ],
}

export default function MatrixSimilarity() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Original matrix" matrix={run.input.mat} activeCell={step.row >= 0 ? { row: step.row, col: 0 } : null}
      highlightedCells={step.row >= 0 ? run.input.mat[step.row].map((_, col) => ({ row: step.row, col })) : []} />
    {step.shifted && <MatrixGrid label="Shifted row" matrix={[step.shifted]} tone="accent" showRowLabels={false} />}
    <output aria-label="Row status">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Rotating a row by k positions returns it to the start exactly when the values repeat with that period. Even rows move right and odd rows move left, so the matrix is similar only when every row matches its own rotation.</p>
    <p>Only k modulo the row length matters, since a full turn changes nothing.</p>
  </>} />
}
