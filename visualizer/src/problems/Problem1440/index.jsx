import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Variables', description: 'Read each variable and its integer value.' },
  { id: 'lookup', label: 'Lookup', description: 'Find the values of both operands.' },
  { id: 'compare', label: 'Compare', description: 'Apply the operator and report true or false.' },
  { id: 'done', label: 'Result', description: 'Return every expression with its outcome.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }


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
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>{phases.map(p => <span key={p.id} style={{ padding: '3px 8px', borderRadius: 999, fontSize: 12, border: '1px solid var(--border)', background: p.id === step.phase ? 'var(--primary)' : 'var(--surface2)', color: p.id === step.phase ? 'var(--text)' : 'var(--text)' }}>{p.label}</span>)}</div>
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

export default function EvaluateBooleanExpression() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p>{step.message}</p>
    <StageTable run={run} step={step} phases={definition.phases} />
  </>} renderReasoning={() => <>
    <p>Sample tables are invented for this walkthrough.</p>
    <p>Each expression names two variables. Their values are looked up first, then the operator decides the outcome, which is reported as the text true or false.</p>
  </>} />
}
