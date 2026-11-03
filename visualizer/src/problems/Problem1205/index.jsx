import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Transactions and chargebacks as JSON',
  url: 'https://leetcode.com/problems/monthly-transactions-ii/',
  complexity: 'Knowledge-derived walkthrough: one pass per stream, then a keyed merge of the month and country groups.',
  examples: [{ label: 'Sample tables', input: JSON.stringify(sample) }],
}

function RowTable({ rows }) {
  if (!rows.length) return <p>No rows yet.</p>
  const columns = Object.keys(rows[0])
  return <table>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
  </table>
}

export default function MonthlyTransactionsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>Month and country groups</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The tables are invented.</p>
    <p>A chargeback belongs to the country of its transaction but to the month of the chargeback date, so the two streams can land in different groups.</p>
    <p>The merge keeps a group if either stream produced it, and fills the missing side with zero.</p>
  </>} />
}
