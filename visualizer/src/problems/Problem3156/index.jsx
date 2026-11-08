import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IntervalView from '../../components/shared/IntervalView'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Tasks table (task_id, employee_id, start_time, end_time as whole seconds)'
const complexity = 'O(n log n) to sort the events per employee. The visualizer caps the table at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"Tasks":[{"task_id":1,"employee_id":1,"start_time":3600,"end_time":18000},{"task_id":2,"employee_id":1,"start_time":10800,"end_time":28800},{"task_id":3,"employee_id":1,"start_time":28800,"end_time":36000},{"task_id":4,"employee_id":2,"start_time":7200,"end_time":14400},{"task_id":5,"employee_id":2,"start_time":14400,"end_time":21600}]}' },
    { label: "Single one-second task", input: "{\"Tasks\":[{\"task_id\":1,\"employee_id\":4,\"start_time\":0,\"end_time\":1}]}" },
    { label: "Touching tasks, no overlap", input: "{\"Tasks\":[{\"task_id\":1,\"employee_id\":1,\"start_time\":0,\"end_time\":3600},{\"task_id\":2,\"employee_id\":1,\"start_time\":3600,\"end_time\":7200}]}" },
    { label: "Largest allowed times", input: "{\"Tasks\":[{\"task_id\":1,\"employee_id\":9,\"start_time\":0,\"end_time\":3600000},{\"task_id\":2,\"employee_id\":9,\"start_time\":1800000,\"end_time\":3600000}]}" },
    { label: "Long run: 12 tasks, three employees", input: "{\"Tasks\":[{\"task_id\":1,\"employee_id\":1,\"start_time\":1000,\"end_time\":5000},{\"task_id\":2,\"employee_id\":1,\"start_time\":4000,\"end_time\":9000},{\"task_id\":3,\"employee_id\":1,\"start_time\":9000,\"end_time\":9500},{\"task_id\":4,\"employee_id\":2,\"start_time\":0,\"end_time\":7200},{\"task_id\":5,\"employee_id\":2,\"start_time\":3600,\"end_time\":10800},{\"task_id\":6,\"employee_id\":2,\"start_time\":20000,\"end_time\":30000},{\"task_id\":7,\"employee_id\":3,\"start_time\":100,\"end_time\":200},{\"task_id\":8,\"employee_id\":3,\"start_time\":150,\"end_time\":400},{\"task_id\":9,\"employee_id\":3,\"start_time\":500,\"end_time\":900},{\"task_id\":10,\"employee_id\":1,\"start_time\":60000,\"end_time\":70000},{\"task_id\":11,\"employee_id\":2,\"start_time\":15000,\"end_time\":15500},{\"task_id\":12,\"employee_id\":3,\"start_time\":1000000,\"end_time\":1003600}]}" },
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
    <IntervalView title="Tasks per employee (each bar is one task)"
      intervals={run.input.Tasks.map(task => ({ start: task.start_time, end: task.end_time, group: `Employee ${task.employee_id}`, role: 'pending', label: `#${task.task_id}` }))}
      marker={step.phase === 'depth' && step.rows.length ? step.rows[step.rows.length - 1].at_time : null}
      markerLabel="sweep" closed={false}
      note="Overlapping bars of one employee are merged for the duration and stacked for the concurrency count." />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Overlapping tasks are merged into blocks, so shared time is counted once. Each block contributes its end minus its start, and the total is rounded down to whole hours.</p>
    <p>For the concurrency count, starts and ends are sorted by time with ends first at equal times, so a task that ends when another begins is not counted twice.</p>
  </>} />
}
