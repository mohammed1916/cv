import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Salaries', description: 'Read every employee row.' },
  { id: 'rate', label: 'Rate', description: 'Find each company maximum and choose its tax rate.' },
  { id: 'pay', label: 'Pay', description: 'Apply the rate to each employee and round.' },
  { id: 'done', label: 'Result', description: 'Return the after-tax salaries.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }


const definition = {
  number: '1468', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Salaries list of { company_id, employee_id, employee_name, salary } rows',
  url: 'https://leetcode.com/problems/calculate-salaries/',
  complexity: 'O(n) to find company maxima, plus a sort of the employees by id.',
  examples: [
    { label: 'Example', input: '{"Salaries":[{"company_id":1,"employee_id":1,"employee_name":"Alice","salary":2000},{"company_id":1,"employee_id":2,"employee_name":"Bob","salary":500},{"company_id":1,"employee_id":3,"employee_name":"Erin","salary":1001},{"company_id":2,"employee_id":4,"employee_name":"Carl","salary":15000},{"company_id":3,"employee_id":5,"employee_name":"Dan","salary":900}]}' },
    { label: 'One salary row', input: '{"Salaries":[{"company_id":1,"employee_id":1,"employee_name":"Ada","salary":0}]}' },
    { label: 'Equal salaries', input: '{"Salaries":[{"company_id":1,"employee_id":1,"employee_name":"Ada","salary":500},{"company_id":1,"employee_id":2,"employee_name":"Bo","salary":500}]}' },
    { label: 'Largest salaries, 12 rows', input: '{"Salaries":[{"company_id":1,"employee_id":1,"employee_name":"E0","salary":1000000},{"company_id":2,"employee_id":2,"employee_name":"E1","salary":999999},{"company_id":3,"employee_id":3,"employee_name":"E2","salary":999998},{"company_id":1,"employee_id":4,"employee_name":"E3","salary":999997},{"company_id":2,"employee_id":5,"employee_name":"E4","salary":999996},{"company_id":3,"employee_id":6,"employee_name":"E5","salary":999995},{"company_id":1,"employee_id":7,"employee_name":"E6","salary":999994},{"company_id":2,"employee_id":8,"employee_name":"E7","salary":999993},{"company_id":3,"employee_id":9,"employee_name":"E8","salary":999992},{"company_id":1,"employee_id":10,"employee_name":"E9","salary":999991},{"company_id":2,"employee_id":11,"employee_name":"E10","salary":999990},{"company_id":3,"employee_id":12,"employee_name":"E11","salary":999989}]}' },
    { label: 'Long run: 12 rows, 3 companies', input: '{"Salaries":[{"company_id":3,"employee_id":1,"employee_name":"gus0","salary":8499},{"company_id":3,"employee_id":2,"employee_name":"cy1","salary":5669},{"company_id":2,"employee_id":3,"employee_name":"ada2","salary":5296},{"company_id":1,"employee_id":4,"employee_name":"fay3","salary":2196},{"company_id":2,"employee_id":5,"employee_name":"cy4","salary":826},{"company_id":2,"employee_id":6,"employee_name":"bo5","salary":7045},{"company_id":3,"employee_id":7,"employee_name":"gus6","salary":97},{"company_id":2,"employee_id":8,"employee_name":"hal7","salary":4014},{"company_id":1,"employee_id":9,"employee_name":"gus8","salary":3466},{"company_id":1,"employee_id":10,"employee_name":"dan9","salary":7517},{"company_id":3,"employee_id":11,"employee_name":"bo10","salary":9865},{"company_id":2,"employee_id":12,"employee_name":"dan11","salary":3665}]}' },
  ],
}

const cell = { border: '1px solid var(--border)', padding: '4px 8px', textAlign: 'left', color: 'var(--text)' }

// The stage strip shows where the query is; the table shows the rows held at this stage.
// Rows that were not in the previous stage are marked "new".
function StageTable({ run, step, phases }) {
  const view = step.view || {}
  const caption = view.caption || step.caption || 'Current rows'
  const rows = view.rows || step.rows || []
  const columns = view.columns || step.columns || (rows[0] ? Object.keys(rows[0]) : [])
  const index = run.frames.indexOf(step)
  const prior = index > 0 ? run.frames[index - 1] : null
  const previous = prior ? (prior.view?.rows || prior.rows || []) : []
  const seen = new Set(previous.map(row => JSON.stringify(row)))
  return <section aria-label="Current table">
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>{phases.map(p => <span key={p.id} style={{ padding: '3px 8px', borderRadius: 999, fontSize: 12, border: '1px solid var(--border)', background: p.id === step.phase ? 'var(--primary)' : 'var(--surface2)', color: p.id === step.phase ? '#fff' : 'var(--text)' }}>{p.label}</span>)}</div>
    <h3 style={{ margin: '0 0 6px', fontSize: 16, color: 'var(--text)' }}>{caption}</h3>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14, color: 'var(--text)' }}>
      <thead><tr>{columns.map(column => <th key={column} style={cell}>{column}</th>)}<th style={cell}>change</th></tr></thead>
      <tbody>{rows.length
        ? rows.map((row, i) => {
          const isNew = !seen.has(JSON.stringify(row))
          return <tr key={i} style={{ background: isNew ? 'var(--surface2)' : 'transparent' }}>
            {columns.map(column => <td key={column} style={cell}>{String(row[column] ?? 'NULL')}</td>)}
            <td style={cell}>{isNew ? 'new' : ''}</td>
          </tr>
        })
        : <tr><td style={cell} colSpan={columns.length + 1}>No rows</td></tr>}</tbody>
    </table>
  </section>
}

export default function CalculateSalaries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p>{step.message}</p>
    <StageTable run={run} step={step} phases={definition.phases} />
  </>} renderReasoning={() => <>
    <p>Sample tables are invented for this walkthrough.</p>
    <p>The company maximum picks one rate for all of its staff: under 1000 pays nothing, 1000 to 10000 pays 24 percent, and above 10000 pays 49 percent. The result is rounded half up to a whole number.</p>
  </>} />
}
