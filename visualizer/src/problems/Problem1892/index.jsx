import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Friendship (user1_id, user2_id) and Likes (user_id, page_id) tables'
const complexity = 'Roughly O(f * l) for f friendship directions and l like rows, using a set for the existing likes. The visualizer caps each table at 12 rows.'
const examples = [
  { label: 'Sample', input: JSON.stringify({ Friendship: [{ user1_id: 1, user2_id: 2 }, { user1_id: 1, user2_id: 3 }, { user1_id: 2, user2_id: 4 }, { user1_id: 1, user2_id: 5 }], Likes: [{ user_id: 1, page_id: 88 }, { user_id: 2, page_id: 23 }, { user_id: 3, page_id: 24 }, { user_id: 3, page_id: 88 }, { user_id: 4, page_id: 23 }, { user_id: 5, page_id: 24 }] }) },
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

export default function FriendPageRecommendationsVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SqlStages code={code} activeLine={step.activeLine} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Each friendship is read in both directions. A friend's liked page becomes a candidate only when the user has not liked it, and the number of distinct friends behind each candidate is its count.</p>} />
}
