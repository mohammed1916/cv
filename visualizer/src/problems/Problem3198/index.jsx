import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const SAMPLE = { Cities: [
  { state: 'Texas', city: 'Dallas' },
  { state: 'Ohio', city: 'Toledo' },
  { state: 'Texas', city: 'Austin' },
  { state: 'Ohio', city: 'Akron' },
  { state: 'Ohio', city: 'Athens' },
] }
const inputLabel = 'JSON object with a Cities table (state, city)'
const complexity = 'Sorting the rows dominates: O(n log n) for n city rows.'
const examples = [
  { label: 'Teaching sample', input: JSON.stringify(SAMPLE) },
  { label: 'One city', input: '{"Cities":[{"state":"Maine","city":"Bangor"}]}' },
  { label: 'Same city name in two states', input: '{"Cities":[{"state":"Iowa","city":"Ames"},{"state":"Maine","city":"Ames"},{"state":"Iowa","city":"Ankeny"}]}' },
  { label: 'Table at the 12-row limit', input: '{"Cities":[{"state":"Iowa","city":"Town 01"},{"state":"Maine","city":"Town 02"},{"state":"Ohio","city":"Town 03"},{"state":"Iowa","city":"Town 04"},{"state":"Maine","city":"Town 05"},{"state":"Ohio","city":"Town 06"},{"state":"Iowa","city":"Town 07"},{"state":"Maine","city":"Town 08"},{"state":"Ohio","city":"Town 09"},{"state":"Iowa","city":"Town 10"},{"state":"Maine","city":"Town 11"},{"state":"Ohio","city":"Town 12"}]}' },
]

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel, complexity, examples }

const tableStyle = { borderCollapse: 'collapse', width: '100%', fontSize: '0.9rem' }
const cellStyle = { border: '1px solid currentColor', padding: '0.3rem 0.5rem', textAlign: 'left' }

function Table({ columns, rows, empty }) {
  if (!rows.length) return <p>{empty}</p>
  return <div style={{ overflowX: 'auto' }}>
    <table style={tableStyle}>
      <thead><tr>{columns.map(column => <th key={column} scope="col" style={cellStyle}>{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column} style={cellStyle}>{row[column] === null || row[column] === undefined ? 'NULL' : String(row[column])}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function CitiesInEachState() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <section aria-label="Table state">
      <h3>Working table</h3>
      <p>{step?.message}</p>
      <Table columns={step?.columns ?? []} rows={step?.rows ?? []} empty="No rows at this step." />
      <h3>Result</h3>
      {step?.phase === 'done'
        ? <Table columns={step.columns} rows={run.result} empty="The query returns no rows." />
        : <p>The result is written at the final step.</p>}
    </section>}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>This is an independently written teaching model. The sample tables were invented for this visualization.</p>
    </>} />
}
