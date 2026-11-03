import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Points', description: 'Read the points and order them by x, then y.' },
  { id: 'pair', label: 'Pairs', description: 'Test each pair as opposite corners of a rectangle.' },
  { id: 'sort', label: 'Sort', description: 'Order the rectangles by area, then by corners.' },
  { id: 'done', label: 'Result', description: 'Return the rectangles with positive area.' },
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
  number: '1459', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Points list of { id, x_value, y_value } rows',
  url: 'https://leetcode.com/problems/rectangles-area/',
  complexity: 'O(p^2) pairs for p points, plus a sort of the rectangles found.',
  examples: [
    { label: 'Example', input: '{"Points":[{"id":1,"x_value":1,"y_value":1},{"id":2,"x_value":3,"y_value":4},{"id":3,"x_value":1,"y_value":4},{"id":4,"x_value":3,"y_value":1},{"id":5,"x_value":2,"y_value":2}]}' },
    { label: 'Corner pair', input: '{"Points":[{"id":1,"x_value":0,"y_value":0},{"id":2,"x_value":0,"y_value":5},{"id":3,"x_value":4,"y_value":0}]}' },
  ],
}

export default function RectanglesArea() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>Two points can be opposite corners only when they differ in both coordinates. Their area is the width times the height, and each pair is listed once with its smaller corner first.</p>
  </>} />
}
