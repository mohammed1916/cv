import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Students, subjects and exams as JSON',
  url: 'https://leetcode.com/problems/students-and-examinations/',
  complexity: 'Walkthrough: a grid of students times subjects, then one increment per examination row.',
  examples: [{ label: 'Sample school', input: JSON.stringify(sample) }, { label: 'Empty school', input: '{"students":[],"subjects":[],"exams":[]}' }, { label: 'Single student, no exams', input: '{"students":[{"student_id":5,"student_name":"Ada"}],"subjects":["Physics"],"exams":[]}' }, { label: 'Tie between subjects', input: '{"students":[{"student_id":1,"student_name":"Ada"}],"subjects":["Biology","History"],"exams":[{"student_id":1,"subject_name":"Biology"},{"student_id":1,"subject_name":"History"}]}' }, { label: 'Long run: 12 students, 30 exams', input: '{"students":[{"student_id":1,"student_name":"Student 1"},{"student_id":2,"student_name":"Student 2"},{"student_id":3,"student_name":"Student 3"},{"student_id":4,"student_name":"Student 4"},{"student_id":5,"student_name":"Student 5"},{"student_id":6,"student_name":"Student 6"},{"student_id":7,"student_name":"Student 7"},{"student_id":8,"student_name":"Student 8"},{"student_id":9,"student_name":"Student 9"},{"student_id":10,"student_name":"Student 10"},{"student_id":11,"student_name":"Student 11"},{"student_id":12,"student_name":"Student 12"}],"subjects":["Biology","Chemistry","History"],"exams":[{"student_id":10,"subject_name":"Chemistry"},{"student_id":5,"subject_name":"History"},{"student_id":4,"subject_name":"Chemistry"},{"student_id":12,"subject_name":"Chemistry"},{"student_id":7,"subject_name":"Biology"},{"student_id":1,"subject_name":"Biology"},{"student_id":1,"subject_name":"History"},{"student_id":12,"subject_name":"Biology"},{"student_id":7,"subject_name":"Biology"},{"student_id":4,"subject_name":"Chemistry"},{"student_id":1,"subject_name":"History"},{"student_id":10,"subject_name":"Biology"},{"student_id":10,"subject_name":"Chemistry"},{"student_id":10,"subject_name":"Chemistry"},{"student_id":4,"subject_name":"History"},{"student_id":12,"subject_name":"Chemistry"},{"student_id":9,"subject_name":"Biology"},{"student_id":11,"subject_name":"Chemistry"},{"student_id":5,"subject_name":"History"},{"student_id":8,"subject_name":"Biology"},{"student_id":2,"subject_name":"History"},{"student_id":3,"subject_name":"History"},{"student_id":2,"subject_name":"History"},{"student_id":8,"subject_name":"Chemistry"},{"student_id":6,"subject_name":"Chemistry"},{"student_id":6,"subject_name":"Chemistry"},{"student_id":2,"subject_name":"Biology"},{"student_id":2,"subject_name":"History"},{"student_id":9,"subject_name":"History"},{"student_id":4,"subject_name":"Biology"}]}' }],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function StudentsAndExaminations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>Student and subject pairs</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Walkthrough of the query stages on invented sample rows. The school is invented.</p>
    <p>The cross join makes sure a student who never sat a subject still appears with zero.</p>
    <p>Each examination row is counted separately, so two attempts at the same subject count as two.</p>
  </>} />
}
