import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = 'JSON object with a Friends list of {user_id1, user_id2} rows'
const complexity = 'Roughly O(sum of d(u) * d(v)) over the friendship pairs, where d is the number of friends; the visualization keeps the sample small.'
const examples = [
  {
    label: 'Teaching sample',
    input: JSON.stringify({ Friends: [
      { user_id1: 1, user_id2: 2 }, { user_id1: 2, user_id2: 1 }, { user_id1: 2, user_id2: 3 },
      { user_id1: 1, user_id2: 3 }, { user_id1: 3, user_id2: 4 }, { user_id1: 4, user_id2: 5 },
      { user_id1: 3, user_id2: 5 }, { user_id1: 6, user_id2: 7 }, { user_id1: 7, user_id2: 8 },
    ] }),
  },
  { label: 'Single friendship', input: JSON.stringify({ Friends: [{ user_id1: 1, user_id2: 2 }, { user_id1: 2, user_id2: 1 }] }) },
  { label: 'Single friendship', input: '{"Friends":[{"user_id1":1,"user_id2":2}]}' },
  { label: 'Mutual friendship', input: '{"Friends":[{"user_id1":1,"user_id2":2},{"user_id1":2,"user_id2":1}]}' },
  { label: 'Long run: 20 friendships', input: '{"Friends":[{"user_id1":3,"user_id2":2},{"user_id1":1,"user_id2":6},{"user_id1":7,"user_id2":2},{"user_id1":5,"user_id2":8},{"user_id1":3,"user_id2":8},{"user_id1":1,"user_id2":8},{"user_id1":7,"user_id2":4},{"user_id1":5,"user_id2":4},{"user_id1":3,"user_id2":6},{"user_id1":1,"user_id2":6},{"user_id1":7,"user_id2":2},{"user_id1":5,"user_id2":4},{"user_id1":3,"user_id2":8},{"user_id1":1,"user_id2":8},{"user_id1":7,"user_id2":6},{"user_id1":5,"user_id2":8},{"user_id1":3,"user_id2":8},{"user_id1":1,"user_id2":4},{"user_id1":7,"user_id2":2},{"user_id1":5,"user_id2":8}]}' },
]

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel, complexity, examples }

function RowTable({ step }) {
  const { columns, rows } = step
  return <div style={{ overflowX: 'auto' }} role="region" aria-label="Current rows">
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.length === 0
        ? <tr><td colSpan={columns.length}>No rows</td></tr>
        : rows.map((row, index) => <tr key={index}>
          {columns.map(column => <td key={column}>{row[column] === null ? 'NULL' : String(row[column])}</td>)}
        </tr>)}</tbody>
    </table>
  </div>
}

export default function FriendsWithNoMutualFriends() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <RowTable step={step} />}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>The sample tables are invented for this visualization.</p>
    </>} />
}
