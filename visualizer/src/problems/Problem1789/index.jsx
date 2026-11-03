import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Array of Employee rows'
const complexity = 'Counts each employee once, then keeps the rows that pass the flag or single-department test. The visualizer caps the input at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '[{"employee_id":1,"department_id":10,"primary_flag":"N"},{"employee_id":2,"department_id":20,"primary_flag":"Y"},{"employee_id":2,"department_id":30,"primary_flag":"N"},{"employee_id":3,"department_id":40,"primary_flag":"N"},{"employee_id":3,"department_id":50,"primary_flag":"Y"},{"employee_id":4,"department_id":60,"primary_flag":"Y"}]',
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

export default function KnowledgeDerivedSqlVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>An employee with one association keeps it whatever its flag. An employee with several keeps the row flagged Y, so the output has exactly one department per employee.</p>} />
}
