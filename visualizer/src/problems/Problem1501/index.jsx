import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'resident', label: 'Residents', description: 'Read the phone prefix to find each person country.' },
  { id: 'participate', label: 'Calls', description: 'Add each call to the country of each resident on it.' },
  { id: 'average', label: 'Average', description: 'Compare each country average with the overall average.' },
  { id: 'done', label: 'Result', description: 'Return the countries above the overall average.' },
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
  number: '1501', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with Person ({ id, name, phone_number }), Country ({ name, country_code }) and Calls ({ caller_id, callee_id, duration }) lists',
  url: 'https://leetcode.com/problems/countries-you-can-safely-invest-in/',
  complexity: 'O(p + c) to attach countries and average the call sides, plus a scan of the countries.',
  examples: [
    { label: 'Example', input: '{"Person":[{"id":1,"name":"Ali","phone_number":"212-555-0101"},{"id":2,"name":"Bea","phone_number":"212-555-0199"},{"id":3,"name":"Chen","phone_number":"972-50-1234"},{"id":4,"name":"Dona","phone_number":"51-998-3333"}],"Country":[{"name":"Morocco","country_code":"212"},{"name":"Israel","country_code":"972"},{"name":"Peru","country_code":"51"}],"Calls":[{"caller_id":1,"callee_id":2,"duration":20},{"caller_id":1,"callee_id":3,"duration":30},{"caller_id":3,"callee_id":4,"duration":40}]}' },
  ],
}

export default function CountriesToInvest() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <p>{step.message}</p>
    <TableView caption="Current rows" columns={step.columns} rows={step.rows} />
  </>} renderReasoning={() => <>
    <p>Knowledge-derived teaching version with invented sample tables.</p>
    <p>A call adds its duration once for each resident on it, so a call between two residents of one country counts twice for that country. The overall average is taken over all calls, and the comparison is made without rounding.</p>
  </>} />
}
