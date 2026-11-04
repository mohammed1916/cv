import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, sql } from './algorithm'
import { meta } from './meta'

const inputLabel = 'Object with now, idle and sessions (minutes of the day)'
const complexity = 'O(n) time and O(z) space for n session rows and z zombies.'
const examples = [
  { label: 'Mixed rows', input: '{"now":600,"idle":30,"sessions":[{"session_id":"S101","last_active":540,"is_open":true},{"session_id":"S102","last_active":585,"is_open":true},{"session_id":"S103","last_active":500,"is_open":false},{"session_id":"S104","last_active":570,"is_open":true},{"session_id":"S105","last_active":300,"is_open":true}]}' },
  { label: 'All active', input: '{"now":120,"idle":60,"sessions":[{"session_id":"A1","last_active":100,"is_open":true},{"session_id":"B2","last_active":40,"is_open":false}]}' },
]
const reasoning = [
  'A session is a zombie when it is still open and its last activity is at least the idle threshold before the reference time.',
  'Closed sessions are never zombies, however old. The comparison is inclusive, so exactly 30 idle minutes counts when the threshold is 30.',
]

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, sql, inputLabel, complexity, examples }

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

export default function FindZombieSessions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageRail phases={phases} active={step.phase} />
    <table aria-label="Sessions">
      <thead><tr><th>session_id</th><th>last_active</th><th>is_open</th><th>idle</th><th>zombie</th></tr></thead>
      <tbody>{run.input.sessions.map(row => {
        const current = step.row?.session_id === row.session_id
        return <tr key={row.session_id} data-current={current ? 'yes' : 'no'}>
          <td>{row.session_id}</td><td>{row.last_active}</td><td>{String(row.is_open)}</td>
          <td>{run.input.now - row.last_active}</td>
          <td>{current && step.row.zombie !== null ? String(step.row.zombie) : ''}</td>
        </tr>
      })}</tbody>
    </table>
    <output aria-label="Zombie ids">{`zombies: ${step.result.length ? step.result.join(', ') : 'none yet'}`}</output>
  </>} renderReasoning={() => <>{reasoning.map(text => <p key={text}>{text}</p>)}</>} />
}
