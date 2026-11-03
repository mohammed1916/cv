import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Scores table (student_id, student_name, assignment1, assignment2, assignment3)'
const complexity = 'One pass over the score rows: O(n) time. The visualizer caps the table at 20 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Scores":[{"student_id":1,"student_name":"Ivy","assignment1":10,"assignment2":20,"assignment3":30},{"student_id":2,"student_name":"Jo","assignment1":5,"assignment2":5,"assignment3":5},{"student_id":3,"student_name":"Kai","assignment1":40,"assignment2":10,"assignment3":0},{"student_id":4,"student_name":"Lu","assignment1":25,"assignment2":25,"assignment3":25}]}',
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

export default function ClassPerformanceVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Difference: ${run.result[0].difference_in_score}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each student’s total is the sum of the three assignment columns in that row.</p>
    <p>The answer is the highest total minus the lowest total, so one pass for the totals and one comparison pass are enough.</p>
  </>} />
}
