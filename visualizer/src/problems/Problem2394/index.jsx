import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Employees (employee_id, needed_hours) and Logs (employee_id, in_time, out_time in seconds)'
const complexity = 'O(n + m) after grouping the log sessions by employee. The visualizer caps the tables at 12 employees and 12 logs.'
const examples = [{
  label: 'Sample',
  input: '{"Employees":[{"employee_id":1,"needed_hours":1},{"employee_id":2,"needed_hours":1},{"employee_id":3,"needed_hours":1}],"Logs":[{"employee_id":1,"in_time":0,"out_time":50},{"employee_id":1,"in_time":100,"out_time":190},{"employee_id":2,"in_time":0,"out_time":3599}]}',
}, {
  label: 'Single employee, no logs',
  input: '{"Employees":[{"employee_id":1,"needed_hours":0}],"Logs":[]}',
}, {
  label: 'Overlapping sessions',
  input: '{"Employees":[{"employee_id":1,"needed_hours":2},{"employee_id":2,"needed_hours":2}],"Logs":[{"employee_id":1,"in_time":0,"out_time":7200},{"employee_id":1,"in_time":3600,"out_time":10800},{"employee_id":2,"in_time":0,"out_time":0}]}',
}, {
  label: 'Full day boundary',
  input: '{"Employees":[{"employee_id":1,"needed_hours":24}],"Logs":[{"employee_id":1,"in_time":0,"out_time":86400}]}',
}, {
  label: 'Long run: 12 employees and logs',
  input: '{"Employees":[{"employee_id":1,"needed_hours":2},{"employee_id":2,"needed_hours":6},{"employee_id":3,"needed_hours":5},{"employee_id":4,"needed_hours":2},{"employee_id":5,"needed_hours":4},{"employee_id":6,"needed_hours":8},{"employee_id":7,"needed_hours":4},{"employee_id":8,"needed_hours":0},{"employee_id":9,"needed_hours":2},{"employee_id":10,"needed_hours":8},{"employee_id":11,"needed_hours":4},{"employee_id":12,"needed_hours":2}],"Logs":[{"employee_id":7,"in_time":13568,"out_time":15212},{"employee_id":10,"in_time":2125,"out_time":3839},{"employee_id":4,"in_time":12050,"out_time":12691},{"employee_id":2,"in_time":1155,"out_time":2295},{"employee_id":9,"in_time":39154,"out_time":40625},{"employee_id":8,"in_time":18067,"out_time":18146},{"employee_id":6,"in_time":11331,"out_time":14193},{"employee_id":11,"in_time":15846,"out_time":16384},{"employee_id":12,"in_time":38183,"out_time":40786},{"employee_id":2,"in_time":39835,"out_time":42509},{"employee_id":2,"in_time":36284,"out_time":37729},{"employee_id":10,"in_time":16620,"out_time":17963}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const CLAUSES = [['FROM', 'FROM and LEFT JOIN'], ['GROUP', 'GROUP BY sums'], ['WHERE', 'WHERE filter'], ['ORDER', 'ORDER BY']]
const CLAUSE_OF_PHASE = { load: 'FROM', session: 'GROUP', total: 'GROUP', filter: 'WHERE', done: 'ORDER' }

// Stage strip: the SQL clause that the current step corresponds to.
function StageStrip({ phase }) {
  const active = CLAUSE_OF_PHASE[phase]
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 6, listStyle: 'none', padding: 0, margin: '8px 0', flexWrap: 'wrap' }}>
    {CLAUSES.map(([key, label]) => <li key={key} aria-current={active === key ? 'step' : undefined}
      style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: active === key ? 'var(--primary-glow)' : 'var(--surface2)', color: 'var(--text)', fontWeight: active === key ? 700 : 400 }}>{label}</li>)}
  </ol>
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

export default function EmployeesWithDeductions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phase={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each session is rounded up to whole minutes, then the minutes of each employee are added. An employee with no logs has a total of zero.</p>
    <p>An employee stays only when the total is strictly below the required minutes, so an exact match is dropped.</p>
  </>} />
}
