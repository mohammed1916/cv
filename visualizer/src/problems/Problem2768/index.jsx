import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Prepare the block counts.' },
    { id: 'cell', label: 'Black cell', description: 'Add it to every block that contains it.' },
    { id: 'done', label: 'Complete', description: 'Return the counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "m", "n" and "coordinates" ([row, column] pairs), JSON',
  url: 'https://leetcode.com/problems/number-of-black-blocks/',
  complexity: 'O(k) time for k black cells, plus O(m times n) to count the blocks. The visualization caps the grid at 8 by 8.',
  examples: [
    { label: 'Example 1', input: '{"m":3,"n":3,"coordinates":[[0,0]]}' },
    { label: 'Example 2', input: '{"m":3,"n":3,"coordinates":[[0,0],[1,1],[0,2]]}' },
  ],
}

export default function NumberOfBlackBlocks() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Grid">
      <tbody>{run.matrix.map((row, r) => <tr key={r}>{row.map((v, col) => <td key={col} className={step.cell && step.cell[0] === r && step.cell[1] === col ? 'is-active' : undefined}>{v}</td>)}</tr>)}</tbody>
    </table>
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>Only blocks that contain a black cell need updating, so the work follows the black cells rather than the whole grid.</p>
    <p>Blocks with no black cell are found by subtracting the touched blocks from the total number of blocks.</p>
  </>} />
}
