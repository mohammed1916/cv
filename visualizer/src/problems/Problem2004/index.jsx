import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Candidates table (employee_id, experience, salary)'
const complexity = 'O(c log c) time for c candidates, from sorting each group. The visualizer caps Candidates at 12 rows. The budget is fixed at 70000.'
const examples = [
  { label: 'Sample', input: '{"Candidates":[{"employee_id":4,"experience":"Senior","salary":40000},{"employee_id":1,"experience":"Senior","salary":10000},{"employee_id":2,"experience":"Senior","salary":20000},{"employee_id":3,"experience":"Senior","salary":30000},{"employee_id":5,"experience":"Junior","salary":5000},{"employee_id":6,"experience":"Junior","salary":5000},{"employee_id":7,"experience":"Junior","salary":12000}]}' },
  { label: 'Expensive seniors', input: '{"Candidates":[{"employee_id":1,"experience":"Senior","salary":80000},{"employee_id":2,"experience":"Junior","salary":5000},{"employee_id":3,"experience":"Junior","salary":70000}]}' },
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

export default function SeniorsAndJuniorsJoin() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? run.result.map(row => `${row.experience}: ${row.accepted_candidates}`).join(', ') : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Seniors come first because the budget is spent on them before juniors are considered. Within each group, sorting by salary and taking a running total hires the longest affordable prefix.</p>
    <p>A group can accept zero candidates, so both rows are always returned. Candidates with equal salary are ordered by employee_id; the counts do not depend on that order.</p>
  </>} />
}
