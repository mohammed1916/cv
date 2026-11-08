import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const SAMPLE = {
  "elements": [
    {
      "symbol": "Na",
      "type": "Metal",
      "electrons": 1
    },
    {
      "symbol": "Mg",
      "type": "Metal",
      "electrons": 2
    },
    {
      "symbol": "Ca",
      "type": "Metal",
      "electrons": 2
    },
    {
      "symbol": "Al",
      "type": "Metal",
      "electrons": 3
    },
    {
      "symbol": "O",
      "type": "Nonmetal",
      "electrons": 6
    },
    {
      "symbol": "Cl",
      "type": "Nonmetal",
      "electrons": 7
    },
    {
      "symbol": "F",
      "type": "Nonmetal",
      "electrons": 7
    },
    {
      "symbol": "N",
      "type": "Nonmetal",
      "electrons": 5
    }
  ]
}

const definition = {
  number: meta.number,
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  sql,
  python,
  inputLabel: 'JSON object with an elements table',
  complexity: 'Quadratic in the number of metals times nonmetals: every metal is checked against every nonmetal once.',
  examples: [
    { label: 'Teaching sample', input: JSON.stringify(SAMPLE) },
    { label: 'Single metal and nonmetal', input: '{"elements":[{"symbol":"Na","type":"Metal","electrons":1},{"symbol":"Cl","type":"Nonmetal","electrons":7}]}' },
    { label: 'Equal sums for every pair', input: '{"elements":[{"symbol":"Li","type":"Metal","electrons":1},{"symbol":"O","type":"Nonmetal","electrons":7},{"symbol":"Be","type":"Metal","electrons":1},{"symbol":"F","type":"Nonmetal","electrons":7}]}' },
    { label: 'Largest table, edge electron counts', input: '{"elements":[{"symbol":"Na","type":"Metal","electrons":0},{"symbol":"Mg","type":"Metal","electrons":8},{"symbol":"Al","type":"Metal","electrons":0},{"symbol":"Si","type":"Metal","electrons":8},{"symbol":"P","type":"Nonmetal","electrons":0},{"symbol":"S","type":"Nonmetal","electrons":8},{"symbol":"Cl","type":"Nonmetal","electrons":0},{"symbol":"Ar","type":"Nonmetal","electrons":8},{"symbol":"K","type":"Metalloid","electrons":0},{"symbol":"Ca","type":"Metal","electrons":8},{"symbol":"Ga","type":"Nonmetal","electrons":0},{"symbol":"Ge","type":"Metalloid","electrons":8},{"symbol":"As","type":"Metal","electrons":0},{"symbol":"Se","type":"Nonmetal","electrons":8}]}' },
    { label: 'Long run: 14 rows', input: '{"elements":[{"symbol":"Na","type":"Nonmetal","electrons":4},{"symbol":"Mg","type":"Metalloid","electrons":4},{"symbol":"Al","type":"Nonmetal","electrons":2},{"symbol":"Si","type":"Metal","electrons":6},{"symbol":"P","type":"Metalloid","electrons":7},{"symbol":"S","type":"Metal","electrons":7},{"symbol":"Cl","type":"Metalloid","electrons":4},{"symbol":"Ar","type":"Metal","electrons":6},{"symbol":"K","type":"Metal","electrons":5},{"symbol":"Ca","type":"Nonmetal","electrons":7},{"symbol":"Ga","type":"Metal","electrons":8},{"symbol":"Ge","type":"Metalloid","electrons":8},{"symbol":"As","type":"Nonmetal","electrons":2},{"symbol":"Se","type":"Metal","electrons":7}]}' },
  ],
}

function Table({ columns, rows, empty }) {
  if (!rows.length) return <p>{empty}</p>
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column}>{row[column] === null || row[column] === undefined ? 'NULL' : String(row[column])}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function Problem2480() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <section aria-label="Table state">
      <h3>Working table</h3>
      <p>{step?.message}</p>
      <Table columns={step?.columns ?? []} rows={step?.rows ?? []} empty="No rows at this step." />
      <h3>Result</h3>
      {step?.phase === 'done'
        ? <Table columns={step.columns} rows={run.result} empty="No metal and nonmetal pair forms a bond." />
        : <p>The result is written at the final step.</p>}
    </section>}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>A bond pairs one metal with one nonmetal, and only when the two electron counts add up to 8. Metal-metal and nonmetal-nonmetal pairs are never checked for a bond.</p>
      <p>This is a knowledge-derived teaching model. The sample table was invented for this visualization.</p>
    </>} />
}
