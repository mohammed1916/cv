import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, sql, phases } from './algorithm'
import { meta } from './meta'

const RESULT_COLUMNS = ['student_id', 'subject', 'first_score', 'latest_score']
const GROUP_COLUMNS = ['student_id', 'subject', 'exams', 'first_score', 'latest_score']
const SCORE_COLUMNS = ['student_id', 'subject', 'score', 'exam_date']

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, sql,
  inputLabel: 'Object with a scores table (student_id, subject, score, exam_date)',
  url: 'https://leetcode.com/problems/find-students-who-improved/description/',
  complexity: 'Teaching model: one grouping pass, then one comparison per student and subject pair. Visualization caps the table at 16 rows.',
  examples: [
    { label: 'Example', input: '{"scores":[{"student_id":1,"subject":"Math","score":60,"exam_date":"2024-01-01"},{"student_id":1,"subject":"Math","score":80,"exam_date":"2024-02-01"},{"student_id":1,"subject":"Math","score":70,"exam_date":"2024-03-01"},{"student_id":2,"subject":"Art","score":90,"exam_date":"2024-01-10"},{"student_id":2,"subject":"Art","score":85,"exam_date":"2024-02-10"},{"student_id":3,"subject":"Math","score":50,"exam_date":"2024-01-05"},{"student_id":3,"subject":"Art","score":40,"exam_date":"2024-01-03"},{"student_id":3,"subject":"Art","score":40,"exam_date":"2024-04-03"},{"student_id":4,"subject":"Math","score":30,"exam_date":"2024-01-05"},{"student_id":4,"subject":"Math","score":65,"exam_date":"2024-06-01"}]}' },
    { label: 'One exam only', input: '{"scores":[{"student_id":5,"subject":"Bio","score":99,"exam_date":"2024-05-05"}]}' },
  ],
}

function RowTable({ rows, columns }) {
  return <table className="problem-table">
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0 ? <tr><td colSpan={columns.length}>No rows</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function Problem3421() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const columns = step.rows[0] && 'exams' in step.rows[0] ? GROUP_COLUMNS : step.rows[0] && 'exam_date' in step.rows[0] ? SCORE_COLUMNS : RESULT_COLUMNS
    return <>
      <RowTable rows={step.rows} columns={columns} />
      <output aria-label="Current state">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Sorting each pair by date turns "first" and "latest" into the first and last positions, so no extra self-join is needed in the teaching model.</p>
    <p>A student with a single exam date has nothing to compare, and an equal first and latest score is not an improvement.</p>
  </>} />
}
