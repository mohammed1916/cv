import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'
import { meta } from './meta'

const phases = [
  { id: 'load', label: 'Boxes', description: 'Read each box with its own apples and oranges.' },
  { id: 'join', label: 'Chests', description: 'Add the chest contents of each box that refers to one.' },
  { id: 'done', label: 'Total', description: 'Sum the contributions of every box.' },
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
  inputLabel: 'Object with Boxes ({ box_id, chest_id or null, apple_count, orange_count }) and Chests ({ chest_id, apple_count, orange_count }) lists',
  url: 'https://leetcode.com/problems/count-apples-and-oranges/',
  complexity: 'O(n + m) with a lookup of chests by id, for n boxes and m chests.',
  examples: [
    { label: 'Example', input: '{"Boxes":[{"box_id":1,"chest_id":1,"apple_count":2,"orange_count":1},{"box_id":2,"chest_id":null,"apple_count":4,"orange_count":0},{"box_id":3,"chest_id":2,"apple_count":1,"orange_count":1},{"box_id":4,"chest_id":1,"apple_count":0,"orange_count":2}],"Chests":[{"chest_id":1,"apple_count":3,"orange_count":0},{"chest_id":2,"apple_count":0,"orange_count":5}]}' },
  ],
}

export default function CountApplesAndOranges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>A left join keeps every box, even one without a chest. A chest that several boxes refer to is counted once for each box that refers to it.</p>
  </>} />
}
