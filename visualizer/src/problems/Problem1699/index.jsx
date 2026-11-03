import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'
import { meta } from './meta'

const phases = [
  { id: 'load', label: 'Calls', description: 'Read every call with its two people and duration.' },
  { id: 'pair', label: 'Pair', description: 'Order the two people and add the call to that pair.' },
  { id: 'done', label: 'Result', description: 'Report each pair once with its totals.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }

function TableView({ caption, columns, rows }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}</tr>)}</tbody>
  </table>
}

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Calls list of { from_id, to_id, duration } rows',
  url: 'https://leetcode.com/problems/number-of-calls-between-two-persons/',
  complexity: 'O(n) pass over the calls, with one running total per unordered pair.',
  examples: [
    { label: 'Example', input: '{"Calls":[{"from_id":1,"to_id":2,"duration":60},{"from_id":2,"to_id":1,"duration":30},{"from_id":3,"to_id":4,"duration":100},{"from_id":4,"to_id":3,"duration":40},{"from_id":3,"to_id":4,"duration":10}]}' },
  ],
}

export default function NumberOfCallsBetweenTwoPersons() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>Calls from 1 to 2 and calls from 2 to 1 belong to the same pair, so each call is first put in a canonical order, the smaller id first.</p>
  </>} />
}
