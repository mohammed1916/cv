import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Scores', description: 'Load the exam scores.' },
    { id: 'extremes', label: 'Extremes', description: 'Find the lowest and highest score in each exam.' },
    { id: 'flag', label: 'Flag', description: 'Mark every row at an extreme, ties included.' },
    { id: 'filter', label: 'Quiet', description: 'Keep students who took an exam and were never flagged.' },
    { id: 'output', label: 'Result', description: 'Report quiet students by id.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with students ({student_id, student_name}) and exams ({exam_id, student_id, score})',
  complexity: 'Knowledge-derived teaching model. Per-exam extremes are computed once per exam in this trace.',
  examples: [
    { label: 'Sample', input: '{"students":[{"student_id":1,"student_name":"Ann"},{"student_id":2,"student_name":"Ben"},{"student_id":3,"student_name":"Cal"},{"student_id":4,"student_name":"Dee"},{"student_id":5,"student_name":"Eve"}],"exams":[{"exam_id":1,"student_id":1,"score":50},{"exam_id":1,"student_id":2,"score":70},{"exam_id":1,"student_id":3,"score":90},{"exam_id":2,"student_id":1,"score":60},{"exam_id":2,"student_id":2,"score":55},{"exam_id":2,"student_id":4,"score":40}]}' },
    { label: 'Tie at the low', input: '{"students":[{"student_id":1,"student_name":"Ann"},{"student_id":2,"student_name":"Ben"},{"student_id":3,"student_name":"Cal"},{"student_id":4,"student_name":"Dee"}],"exams":[{"exam_id":1,"student_id":1,"score":50},{"exam_id":1,"student_id":2,"score":50},{"exam_id":1,"student_id":3,"score":60},{"exam_id":1,"student_id":4,"score":90}]}' },
  ],
}

function RowTable({ columns, rows }) {
  return <table aria-label="Current rows">
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>
      {columns.map(column => <td key={column}>{row[column] === null ? 'null' : String(row[column])}</td>)}
    </tr>)}</tbody>
  </table>
}

export default function QuietStudents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RowTable columns={step.columns} rows={step.rows} />
    <output aria-label="Stage">{`${step.phase}: ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>An exam's lowest and highest score are found separately for each exam. Two students who share an extreme score are both flagged, because a tie still means the student was the lowest or highest.</p>
    <p>Only students who took at least one exam are candidates, so a student with no rows is left out of the result.</p>
  </>} />
}
