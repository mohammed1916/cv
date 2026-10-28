import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Count the 1s in each row and column.' },
    { id: 'corner', label: 'Corner', description: 'Add the triangles with this corner.' },
    { id: 'done', label: 'Complete', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid of 0s and 1s as a list of rows, JSON',
  url: 'https://leetcode.com/problems/right-triangles/',
  complexity: 'O(rows times cols) time and space. The visualization caps the grid at 6 by 6.',
  examples: [
    { label: 'Example 1', input: '[[0,1,0],[0,1,1],[0,1,0]]' },
    { label: 'Example 2', input: '[[1,0,1],[1,0,0],[1,0,0]]' },
  ],
}

export default function RightTriangles() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Grid">
      <tbody>{run.matrix.map((row, r) => <tr key={r}>{row.map((v, col) => <td key={col} className={step.cell && step.cell[0] === r && step.cell[1] === col ? 'is-active' : undefined}>{v}</td>)}</tr>)}</tbody>
    </table>
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>In a right triangle with axis-aligned legs, the corner is the vertex shared by a row partner and a column partner.</p>
    <p>Each 1 is a corner for every pair formed by another 1 in its row and another 1 in its column.</p>
  </>} />
}
