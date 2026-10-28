import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every cell is a path of one cell.' },
    { id: 'cell', label: 'Set dp', description: 'Extend the best smaller path in the same row or column.' },
    { id: 'group', label: 'Update bests', description: 'Record finished values for later, larger cells.' },
    { id: 'done', label: 'Complete', description: 'Report the longest path.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Matrix of integers from -20 to 20 (JSON array of rows)',
  url: 'https://leetcode.com/problems/maximum-strictly-increasing-cells-in-a-matrix/',
  complexity: 'O(mn log(mn)) time for the sort and O(mn) space. The visualization caps the matrix at 5 by 5.',
  examples: [
    { label: 'Example 1', input: '[[3,1],[3,4]]' },
    { label: 'Example 3', input: '[[3,1,6],[-9,5,7]]' },
  ],
}

export default function IncreasingCells() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="dp values of the matrix">
      <caption>Longest strictly increasing path ending at each cell</caption>
      <tbody>{step.table.map((row, r) => <tr key={r}>{row.map((value, c) => <td key={c} data-role={r === step.r && c === step.c ? 'current' : undefined}>{value}</td>)}</tr>)}</tbody>
    </table>
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>From a cell you may move to any cell in the same row or column with a strictly larger value.</p>
    <p>Handling values in increasing order means every smaller neighbour is already final, and equal values must not feed each other.</p>
  </>} />
}
