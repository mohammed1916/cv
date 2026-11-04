import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Users', description: 'Load the users table.' },
    { id: 'join', label: 'Join', description: 'Attach rides to users with a left join.' },
    { id: 'group', label: 'Sum', description: 'Total the distance for each user.' },
    { id: 'order', label: 'Sort', description: 'Order by total distance, then name.' },
    { id: 'output', label: 'Result', description: 'Report name and total distance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with users ({id, name}) and rides ({id, user_id, distance})',
  complexity: 'The trace is for learning the query shape, not an optimized engine.',
  examples: [
    { label: 'Sample', input: '{"users":[{"id":1,"name":"Ana"},{"id":2,"name":"Bo"},{"id":3,"name":"Cy"}],"rides":[{"id":1,"user_id":1,"distance":20},{"id":2,"user_id":2,"distance":30},{"id":3,"user_id":1,"distance":40}]}' },
    { label: 'Ties', input: '{"users":[{"id":1,"name":"Zed"},{"id":2,"name":"Amy"},{"id":3,"name":"Kit"}],"rides":[{"id":1,"user_id":1,"distance":5}]}' },
  ],
}

const phases = [
    { id: 'load', label: 'Users', description: 'Load the users table.' },
    { id: 'join', label: 'Join', description: 'Attach rides to users with a left join.' },
    { id: 'group', label: 'Sum', description: 'Total the distance for each user.' },
    { id: 'order', label: 'Sort', description: 'Order by total distance, then name.' },
    { id: 'output', label: 'Result', description: 'Report name and total distance.' },
  ]

// The stage strip shows where the query is; the table shows the rows held at this stage.
// Rows that were not in the previous stage are marked "new".

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

export default function TravellerTotals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageTable caption={step.message} columns={step.columns} rows={step.rows} previous={run.frames[Math.max(0, run.frames.indexOf(step) - 1)].rows} phaseId={step.phase} />
  </>} renderReasoning={() => <>
    <p>A left join keeps every user, so a user without rides still appears. Summing a missing distance would give null, so coalesce turns it into zero.</p>
    <p>Sorting uses total distance descending, then name ascending, which breaks ties in a fixed way.</p>
  </>} />
}
