import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const examples = [{
  label: 'Sample',
  input: '{"Days":[{"day":"2020-11-03"},{"day":"2021-01-01"},{"day":"2000-02-29"}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Days table (day as YYYY-MM-DD)',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(n log n) for the date sort, with constant work per date for formatting. The visualizer caps the table at 12 rows.',
  examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function ConvertDateFormatVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each date is split into its parts: the weekday comes from the calendar, the month name from a fixed list, and the day is written without a leading zero.</p>
    <p>The sample includes 2000-02-29 to show a leap day, which still falls on a Tuesday.</p>
  </>} />
}
