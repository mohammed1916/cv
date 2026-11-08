import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStages from './SqlStages'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Friendship (user1_id, user2_id) and Likes (user_id, page_id) tables'
const complexity = 'Roughly O(f * l) for f friendship directions and l like rows, using a set for the existing likes. The visualizer caps each table at 12 rows.'
const examples = [
  { label: 'Sample', input: JSON.stringify({ Friendship: [{ user1_id: 1, user2_id: 2 }, { user1_id: 1, user2_id: 3 }, { user1_id: 2, user2_id: 4 }, { user1_id: 1, user2_id: 5 }], Likes: [{ user_id: 1, page_id: 88 }, { user_id: 2, page_id: 23 }, { user_id: 3, page_id: 24 }, { user_id: 3, page_id: 88 }, { user_id: 4, page_id: 23 }, { user_id: 5, page_id: 24 }] }) },
  { label: 'Single friendship', input: "{\"Friendship\":[{\"user1_id\":1,\"user2_id\":2}],\"Likes\":[{\"user_id\":1,\"page_id\":99}]}" },
  { label: 'Shared page liked by both friends', input: "{\"Friendship\":[{\"user1_id\":1,\"user2_id\":2}],\"Likes\":[{\"user_id\":1,\"page_id\":7},{\"user_id\":2,\"page_id\":7}]}" },
  { label: 'Largest ids', input: "{\"Friendship\":[{\"user1_id\":19,\"user2_id\":20}],\"Likes\":[{\"user_id\":20,\"page_id\":99}]}" },
  { label: 'Long run: 12 rows each', input: "{\"Friendship\":[{\"user1_id\":10,\"user2_id\":11},{\"user1_id\":6,\"user2_id\":14},{\"user1_id\":2,\"user2_id\":1},{\"user1_id\":16,\"user2_id\":15},{\"user1_id\":14,\"user2_id\":12},{\"user1_id\":1,\"user2_id\":19},{\"user1_id\":14,\"user2_id\":16},{\"user1_id\":6,\"user2_id\":10},{\"user1_id\":17,\"user2_id\":1},{\"user1_id\":18,\"user2_id\":16},{\"user1_id\":20,\"user2_id\":6},{\"user1_id\":11,\"user2_id\":20}],\"Likes\":[{\"user_id\":2,\"page_id\":20},{\"user_id\":18,\"page_id\":1},{\"user_id\":1,\"page_id\":63},{\"user_id\":19,\"page_id\":55},{\"user_id\":11,\"page_id\":32},{\"user_id\":18,\"page_id\":16},{\"user_id\":1,\"page_id\":97},{\"user_id\":6,\"page_id\":2},{\"user_id\":15,\"page_id\":23},{\"user_id\":8,\"page_id\":20},{\"user_id\":8,\"page_id\":74},{\"user_id\":16,\"page_id\":14}]}" },
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
