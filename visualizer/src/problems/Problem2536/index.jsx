import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty difference grid.' },
    { id: 'mark', label: 'Mark', description: 'Each query marks its four corners.' },
    { id: 'sum', label: 'Sum', description: 'Prefix sums fill the grid row by row.' },
    { id: 'done', label: 'Complete', description: 'Report the final counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and queries (JSON)',
  url: 'https://leetcode.com/problems/increment-submatrices-by-one/',
  complexity: 'O(n^2 + q) time and O(n^2) space. The visualization caps input at 8 by 8 with 8 queries.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"queries":[[1,1,2,2],[0,0,1,1]]}' },
  ],
}

export default function IncrementSubmatrices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const grid = step.grid ?? Array.from({ length: run.input.n }, () => Array(run.input.n).fill(0))
    const [ar, ac] = step.cell ?? [-1, -1]
    return <table aria-label="Count grid" className="algorithm-grid">
      <tbody>{grid.map((row, r) => <tr key={r}>{row.map((value, c) => <td key={c} data-role={r === ar && c === ac ? 'active' : undefined} className={r === ar && c === ac ? 'is-active' : ''}>{value}</td>)}</tr>)}</tbody>
    </table>
  }} renderReasoning={() => <>
    <p>Adding one to a rectangle is the same as adding one at its corners of a two-dimensional difference grid.</p>
    <p>Two-dimensional prefix sums then recover the count for every cell in one pass.</p>
  </>} />
}
