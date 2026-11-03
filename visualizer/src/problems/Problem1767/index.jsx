import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Tasks and Executed tables'
const complexity = 'Creates one slot per subtask, so the work is proportional to the total number of slots. The visualizer caps each table at 12 rows and each task at 6 subtasks.'
const examples = [{
  label: 'Sample',
  input: '{"Tasks":[{"task_id":1,"subtasks_count":3},{"task_id":2,"subtasks_count":2},{"task_id":3,"subtasks_count":4}],"Executed":[{"task_id":1,"subtask_id":1},{"task_id":1,"subtask_id":3},{"task_id":2,"subtask_id":1},{"task_id":2,"subtask_id":2}]}',
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
  </>} renderReasoning={() => <p>The recursive part writes every numbered subtask of each task. The left join then keeps only the numbers that never appear in the execution log.</p>} />
}
