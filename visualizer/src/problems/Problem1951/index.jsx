import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with a Relations table (user_id, follower_id)'
const complexity = 'O(u^2 * f) time for u users and f followers per user in this walkthrough. The visualizer caps Relations at 12 rows.'
const examples = [
  { label: 'Sample', input: '{"Relations":[{"user_id":1,"follower_id":10},{"user_id":1,"follower_id":11},{"user_id":1,"follower_id":12},{"user_id":2,"follower_id":10},{"user_id":2,"follower_id":11},{"user_id":2,"follower_id":13},{"user_id":3,"follower_id":11},{"user_id":3,"follower_id":12},{"user_id":3,"follower_id":10},{"user_id":4,"follower_id":13}]}' },
  { label: 'Three-way tie', input: '{"Relations":[{"user_id":1,"follower_id":5},{"user_id":1,"follower_id":6},{"user_id":2,"follower_id":5},{"user_id":2,"follower_id":6},{"user_id":3,"follower_id":5},{"user_id":3,"follower_id":6}]}' },
    { label: 'Single relation', input: '{"Relations":[{"user_id":1,"follower_id":2}]}' },
    { label: 'Relations with no shared follower', input: '{"Relations":[{"user_id":1,"follower_id":5},{"user_id":2,"follower_id":6}]}' },
    { label: 'Long run: twelve relations', input: '{"Relations":[{"user_id":4,"follower_id":6},{"user_id":2,"follower_id":6},{"user_id":4,"follower_id":6},{"user_id":2,"follower_id":5},{"user_id":4,"follower_id":5},{"user_id":2,"follower_id":8},{"user_id":4,"follower_id":9},{"user_id":2,"follower_id":8},{"user_id":4,"follower_id":7},{"user_id":2,"follower_id":7},{"user_id":4,"follower_id":9},{"user_id":2,"follower_id":6}]}' },
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

export default function AllPairsMaximumCommonFollowers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>The self-join pairs every two users that follow a common account, so the count of shared followers is the number of matching rows.</p>
    <p>Pairs with no shared follower never appear in this join, so they are not candidates in this walkthrough. Only the pairs whose count equals the maximum are returned.</p>
  </>} />
}
