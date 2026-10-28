import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Look for a good subset of the rows.' },
    { id: 'zero', label: 'Zero row', description: 'A row of zeros is a good subset by itself.' },
    { id: 'pair', label: 'Row pair', description: 'Two rows with no shared column form a good subset.' },
    { id: 'done', label: 'Complete', description: 'Report the rows found, or an empty list.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with grid (up to 6 rows of 0 and 1, up to 5 columns)',
  url: 'https://leetcode.doocs.org/en/lc/2732/',
  complexity: 'O(m^2 * n) time for the zero-row and pair checks.',
  examples: [
    { label: 'Example 1', input: '{"grid": [[0,1,1,0],[0,0,0,1],[1,1,1,1]]}' },
    { label: 'Example 3', input: '{"grid": [[1,1,1],[1,1,1]]}' },
  ],
}

export default function GoodSubset() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <table aria-label="Matrix rows">
      <tbody>
        {run.grid.map((row, i) => (
          <tr key={i} data-chosen={step.rows.includes(i) ? 'yes' : 'no'}>
            <th scope="row">{`Row ${i}`}</th>
            <td>{row.join(' ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )} renderReasoning={() => <>
    <p>With at most five columns, a good subset is either one all-zero row, or two rows whose ones never land in the same column.</p>
    <p>The check on pairs is exact for this statement, and the exhaustive test confirms it on random grids.</p>
  </>} />
}
