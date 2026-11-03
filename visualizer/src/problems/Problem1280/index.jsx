import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Students, subjects and exams as JSON',
  url: 'https://leetcode.com/problems/students-and-examinations/',
  complexity: 'Knowledge-derived walkthrough: a grid of students times subjects, then one increment per examination row.',
  examples: [{ label: 'Sample school', input: JSON.stringify(sample) }],
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
    <p>Knowledge-derived walkthrough written for this visualizer. The school is invented.</p>
    <p>The cross join makes sure a student who never sat a subject still appears with zero.</p>
    <p>Each examination row is counted separately, so two attempts at the same subject count as two.</p>
  </>} />
}
