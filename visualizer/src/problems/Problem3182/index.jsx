import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Students, Courses and Enrollments tables'
const complexity = 'O(s * (c + e)) for s students, c courses and e enrollments, which is fine for the 12-row cap.'
const examples = [
  { label: 'Sample', input: '{"Students":[{"student_id":1,"name":"Ann","major":"CS"},{"student_id":2,"name":"Ben","major":"CS"},{"student_id":3,"name":"Cy","major":"Math"},{"student_id":4,"name":"Dee","major":"Bio"}],"Courses":[{"course_id":1,"name":"Algorithms","credits":4,"major":"CS"},{"course_id":2,"name":"Databases","credits":3,"major":"CS"},{"course_id":3,"name":"Calculus","credits":4,"major":"Math"}],"Enrollments":[{"student_id":1,"course_id":1,"semester":"2024S","grade":"A"},{"student_id":1,"course_id":2,"semester":"2024S","grade":"A"},{"student_id":2,"course_id":1,"semester":"2024S","grade":"A"},{"student_id":2,"course_id":2,"semester":"2024S","grade":"B"},{"student_id":3,"course_id":3,"semester":"2024S","grade":"A"},{"student_id":3,"course_id":1,"semester":"2024S","grade":"B"}]}' },
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

export default function FindTopScoringStudents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Only the courses of a student's own major count. The walkthrough first lists those pairs, then checks how many were taken and how many of them earned an A.</p>
    <p>A student with no required courses does not qualify, and every required course must carry an A.</p>
  </>} />
}
