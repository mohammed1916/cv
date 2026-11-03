import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Variables', description: 'Read each variable and its integer value.' },
  { id: 'lookup', label: 'Lookup', description: 'Find the values of both operands.' },
  { id: 'compare', label: 'Compare', description: 'Apply the operator and report true or false.' },
  { id: 'done', label: 'Result', description: 'Return every expression with its outcome.' },
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
  number: '1440', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Variables ({ name, value }) and Expressions ({ left_operand, operator, right_operand })',
  url: 'https://leetcode.com/problems/evaluate-boolean-expression/',
  complexity: 'O(e) lookups after an O(v) dictionary build, for v variables and e expressions.',
  examples: [
    { label: 'Example', input: '{"Variables":[{"name":"x","value":66},{"name":"y","value":77}],"Expressions":[{"left_operand":"x","operator":">","right_operand":"y"},{"left_operand":"x","operator":"<","right_operand":"y"},{"left_operand":"y","operator":"=","right_operand":"y"}]}' },
    { label: 'Equal values', input: '{"Variables":[{"name":"a","value":3},{"name":"b","value":3}],"Expressions":[{"left_operand":"a","operator":"=","right_operand":"b"}]}' },
  ],
}

export default function EvaluateBooleanExpression() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>Each expression names two variables. Their values are looked up first, then the operator decides the outcome, which is reported as the text true or false.</p>
  </>} />
}
