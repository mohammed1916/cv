import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SqlStageStrip from './SqlStageStrip'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'resident', label: 'Residents', description: 'Read the phone prefix to find each person country.' },
  { id: 'participate', label: 'Calls', description: 'Add each call to the country of each resident on it.' },
  { id: 'average', label: 'Average', description: 'Compare each country average with the overall average.' },
  { id: 'done', label: 'Result', description: 'Return the countries above the overall average.' },
]

const STAGE = {
  resident: 'WITH resident AS (...): JOIN Person to Country on the first three digits of phone_number.',
  participate: 'UNION ALL: each call appears once for its caller side and once for its callee side.',
  average: 'GROUP BY country: the average of each country is compared with AVG(duration) over Calls.',
  done: 'ORDER BY country: the countries above the overall average, alphabetically.',
}

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }
const HIGHLIGHT = 'color-mix(in srgb, var(--primary) 28%, var(--surface2))'

function TableView({ caption, columns, rows, isCurrent = () => false }) {
  return <table aria-label={caption} style={{ borderCollapse: 'collapse' }}>
    <caption>{caption}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
    <tbody>{rows.length === 0
      ? <tr><td style={CELL} colSpan={Math.max(1, columns.length)}>No rows yet</td></tr>
      : rows.map((row, index) => <tr key={index} data-current={isCurrent(row, index) ? 'yes' : undefined}
        style={{ background: isCurrent(row, index) ? HIGHLIGHT : undefined, fontWeight: isCurrent(row, index) ? 600 : undefined }}>
        {columns.map(column => <td key={column} style={CELL}>{String(row[column])}</td>)}
      </tr>)}</tbody>
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
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const focus = step.focus
    const isCurrent = (row, index) => {
      if (step.phase === 'resident') return row.id === focus
      if (step.phase === 'participate') return focus > 0 && index >= step.rows.length - focus
      if (step.phase === 'average') return row.country === focus
      return false
    }
    return <>
      <SqlStageStrip phases={definition.phases} current={step.phase} />
      <section aria-label="SQL stage">
        <h3>Stage: {phases.find(p => p.id === step.phase)?.label}</h3>
        <p>{STAGE[step.phase]}</p>
      </section>
      <p>{step.message}</p>
      <TableView caption="Current rows" columns={step.columns} rows={step.rows} isCurrent={isCurrent} />
    </>
  }} renderReasoning={() => <>
    <p>A call adds its duration once for each resident on it, so a call between two residents of one country counts twice for that country. The overall average is taken over all calls, and the comparison is made without rounding.</p>
    <p>Each stage is a table: residents, then the call sides, then one average per country, then the filtered and sorted list.</p>
  </>} />
}
