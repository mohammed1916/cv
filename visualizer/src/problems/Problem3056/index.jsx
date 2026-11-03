import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = 'JSON object with Activities and Age lists'
const complexity = 'O(n + m) time with a hash join on user_id, where n and m are the activity and age row counts.'
const examples = [
  {
    label: 'Teaching sample',
    input: JSON.stringify({
      Activities: [
        { activity_id: 1, user_id: 1, activity_type: 'send', time_spent: 10 },
        { activity_id: 2, user_id: 1, activity_type: 'open', time_spent: 30 },
        { activity_id: 3, user_id: 1, activity_type: 'chat', time_spent: 5 },
        { activity_id: 4, user_id: 2, activity_type: 'send', time_spent: 20 },
        { activity_id: 5, user_id: 2, activity_type: 'open', time_spent: 20 },
        { activity_id: 6, user_id: 3, activity_type: 'send', time_spent: 5 },
        { activity_id: 7, user_id: 3, activity_type: 'open', time_spent: 15 },
        { activity_id: 8, user_id: 4, activity_type: 'open', time_spent: 40 },
        { activity_id: 9, user_id: 5, activity_type: 'send', time_spent: 10 },
        { activity_id: 10, user_id: 5, activity_type: 'chat', time_spent: 10 },
      ],
      Age: [
        { age_bucket: 'teen', user_id: 1 }, { age_bucket: 'teen', user_id: 2 },
        { age_bucket: 'adult', user_id: 3 }, { age_bucket: 'adult', user_id: 4 }, { age_bucket: 'adult', user_id: 5 },
      ],
    }),
  },
  {
    label: 'Only other types',
    input: JSON.stringify({
      Activities: [{ activity_id: 1, user_id: 1, activity_type: 'chat', time_spent: 9 }],
      Age: [{ age_bucket: 'teen', user_id: 1 }],
    }),
  },
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

export default function SnapsAnalysis() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <RowTable step={step} />}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>This is a knowledge-derived teaching model. The sample tables were invented for this visualization and are not the official statement.</p>
    </>} />
}
