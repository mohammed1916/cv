import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const SAMPLE = { user_permissions: [
  { user_id: 1, permissions: 6 },
  { user_id: 2, permissions: 12 },
  { user_id: 3, permissions: 14 },
] }
const inputLabel = 'JSON object with a user_permissions table (user_id, permissions as integers)'
const complexity = 'Constant work per user: O(n) for n users.'
const examples = [
  { label: 'Teaching sample', input: JSON.stringify(SAMPLE) },
  { label: 'Single user', input: '{"user_permissions":[{"user_id":1,"permissions":0}]}' },
  { label: 'Equal permissions tie', input: '{"user_permissions":[{"user_id":1,"permissions":5},{"user_id":2,"permissions":5},{"user_id":3,"permissions":5}]}' },
  { label: 'Top of the allowed range', input: '{"user_permissions":[{"user_id":7,"permissions":1048575},{"user_id":8,"permissions":1048575}]}' },
  { label: 'Long run: 12 users', input: '{"user_permissions":[{"user_id":1,"permissions":336880},{"user_id":2,"permissions":231385},{"user_id":3,"permissions":806300},{"user_id":4,"permissions":929367},{"user_id":5,"permissions":285770},{"user_id":6,"permissions":427643},{"user_id":7,"permissions":517848},{"user_id":8,"permissions":45310},{"user_id":9,"permissions":883472},{"user_id":10,"permissions":494759},{"user_id":11,"permissions":166950},{"user_id":12,"permissions":559355}]}' },
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

export default function CommonPermissions() {
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
