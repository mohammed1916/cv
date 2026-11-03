import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with NewYork and California tables (student_id, score)'
const complexity = 'Linear in the number of scores. The visualizer caps each table at 16 rows.'
const examples = [
  { label: 'Sample', input: JSON.stringify({
    NewYork: [{ student_id: 1, score: 95 }, { student_id: 2, score: 88 }, { student_id: 3, score: 91 }, { student_id: 4, score: 90 }],
    California: [{ student_id: 1, score: 70 }, { student_id: 2, score: 92 }, { student_id: 3, score: 99 }],
  }) },
  { label: 'Tie', input: JSON.stringify({
    NewYork: [{ student_id: 1, score: 90 }],
    California: [{ student_id: 5, score: 91 }],
  }) },
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

export default function WinnerUniversity() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Winner: ${run.result[0].winner}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each university is reduced to one number: how many of its scores reach the cutoff.</p>
    <p>The two numbers are compared once at the end. Equal counts produce the tie label rather than a winner.</p>
  </>} />
}
