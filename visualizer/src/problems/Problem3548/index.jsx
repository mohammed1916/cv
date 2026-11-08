import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Total', description: 'Find the sum of every cell.' },
    { id: 'cut', label: 'Try a cut', description: 'Check one straight cut and its single-cell discounts.' },
    { id: 'done', label: 'Complete', description: 'Report whether some cut works.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid (JSON array of rows)',
  url: 'https://leetcode.com/problems/equal-sum-grid-partition-ii/',
  complexity: 'Polynomial in the grid size. The visualization caps the grid at 12 cells.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,4],[2,3]]}' },
    { label: 'Example 2', input: '{"grid":[[1,2],[3,4]]}' },
    { label: 'Example 3', input: '{"grid":[[1,2,4],[2,3,5]]}' },
    { label: 'Two cells', input: '{"grid":[[1,20]]}' },
    { label: 'Equal cells', input: '{"grid":[[4,4],[4,4]]}' },
    { label: 'Largest values', input: '{"grid":[[20,1,20],[1,20,1]]}' },
    { label: 'Long run: 3 by 4 grid', input: '{"grid":[[9,6,18,16],[11,14,20,17],[5,10,10,1]]}' },
  ],
}

export default function EqualSumGridPartitionII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <MatrixGrid label="Grid" matrix={run.input.grid} />
    <output aria-label="Cut">{step.cut ? `${step.cut}: ${step.verdict ? 'works' : 'does not work'}` : 'Choose the next cut'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A discount is allowed only when the rest of its section is still connected, which is checked with a flood fill.</p>
  </>} />
}
