import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Friends table (user1, user2), one row per friendship'
const complexity = 'O(n log n) for the sort of users plus one pass over the friendships. The visualizer caps the table at 12 rows.'
const examples = [{
  label: 'Sample',
  input: '{"Friends":[{"user1":1,"user2":2},{"user1":1,"user2":3},{"user1":2,"user2":3},{"user1":4,"user2":1},{"user1":5,"user2":6}]}',
}]
const reasoning = 'A friendship counts for both people, so each row adds one to each user. The denominator in this teaching version is the number of distinct users named in the table. User 1 has three friends out of six users, which is 50 percent.'

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

export default function PopularityPercentage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>{reasoning}</p>} />
}
