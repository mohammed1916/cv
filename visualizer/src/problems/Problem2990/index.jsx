import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageBoard from './SqlStageBoard'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Loans table (loan_id, user_id, loan_type)'
const complexity = 'One filter pass and one grouping pass: O(n) time with one entry per user. The visualizer caps the table at 20 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Loans":[{"loan_id":1,"user_id":10,"loan_type":"Mortgage"},{"loan_id":2,"user_id":10,"loan_type":"Refinance"},{"loan_id":3,"user_id":10,"loan_type":"Personal"},{"loan_id":4,"user_id":11,"loan_type":"Mortgage"},{"loan_id":5,"user_id":11,"loan_type":"Mortgage"},{"loan_id":6,"user_id":12,"loan_type":"Refinance"},{"loan_id":7,"user_id":13,"loan_type":"Mortgage"},{"loan_id":8,"user_id":13,"loan_type":"Refinance"},{"loan_id":9,"user_id":13,"loan_type":"Mortgage"}]}',
},
  { label: "Single mortgage", input: '{"Loans":[{"loan_id":1,"user_id":5,"loan_type":"Mortgage"}]}' },
  { label: "No Mortgage or Refinance loans", input: '{"Loans":[{"loan_id":1,"user_id":5,"loan_type":"Personal"},{"loan_id":2,"user_id":6,"loan_type":"Auto"}]}' },
  { label: "Equal user counts", input: '{"Loans":[{"loan_id":1,"user_id":1,"loan_type":"Mortgage"},{"loan_id":2,"user_id":2,"loan_type":"Refinance"},{"loan_id":3,"user_id":2,"loan_type":"Refinance"},{"loan_id":4,"user_id":1,"loan_type":"Mortgage"}]}' },
  { label: "Long run: 20 loans", input: '{"Loans":[{"loan_id":1,"user_id":2,"loan_type":"Mortgage"},{"loan_id":2,"user_id":5,"loan_type":"Auto"},{"loan_id":3,"user_id":3,"loan_type":"Refinance"},{"loan_id":4,"user_id":5,"loan_type":"Personal"},{"loan_id":5,"user_id":2,"loan_type":"Mortgage"},{"loan_id":6,"user_id":1,"loan_type":"Auto"},{"loan_id":7,"user_id":2,"loan_type":"Refinance"},{"loan_id":8,"user_id":1,"loan_type":"Refinance"},{"loan_id":9,"user_id":3,"loan_type":"Auto"},{"loan_id":10,"user_id":1,"loan_type":"Auto"},{"loan_id":11,"user_id":6,"loan_type":"Refinance"},{"loan_id":12,"user_id":6,"loan_type":"Mortgage"},{"loan_id":13,"user_id":1,"loan_type":"Refinance"},{"loan_id":14,"user_id":4,"loan_type":"Refinance"},{"loan_id":15,"user_id":5,"loan_type":"Personal"},{"loan_id":16,"user_id":2,"loan_type":"Personal"},{"loan_id":17,"user_id":2,"loan_type":"Auto"},{"loan_id":18,"user_id":5,"loan_type":"Mortgage"},{"loan_id":19,"user_id":2,"loan_type":"Auto"},{"loan_id":20,"user_id":1,"loan_type":"Mortgage"}]}' },
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

export default function LoanTypesVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStageBoard title="Query stages" stages={stagesOf(run)} active={run.frames.indexOf(step)} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Other loan types are filtered out first, so they cannot disqualify a user.</p>
    <p>Counting distinct types per user and requiring exactly two checks that both Mortgage and Refinance appear. Repeated loans of one type do not help.</p>
  </>} />
}
