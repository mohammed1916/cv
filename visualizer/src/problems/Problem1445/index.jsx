import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Sales', description: 'Read every sales row, with its fruit and count.' },
  { id: 'group', label: 'Group', description: 'Total apples and oranges for one date, then subtract.' },
  { id: 'done', label: 'Result', description: 'Return the differences in date order.' },
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
  number: '1445', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Sales list of { sale_date, fruit, sold_num } rows',
  url: 'https://leetcode.com/problems/apples-oranges/',
  complexity: 'O(n) to group the rows, plus a sort of the distinct dates.',
  examples: [
    { label: 'Example', input: '{"Sales":[{"sale_date":"2020-06-01","fruit":"apples","sold_num":15},{"sale_date":"2020-05-30","fruit":"oranges","sold_num":8},{"sale_date":"2020-06-02","fruit":"oranges","sold_num":5},{"sale_date":"2020-05-30","fruit":"apples","sold_num":10},{"sale_date":"2020-06-01","fruit":"oranges","sold_num":15},{"sale_date":"2020-06-02","fruit":"apples","sold_num":20}]}' },
  ],
}

export default function ApplesOranges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>Each date is grouped on its own. Apple counts are added and orange counts are subtracted, so the difference is positive when apples sell more.</p>
  </>} />
}
