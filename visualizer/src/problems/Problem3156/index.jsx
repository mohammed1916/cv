import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Tasks table (task_id, employee_id, start_time, end_time as integers)'
const complexity = 'O(n log n) to sort the events per employee. The visualizer caps the table at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"Tasks":[{"task_id":1,"employee_id":1,"start_time":1,"end_time":5},{"task_id":2,"employee_id":1,"start_time":3,"end_time":8},{"task_id":3,"employee_id":1,"start_time":8,"end_time":10},{"task_id":4,"employee_id":2,"start_time":2,"end_time":4},{"task_id":5,"employee_id":2,"start_time":4,"end_time":6}]}' },
]

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

export default function EmployeeTaskDuration() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Overlapping tasks are merged into blocks, so shared time is counted once. Each block contributes its end minus its start.</p>
    <p>For the concurrency count, starts and ends are sorted by time with ends first at equal times, so a task that ends when another begins is not counted twice.</p>
  </>} />
}
