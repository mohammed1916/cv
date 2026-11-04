import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'load', label: 'Scores', description: 'Load the exam scores.' },
    { id: 'extremes', label: 'Extremes', description: 'Find the lowest and highest score in each exam.' },
    { id: 'flag', label: 'Flag', description: 'Mark every row at an extreme, ties included.' },
    { id: 'filter', label: 'Quiet', description: 'Keep students who took an exam and were never flagged.' },
    { id: 'output', label: 'Result', description: 'Report quiet students by id.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with students ({student_id, student_name}) and exams ({exam_id, student_id, score})',
  complexity: 'Per-exam extremes are computed once per exam in this trace.',
  examples: [
    { label: 'Sample', input: '{"students":[{"student_id":1,"student_name":"Ann"},{"student_id":2,"student_name":"Ben"},{"student_id":3,"student_name":"Cal"},{"student_id":4,"student_name":"Dee"},{"student_id":5,"student_name":"Eve"}],"exams":[{"exam_id":1,"student_id":1,"score":50},{"exam_id":1,"student_id":2,"score":70},{"exam_id":1,"student_id":3,"score":90},{"exam_id":2,"student_id":1,"score":60},{"exam_id":2,"student_id":2,"score":55},{"exam_id":2,"student_id":4,"score":40}]}' },
    { label: 'Tie at the low', input: '{"students":[{"student_id":1,"student_name":"Ann"},{"student_id":2,"student_name":"Ben"},{"student_id":3,"student_name":"Cal"},{"student_id":4,"student_name":"Dee"}],"exams":[{"exam_id":1,"student_id":1,"score":50},{"exam_id":1,"student_id":2,"score":50},{"exam_id":1,"student_id":3,"score":60},{"exam_id":1,"student_id":4,"score":90}]}' },
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

export default function QuietStudents() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageTable run={run} step={step} phases={definition.phases} />
    <output aria-label="Stage">{`${step.phase}: ${step.message}`}</output>
  </>} renderReasoning={() => <>
    <p>An exam's lowest and highest score are found separately for each exam. Two students who share an extreme score are both flagged, because a tie still means the student was the lowest or highest.</p>
    <p>Only students who took at least one exam are candidates, so a student with no rows is left out of the result.</p>
  </>} />
}
