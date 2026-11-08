import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, SAMPLE_TEXT } from './algorithm'

function StageRail({ phases, active }) {
  return <ol aria-label="SQL stages" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', listStyle: 'none', padding: 0 }}>
    {phases.map(phase => <li key={phase.id} aria-current={phase.id === active ? 'step' : undefined}
      style={{ border: '1px solid var(--surface2)', borderRadius: 6, padding: '4px 10px', background: phase.id === active ? 'var(--primary)' : 'var(--surface2)', color: phase.id === active ? 'var(--on-primary, #fff)' : 'var(--text)' }}>
      <strong>{phase.label}</strong>
    </li>)}
  </ol>
}

const definition = {
  phases: [
    { id: 'load', label: 'Load', description: 'Read every study session.' },
    { id: 'mark', label: 'Mark repeats', description: 'Compare each session with the one three steps earlier.' },
    { id: 'keep', label: 'Spiral', description: 'The longest repeat run reaches the minimum length.' },
    { id: 'skip', label: 'Short', description: 'The longest repeat run is too short.' },
    { id: 'order', label: 'Order', description: 'Sort by spiral length, then by student.' },
    { id: 'done', label: 'Result', description: 'Report the students with a spiral.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with sessions and min_length',
  complexity: 'O(S log S) for S sessions: sort by student and date, then one pass per student.',
  examples: [
    { label: 'Sample', input: SAMPLE_TEXT },
    { label: 'One session, minimum length 3', input: '{"min_length":3,"sessions":[{"session_id":1,"student_id":1,"study_date":"2024-04-01","subject":"Math"}]}' },
    { label: 'Exactly the minimum length', input: '{"min_length":4,"sessions":[{"session_id":1,"student_id":1,"study_date":"2024-04-01","subject":"Math"},{"session_id":2,"student_id":1,"study_date":"2024-04-02","subject":"Art"},{"session_id":3,"student_id":1,"study_date":"2024-04-03","subject":"Music"},{"session_id":4,"student_id":1,"study_date":"2024-04-04","subject":"Math"}]}' },
    { label: 'Below the minimum is left out', input: '{"min_length":4,"sessions":[{"session_id":1,"student_id":2,"study_date":"2024-04-01","subject":"Math"},{"session_id":2,"student_id":2,"study_date":"2024-04-02","subject":"Art"},{"session_id":3,"student_id":2,"study_date":"2024-04-03","subject":"Music"},{"session_id":4,"student_id":2,"study_date":"2024-04-04","subject":"Art"}]}' },
    { label: 'Long run: 3 students, 8 sessions each', input: '{"min_length":5,"sessions":[{"session_id":1,"student_id":1,"study_date":"2024-05-01","subject":"Science"},{"session_id":2,"student_id":1,"study_date":"2024-05-02","subject":"Science"},{"session_id":3,"student_id":1,"study_date":"2024-05-03","subject":"Math"},{"session_id":4,"student_id":1,"study_date":"2024-05-04","subject":"Math"},{"session_id":5,"student_id":1,"study_date":"2024-05-05","subject":"History"},{"session_id":6,"student_id":1,"study_date":"2024-05-06","subject":"Math"},{"session_id":7,"student_id":1,"study_date":"2024-05-07","subject":"Math"},{"session_id":8,"student_id":1,"study_date":"2024-05-08","subject":"Science"},{"session_id":9,"student_id":2,"study_date":"2024-05-01","subject":"Science"},{"session_id":10,"student_id":2,"study_date":"2024-05-02","subject":"Math"},{"session_id":11,"student_id":2,"study_date":"2024-05-03","subject":"History"},{"session_id":12,"student_id":2,"study_date":"2024-05-04","subject":"History"},{"session_id":13,"student_id":2,"study_date":"2024-05-05","subject":"Science"},{"session_id":14,"student_id":2,"study_date":"2024-05-06","subject":"Math"},{"session_id":15,"student_id":2,"study_date":"2024-05-07","subject":"History"},{"session_id":16,"student_id":2,"study_date":"2024-05-08","subject":"Science"},{"session_id":17,"student_id":3,"study_date":"2024-05-01","subject":"History"},{"session_id":18,"student_id":3,"study_date":"2024-05-02","subject":"Math"},{"session_id":19,"student_id":3,"study_date":"2024-05-03","subject":"Science"},{"session_id":20,"student_id":3,"study_date":"2024-05-04","subject":"History"},{"session_id":21,"student_id":3,"study_date":"2024-05-05","subject":"History"},{"session_id":22,"student_id":3,"study_date":"2024-05-06","subject":"Science"},{"session_id":23,"student_id":3,"study_date":"2024-05-07","subject":"History"},{"session_id":24,"student_id":3,"study_date":"2024-05-08","subject":"Science"}]}' },
  ],
}

const cell = { border: '1px solid currentColor', padding: '4px 8px' }

function Rows({ columns = [], rows = [] }) {
  if (rows.length === 0) return <p>No rows yet.</p>
  return <table style={{ borderCollapse: 'collapse' }}>
    <thead><tr>{columns.map(c => <th key={c} style={cell}>{c}</th>)}</tr></thead>
    <tbody>{rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c} style={cell}>{String(row[c])}</td>)}</tr>)}</tbody>
  </table>
}

export default function FindStudentsWithStudySpiralPattern() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <StageRail phases={definition.phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>A session is a repeat when its subject matches the one three sessions earlier. A run of repeats extends the pattern.</p>
    <p>The spiral length counts the three opening sessions plus the repeats in the longest run.</p>
  </>} />
}
