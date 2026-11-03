import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Problems table (problem_id, likes, dislikes)'
const complexity = 'O(p log p) time for p problems, from sorting the kept ids. The visualizer caps Problems at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"Problems":[{"problem_id":4,"likes":1,"dislikes":9},{"problem_id":2,"likes":3,"dislikes":7},{"problem_id":1,"likes":10,"dislikes":2},{"problem_id":3,"likes":6,"dislikes":4},{"problem_id":5,"likes":0,"dislikes":0}]}' },
  { label: 'Exactly 60 percent', input: '{"Problems":[{"problem_id":9,"likes":6,"dislikes":4}]}' },
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

export default function LowQualityProblems() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>The percentage is likes times 100 divided by total votes. The division uses a decimal factor so the result is not truncated to a whole number.</p>
    <p>Problems with no votes have no defined percentage and are skipped. The comparison is strict, so exactly 60 percent is not kept.</p>
  </>} />
}
