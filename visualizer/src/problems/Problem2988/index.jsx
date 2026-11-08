import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageBoard from './SqlStageBoard'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with an Employees table (emp_id, emp_name, dep_id, position)'
const complexity = 'One pass to count departments and one pass to find managers: O(n) time with one entry per department. The visualizer caps the table at 20 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Employees":[{"emp_id":1,"emp_name":"Ana","dep_id":10,"position":"Manager"},{"emp_id":2,"emp_name":"Ben","dep_id":10,"position":"Engineer"},{"emp_id":3,"emp_name":"Cy","dep_id":10,"position":"Analyst"},{"emp_id":4,"emp_name":"Dee","dep_id":20,"position":"Manager"},{"emp_id":5,"emp_name":"Eli","dep_id":20,"position":"Engineer"},{"emp_id":6,"emp_name":"Fay","dep_id":30,"position":"Manager"},{"emp_id":7,"emp_name":"Gus","dep_id":30,"position":"Analyst"},{"emp_id":8,"emp_name":"Hal","dep_id":30,"position":"Engineer"}]}',
},
  { label: "Single employee", input: '{"Employees":[{"emp_id":1,"emp_name":"Rae","dep_id":7,"position":"Clerk"}]}' },
  { label: "Department tie", input: '{"Employees":[{"emp_id":1,"emp_name":"Ana","dep_id":1,"position":"Clerk"},{"emp_id":2,"emp_name":"Ben","dep_id":1,"position":"Clerk"},{"emp_id":3,"emp_name":"Cy","dep_id":2,"position":"Clerk"},{"emp_id":4,"emp_name":"Dee","dep_id":2,"position":"Manager"}]}' },
  { label: "Single department", input: '{"Employees":[{"emp_id":5,"emp_name":"Eli","dep_id":3,"position":"Engineer"},{"emp_id":6,"emp_name":"Fay","dep_id":3,"position":"Manager"}]}' },
  { label: "Long run: 20 employees", input: '{"Employees":[{"emp_id":1,"emp_name":"Dee","dep_id":2,"position":"Analyst"},{"emp_id":2,"emp_name":"Hal","dep_id":1,"position":"Analyst"},{"emp_id":3,"emp_name":"Ben","dep_id":4,"position":"Analyst"},{"emp_id":4,"emp_name":"Gus","dep_id":2,"position":"Engineer"},{"emp_id":5,"emp_name":"Eli","dep_id":3,"position":"Engineer"},{"emp_id":6,"emp_name":"Ben","dep_id":4,"position":"Clerk"},{"emp_id":7,"emp_name":"Dee","dep_id":3,"position":"Manager"},{"emp_id":8,"emp_name":"Fay","dep_id":2,"position":"Analyst"},{"emp_id":9,"emp_name":"Hal","dep_id":4,"position":"Manager"},{"emp_id":10,"emp_name":"Gus","dep_id":2,"position":"Clerk"},{"emp_id":11,"emp_name":"Ana","dep_id":1,"position":"Manager"},{"emp_id":12,"emp_name":"Cy","dep_id":5,"position":"Manager"},{"emp_id":13,"emp_name":"Ana","dep_id":2,"position":"Analyst"},{"emp_id":14,"emp_name":"Ivy","dep_id":5,"position":"Analyst"},{"emp_id":15,"emp_name":"Eli","dep_id":5,"position":"Engineer"},{"emp_id":16,"emp_name":"Ben","dep_id":1,"position":"Analyst"},{"emp_id":17,"emp_name":"Ben","dep_id":5,"position":"Clerk"},{"emp_id":18,"emp_name":"Ivy","dep_id":4,"position":"Manager"},{"emp_id":19,"emp_name":"Ivy","dep_id":2,"position":"Engineer"},{"emp_id":20,"emp_name":"Eli","dep_id":5,"position":"Manager"}]}' },
]

const stagesOf = run => run.frames.map(f => ({
  id: f.phase, clause: code[f.activeLine - 1]?.text.trim() ?? '', label: phases.find(p => p.id === f.phase)?.label ?? f.phase,
  columns: f.columns, rows: f.rows,
}))

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

export default function LargestDepartmentManagerVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStageBoard title="Query stages" stages={stagesOf(run)} active={run.frames.indexOf(step)} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>First count staff per department, then keep every department that ties for the highest count. Ties are kept.</p>
    <p>Only rows whose position is Manager, inside those departments, reach the output.</p>
  </>} />
}
