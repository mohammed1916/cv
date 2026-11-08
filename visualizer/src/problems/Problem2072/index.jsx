import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
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
  }) }, { label: "Single score", input: "{\"NewYork\":[{\"student_id\":1,\"score\":0}],\"California\":[]}" }, { label: "Equal scores", input: "{\"NewYork\":[{\"student_id\":1,\"score\":80}],\"California\":[{\"student_id\":2,\"score\":80}]}" }, { label: "Perfect scores", input: "{\"NewYork\":[{\"student_id\":1,\"score\":100}],\"California\":[{\"student_id\":2,\"score\":100},{\"student_id\":3,\"score\":0}]}" }, { label: "Long run: 16 scores each", input: "{\"NewYork\":[{\"student_id\":1,\"score\":47},{\"student_id\":2,\"score\":63},{\"student_id\":3,\"score\":77},{\"student_id\":4,\"score\":71},{\"student_id\":5,\"score\":5},{\"student_id\":6,\"score\":41},{\"student_id\":7,\"score\":99},{\"student_id\":8,\"score\":2},{\"student_id\":9,\"score\":28},{\"student_id\":10,\"score\":80},{\"student_id\":11,\"score\":69},{\"student_id\":12,\"score\":95},{\"student_id\":13,\"score\":75},{\"student_id\":14,\"score\":14},{\"student_id\":15,\"score\":94},{\"student_id\":16,\"score\":6}],\"California\":[{\"student_id\":101,\"score\":39},{\"student_id\":102,\"score\":50},{\"student_id\":103,\"score\":43},{\"student_id\":104,\"score\":62},{\"student_id\":105,\"score\":88},{\"student_id\":106,\"score\":33},{\"student_id\":107,\"score\":83},{\"student_id\":108,\"score\":92},{\"student_id\":109,\"score\":1},{\"student_id\":110,\"score\":39},{\"student_id\":111,\"score\":0},{\"student_id\":112,\"score\":81},{\"student_id\":113,\"score\":47},{\"student_id\":114,\"score\":79},{\"student_id\":115,\"score\":11},{\"student_id\":116,\"score\":38}]}" },
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
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Winner: ${run.result[0].winner}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each university is reduced to one number: how many of its scores reach the cutoff.</p>
    <p>The two numbers are compared once at the end. Equal counts produce the tie label rather than a winner.</p>
  </>} />
}
