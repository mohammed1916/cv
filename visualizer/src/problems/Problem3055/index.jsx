import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = 'JSON object with a Fraud list of {policy_id, state, fraud_score} rows'
const complexity = 'O(n log n) time for the sorts, where n is the number of policies.'
const examples = [
  {
    label: 'Teaching sample',
    input: JSON.stringify({ Fraud: [
      { policy_id: 1, state: 'NY', fraud_score: 90 }, { policy_id: 2, state: 'NY', fraud_score: 40 },
      { policy_id: 3, state: 'NY', fraud_score: 75 }, { policy_id: 4, state: 'NY', fraud_score: 60 },
      { policy_id: 10, state: 'NY', fraud_score: 20 }, { policy_id: 11, state: 'NY', fraud_score: 20 },
      { policy_id: 12, state: 'NY', fraud_score: 5 }, { policy_id: 13, state: 'NY', fraud_score: 65 },
      { policy_id: 5, state: 'CA', fraud_score: 88 }, { policy_id: 6, state: 'CA', fraud_score: 10 },
      { policy_id: 7, state: 'CA', fraud_score: 88 }, { policy_id: 8, state: 'CA', fraud_score: 33 },
      { policy_id: 9, state: 'TX', fraud_score: 50 },
    ] }),
  },
  { label: 'Small state', input: JSON.stringify({ Fraud: [{ policy_id: 9, state: 'TX', fraud_score: 50 }] }) },
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

export default function TopPercentileFraud() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <RowTable step={step} />}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>Ties are broken by policy_id so the rank is deterministic. The sample table was invented for this visualization.</p>
    </>} />
}
