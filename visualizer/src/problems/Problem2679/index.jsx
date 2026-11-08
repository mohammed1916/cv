import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Sort each row from largest to smallest.' },
    { id: 'scan', label: 'Scan', description: 'Compare the values in this column across rows.' },
    { id: 'round', label: 'Round', description: 'Add the column best to the score.' },
    { id: 'done', label: 'Result', description: 'Report the total score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (a matrix of 1 to 6 rows and 1 to 6 columns, values 0 to 1000)',
  url: 'https://leetcode.com/problems/sum-in-a-matrix/',
  complexity: 'O(n * m log m) time for n rows and m columns, dominated by sorting each row.',
  examples: [
    { label: 'Two rows', input: '{"nums":[[4,9,1],[8,2,6]]}' },
    { label: 'Equal tops', input: '{"nums":[[5,5],[5,0]]}' },
    { label: 'Single cell', input: '{"nums":[[7]]}' },
    { label: 'All equal values', input: '{"nums":[[3,3],[3,3]]}' },
    { label: 'Largest values: 6 by 6', input: '{"nums":[[0,1000,0,1000,0,1000],[1000,0,1000,0,1000,0],[0,1000,0,1000,0,1000],[1000,0,1000,0,1000,0],[0,1000,0,1000,0,1000],[1000,0,1000,0,1000,0]]}' },
    { label: 'Long run: 6 by 6 generated', input: '{"nums":[[670,771,535,226,403,13],[971,182,919,418,769,191],[270,595,848,610,134,369],[115,462,232,802,501,547],[415,874,160,994,867,725],[716,286,545,185,232,358]]}' },
  ],
}

export default function SumInAMatrix() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="Matrix state">{`rows: ${JSON.stringify(step.rows)}, column ${step.column >= 0 ? step.column + 1 : 'none'}, best ${step.best}, score ${step.score ?? 0}`}</output>
    <MatrixGrid matrix={step.rows} label="Sorted rows" />
  </>} renderReasoning={() => <>
    <p>Every round removes the largest remaining value from each row, and the score gains the largest value removed that round.</p>
    <p>Sorting each row from largest to smallest turns round k into reading column k, so the answer is the sum of each column's maximum.</p>
  </>} />
}
