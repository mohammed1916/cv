import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'row', label: 'Rows', description: 'Rotate each row left by its shift.' },
    { id: 'column', label: 'Columns', description: 'Rotate each column up by its shift, using the shifted rows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid and shifts (JSON object with grid, rowShift and colShift)',
  url: 'https://leetcode.com/problems/cyclically-shift-rows-and-columns/',
  complexity: 'O(n²) time and O(n²) space. The visualization caps the grid at 10 by 10.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,2],[3,4]],"rowShift":[1,0],"colShift":[0,1]}' },
    { label: 'Example 2', input: '{"grid":[[1,2,3],[4,5,6],[7,8,9]],"rowShift":[1,2,0],"colShift":[2,2,1]}' },
  ],
}

export default function CyclicallyShiftGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <table aria-label="Grid">
    <tbody>{step.grid.map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody>
    <caption>{step.message}</caption>
  </table>} renderReasoning={() => <>
    <p>The row shifts run first and change each row in place. The column shifts then read from the rotated rows, so their order matters.</p>
    <p>A left shift by s takes the element at index j + s, and an upward shift takes the element at row i + s.</p>
  </>} />
}
