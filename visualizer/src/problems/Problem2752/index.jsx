import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases, sample } from './algorithm'
import { meta } from './meta'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Transactions as JSON',
  url: 'https://leetcode.com/problems/customers-with-maximum-number-of-transactions-on-consecutive-days/',
  complexity: 'Knowledge-derived walkthrough: one sort per customer plus streak grouping.',
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

export default function ConsecutiveDays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <h3>{meta.title}: working table</h3>
    <RowTable rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived walkthrough written for this visualizer. The sample tables are invented.</p>
    <p>Duplicate transactions on one day are collapsed first, so a day counts once.</p>
    <p>Subtracting the row number from the date keeps consecutive days on one shared key.</p>
  </>} />
}
