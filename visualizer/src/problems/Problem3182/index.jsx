import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Students, Courses and Enrollments tables'
const complexity = 'O(s * (c + e)) for s students, c courses and e enrollments, which is fine for the 12-row cap.'
const examples = [
  { label: 'Sample', input: '{"Students":[{"student_id":1,"name":"Ann","major":"CS"},{"student_id":2,"name":"Ben","major":"CS"},{"student_id":3,"name":"Cy","major":"Math"},{"student_id":4,"name":"Dee","major":"Bio"}],"Courses":[{"course_id":1,"name":"Algorithms","credits":4,"major":"CS"},{"course_id":2,"name":"Databases","credits":3,"major":"CS"},{"course_id":3,"name":"Calculus","credits":4,"major":"Math"}],"Enrollments":[{"student_id":1,"course_id":1,"semester":"2024S","grade":"A"},{"student_id":1,"course_id":2,"semester":"2024S","grade":"A"},{"student_id":2,"course_id":1,"semester":"2024S","grade":"A"},{"student_id":2,"course_id":2,"semester":"2024S","grade":"B"},{"student_id":3,"course_id":3,"semester":"2024S","grade":"A"},{"student_id":3,"course_id":1,"semester":"2024S","grade":"B"}]}' },
    { label: "Single failing grade", input: "{\"Students\": [{\"student_id\": 1, \"name\": \"Eve\", \"major\": \"CS\"}], \"Courses\": [{\"course_id\": 1, \"name\": \"Logic\", \"credits\": 3, \"major\": \"CS\"}], \"Enrollments\": [{\"student_id\": 1, \"course_id\": 1, \"semester\": \"2024F\", \"grade\": \"F\"}]}" },
    { label: "Student with no enrollment", input: "{\"Students\": [{\"student_id\": 1, \"name\": \"Eve\", \"major\": \"CS\"}, {\"student_id\": 2, \"name\": \"Fay\", \"major\": \"Bio\"}], \"Courses\": [{\"course_id\": 1, \"name\": \"Logic\", \"credits\": 3, \"major\": \"CS\"}], \"Enrollments\": [{\"student_id\": 1, \"course_id\": 1, \"semester\": \"2024F\", \"grade\": \"B\"}]}" },
    { label: "Long run: 12 enrollments", input: "{\"Students\": [{\"student_id\": 1, \"name\": \"Gus\", \"major\": \"CS\"}, {\"student_id\": 2, \"name\": \"Hal\", \"major\": \"Math\"}, {\"student_id\": 3, \"name\": \"Ivy\", \"major\": \"Bio\"}, {\"student_id\": 4, \"name\": \"Jo\", \"major\": \"CS\"}], \"Courses\": [{\"course_id\": 1, \"name\": \"Compilers\", \"credits\": 4, \"major\": \"CS\"}, {\"course_id\": 2, \"name\": \"Statistics\", \"credits\": 3, \"major\": \"Math\"}, {\"course_id\": 3, \"name\": \"Genetics\", \"credits\": 3, \"major\": \"Bio\"}, {\"course_id\": 4, \"name\": \"Graphs\", \"credits\": 2, \"major\": \"CS\"}], \"Enrollments\": [{\"student_id\": 1, \"course_id\": 1, \"semester\": \"2025S\", \"grade\": \"A\"}, {\"student_id\": 1, \"course_id\": 2, \"semester\": \"2025F\", \"grade\": \"D\"}, {\"student_id\": 2, \"course_id\": 2, \"semester\": \"2025S\", \"grade\": \"B\"}, {\"student_id\": 2, \"course_id\": 3, \"semester\": \"2025F\", \"grade\": \"F\"}, {\"student_id\": 3, \"course_id\": 3, \"semester\": \"2025S\", \"grade\": \"C\"}, {\"student_id\": 3, \"course_id\": 1, \"semester\": \"2025F\", \"grade\": \"A\"}, {\"student_id\": 4, \"course_id\": 4, \"semester\": \"2025S\", \"grade\": \"D\"}, {\"student_id\": 4, \"course_id\": 1, \"semester\": \"2025F\", \"grade\": \"B\"}, {\"student_id\": 2, \"course_id\": 1, \"semester\": \"2025S\", \"grade\": \"F\"}, {\"student_id\": 3, \"course_id\": 4, \"semester\": \"2025F\", \"grade\": \"C\"}, {\"student_id\": 4, \"course_id\": 2, \"semester\": \"2025S\", \"grade\": \"A\"}, {\"student_id\": 1, \"course_id\": 4, \"semester\": \"2025F\", \"grade\": \"D\"}]}" },
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
