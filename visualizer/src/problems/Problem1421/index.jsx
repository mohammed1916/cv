import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Queries', description: 'Read the query table; it fixes the rows and their order.' },
  { id: 'match', label: 'Match', description: 'Look for the NPV row with the same id and year.' },
  { id: 'output', label: 'Output', description: 'Add the row, using 0 when no NPV row exists.' },
  { id: 'done', label: 'Result', description: 'Return every query with its npv.' },
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
  number: '1421', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with NPV and Queries lists of { id, year } and { id, year, npv } rows',
  url: 'https://leetcode.com/problems/npv-queries/',
  complexity: 'O(q) lookups after an O(n) map build, where n is the NPV row count and q the query count.',
  examples: [
    { label: 'Example', input: '{"NPV":[{"id":1,"year":2018,"npv":100},{"id":2,"year":2019,"npv":40}],"Queries":[{"id":1,"year":2018},{"id":1,"year":2019},{"id":2,"year":2019}]}' },
    { label: 'All missing', input: '{"NPV":[],"Queries":[{"id":7,"year":2021}]}' },
  ],
}

export default function NpvQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>Every query row is kept. A left join finds its NPV row by both id and year; when none exists, COALESCE reports 0.</p>
  </>} />
}
