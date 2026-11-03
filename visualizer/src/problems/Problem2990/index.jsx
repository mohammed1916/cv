import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Loans table (loan_id, user_id, loan_type)'
const complexity = 'One filter pass and one grouping pass: O(n) time with one entry per user. The visualizer caps the table at 20 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Loans":[{"loan_id":1,"user_id":10,"loan_type":"Mortgage"},{"loan_id":2,"user_id":10,"loan_type":"Refinance"},{"loan_id":3,"user_id":10,"loan_type":"Personal"},{"loan_id":4,"user_id":11,"loan_type":"Mortgage"},{"loan_id":5,"user_id":11,"loan_type":"Mortgage"},{"loan_id":6,"user_id":12,"loan_type":"Refinance"},{"loan_id":7,"user_id":13,"loan_type":"Mortgage"},{"loan_id":8,"user_id":13,"loan_type":"Refinance"},{"loan_id":9,"user_id":13,"loan_type":"Mortgage"}]}',
}]

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
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Other loan types are filtered out first, so they cannot disqualify a user.</p>
    <p>Counting distinct types per user and requiring exactly two checks that both Mortgage and Refinance appear. Repeated loans of one type do not help.</p>
  </>} />
}
