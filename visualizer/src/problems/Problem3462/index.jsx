import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin collecting candidates.' },
    { id: 'row', label: 'Row', description: 'Keep only the row’s allowed largest values.' },
    { id: 'sort', label: 'Sort', description: 'Order all candidates from largest to smallest.' },
    { id: 'take', label: 'Take', description: 'Add a candidate to the total.' },
    { id: 'stop', label: 'Stop', description: 'No positive candidate remains.' },
    { id: 'done', label: 'Result', description: 'Report the maximum sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid (n by n), limits (per row) and k',
  url: 'https://leetcode.com/problems/maximum-sum-with-at-most-k-elements/',
  complexity: 'O(n^2 log n) time for sorting each row and the candidates, and O(n^2) space.',
  examples: [
    { label: 'Example', input: '{"grid":[[1,2],[3,4]],"limits":[1,2],"k":2}' },
    { label: 'Tight k', input: '{"grid":[[5,3],[1,9]],"limits":[1,1],"k":1}' },
  ],
}

export default function MaximumSumWithAtMostKElements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Grid" matrix={run.input.grid} activeCell={step.row >= 0 ? { row: step.row, col: 0 } : null} />
    <output aria-label="Candidates">{`candidates: [${step.candidates.join(', ')}], total ${step.total}. ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>Inside one row, if j cells are taken, the j largest are always the best choice, so each row contributes only its top limits[i] values.</p>
    <p>Across rows the limits are already respected by the candidate list, so taking the k largest candidates gives the answer, as long as they stay positive.</p>
  </>} />
}
