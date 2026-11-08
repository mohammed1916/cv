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
    { label: 'Own case 1', input: '{"grid":[[3,4],[1,2]],"limits":[2,1],"k":2}' },
    { label: 'Tight k', input: '{"grid":[[5,3],[1,9]],"limits":[1,1],"k":1}' },
    { label: 'Single cell', input: '{"grid":[[7]],"limits":[1],"k":1}' },
    { label: 'Equal values tie', input: '{"grid":[[4,4],[4,4]],"limits":[2,0],"k":2}' },
    { label: 'Extremes, full grid', input: '{"grid":[[9,0,9,0,9],[9,0,9,0,9],[9,0,9,0,9],[9,0,9,0,9],[9,0,9,0,9]],"limits":[5,5,5,5,5],"k":25}' },
    { label: 'Long run: 5 by 5', input: '{"grid":[[2,6,6,9,3],[8,0,9,0,6],[4,6,3,8,5],[2,7,8,5,1],[6,1,3,6,1]],"limits":[2,3,1,4,0],"k":12}' },
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
