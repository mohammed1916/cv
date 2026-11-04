import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python } from './algorithm'

const phases = [
  { id: 'load', label: 'Sessions', description: 'Read the session durations, measured in seconds.' },
  { id: 'match', label: 'Bin', description: 'Place each session in the bin that covers its duration.' },
  { id: 'output', label: 'Count', description: 'Count the sessions in each bin, empty bins included.' },
  { id: 'done', label: 'Result', description: 'Return the four bins in order.' },
]

const CELL = { border: '1px solid currentColor', padding: '2px 8px' }


const definition = {
  number: '1435', phases, parse: parseInput, build: buildTrace, code, sql, python,
  inputLabel: 'Object with a Sessions list of { session_id, duration } rows; duration is in seconds',
  url: 'https://leetcode.com/problems/create-a-session-bar-chart/',
  complexity: 'O(n * b) for n sessions and b = 4 bins in this visualization; a sorted-bin sweep is O(n log n).',
  examples: [
    { label: 'Example', input: '{"Sessions":[{"session_id":1,"duration":100},{"session_id":2,"duration":400},{"session_id":3,"duration":1000},{"session_id":4,"duration":299},{"session_id":5,"duration":900}]}' },
    { label: 'Boundaries', input: '{"Sessions":[{"session_id":1,"duration":299},{"session_id":2,"duration":300},{"session_id":3,"duration":899},{"session_id":4,"duration":900}]}' },
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

export default function CreateSessionBarChart() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p>{step.message}</p>
    <StageTable run={run} step={step} phases={definition.phases} />
  </>} renderReasoning={() => <>
    <p>Sample tables are invented for this walkthrough.</p>
    <p>A duration in seconds is compared with fixed bin edges. Each bin includes its lower edge and excludes its upper edge, so 300 seconds starts the second bin and 900 seconds starts the 15 or more bin.</p>
  </>} />
}
