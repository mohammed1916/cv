import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import SqlStageView from './SqlStageView'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Data table'
const complexity = 'O(n log n) for the two sorts over the at most 12 rows the visualizer accepts.'
const examples = [{
  label: 'Sample',
  input: '{"Data":[{"first_col":4,"second_col":1},{"first_col":2,"second_col":8},{"first_col":9,"second_col":3},{"first_col":2,"second_col":6}]}',
},
  { label: 'Single row', input: '{"Data":[{"first_col":5,"second_col":2}]}' },
  { label: 'Equal first values', input: '{"Data":[{"first_col":3,"second_col":1},{"first_col":3,"second_col":4}]}' },
  { label: 'Zero values', input: '{"Data":[{"first_col":0,"second_col":0},{"first_col":0,"second_col":7}]}' },
  { label: 'Long run: 12 rows', input: '{"Data":[{"first_col":18,"second_col":15},{"first_col":17,"second_col":15},{"first_col":16,"second_col":15},{"first_col":0,"second_col":13},{"first_col":10,"second_col":20},{"first_col":12,"second_col":19},{"first_col":4,"second_col":8},{"first_col":3,"second_col":14},{"first_col":3,"second_col":9},{"first_col":0,"second_col":20},{"first_col":10,"second_col":5},{"first_col":2,"second_col":3}]}' },
]
const reasoning = 'The two columns no longer belong to the same rows. Sort the first column ascending and the second descending, number the positions, and pair the values that share a position.'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function SqlWalkthrough() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStageView phases={phases} step={step} columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
