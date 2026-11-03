import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Tasks table with submission dates'
const complexity = 'O(n) over the submissions, one weekday lookup per row. The visualizer accepts up to 30 rows per table.'
const examples = [{
  label: 'Sample',
  input: '{"Tasks":[{"task_id":1,"assignee_id":7,"submit_date":"2024-01-06"},{"task_id":2,"assignee_id":7,"submit_date":"2024-01-08"},{"task_id":3,"assignee_id":8,"submit_date":"2024-01-07"},{"task_id":4,"assignee_id":8,"submit_date":"2024-01-12"},{"task_id":5,"assignee_id":9,"submit_date":"2024-01-13"}]}',
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
  </>} renderReasoning={() => <p>Each submission date is mapped to its weekday. Saturday and Sunday add to the weekend count, and Monday to Friday add to the working count.</p>} />
}
