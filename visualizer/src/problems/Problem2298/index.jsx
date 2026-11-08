import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Tasks table with submission dates'
const complexity = 'O(n) over the submissions, one weekday lookup per row. The visualizer accepts up to 30 rows per table.'
const examples = [{
  label: 'Sample',
  input: '{"Tasks":[{"task_id":1,"assignee_id":7,"submit_date":"2024-01-06"},{"task_id":2,"assignee_id":7,"submit_date":"2024-01-08"},{"task_id":3,"assignee_id":8,"submit_date":"2024-01-07"},{"task_id":4,"assignee_id":8,"submit_date":"2024-01-12"},{"task_id":5,"assignee_id":9,"submit_date":"2024-01-13"}]}',
},
    { label: 'Single task', input: '{"Tasks":[{"task_id":1,"assignee_id":3,"submit_date":"2024-02-10"}]}' },
    { label: 'Two tasks on one date', input: '{"Tasks":[{"task_id":1,"assignee_id":3,"submit_date":"2024-02-12"},{"task_id":2,"assignee_id":3,"submit_date":"2024-02-12"}]}' },
    { label: 'Weekend edge dates', input: '{"Tasks":[{"task_id":1,"assignee_id":4,"submit_date":"2023-12-31"},{"task_id":2,"assignee_id":4,"submit_date":"2024-01-01"}]}' },
    { label: 'Long run: 30 tasks', input: '{"Tasks":[{"task_id":1,"assignee_id":3,"submit_date":"2024-12-18"},{"task_id":2,"assignee_id":1,"submit_date":"2023-12-22"},{"task_id":3,"assignee_id":2,"submit_date":"2024-01-29"},{"task_id":4,"assignee_id":3,"submit_date":"2024-06-16"},{"task_id":5,"assignee_id":1,"submit_date":"2024-01-16"},{"task_id":6,"assignee_id":1,"submit_date":"2024-01-15"},{"task_id":7,"assignee_id":4,"submit_date":"2024-10-01"},{"task_id":8,"assignee_id":5,"submit_date":"2023-07-05"},{"task_id":9,"assignee_id":2,"submit_date":"2024-09-06"},{"task_id":10,"assignee_id":4,"submit_date":"2023-11-27"},{"task_id":11,"assignee_id":4,"submit_date":"2024-11-27"},{"task_id":12,"assignee_id":2,"submit_date":"2024-11-03"},{"task_id":13,"assignee_id":4,"submit_date":"2023-12-22"},{"task_id":14,"assignee_id":1,"submit_date":"2024-08-26"},{"task_id":15,"assignee_id":2,"submit_date":"2023-12-25"},{"task_id":16,"assignee_id":2,"submit_date":"2024-06-30"},{"task_id":17,"assignee_id":2,"submit_date":"2023-09-29"},{"task_id":18,"assignee_id":2,"submit_date":"2023-12-31"},{"task_id":19,"assignee_id":1,"submit_date":"2024-04-21"},{"task_id":20,"assignee_id":5,"submit_date":"2023-07-07"},{"task_id":21,"assignee_id":5,"submit_date":"2023-09-21"},{"task_id":22,"assignee_id":5,"submit_date":"2023-08-18"},{"task_id":23,"assignee_id":4,"submit_date":"2023-06-05"},{"task_id":24,"assignee_id":4,"submit_date":"2023-12-22"},{"task_id":25,"assignee_id":4,"submit_date":"2024-01-08"},{"task_id":26,"assignee_id":1,"submit_date":"2024-12-10"},{"task_id":27,"assignee_id":2,"submit_date":"2023-10-27"},{"task_id":28,"assignee_id":1,"submit_date":"2023-06-07"},{"task_id":29,"assignee_id":3,"submit_date":"2023-01-17"},{"task_id":30,"assignee_id":1,"submit_date":"2023-02-27"}]}' }]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

function StageStrip({ phases = [], active }) {
  const at = Math.max(0, phases.findIndex(phase => phase.id === active))
  return <ol aria-label="SQL stages" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
    {phases.map((phase, index) => {
      const state = index < at ? 'done' : index === at ? 'active' : 'pending'
      return <li key={phase.id} data-stage={phase.id} data-state={state} title={phase.description} style={{
        padding: '6px 10px', borderRadius: 8, fontSize: 13,
        border: '1px solid var(--border, var(--surface2))',
        background: state === 'active' ? 'var(--primary)' : state === 'done' ? 'var(--surface2)' : 'transparent',
        color: state === 'active' ? 'var(--on-primary, var(--surface))' : 'var(--text)',
        fontWeight: state === 'active' ? 700 : 400,
      }}>{index + 1}. {phase.label}</li>
    })}
  </ol>
}

export default function SqlStageVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StageStrip phases={phases} active={step.phase} />
    <Rows columns={step.columns} rows={step.rows} />
    <output aria-label="Query output">{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
  </>} renderReasoning={() => <p>Each submission date is mapped to its weekday. Saturday and Sunday add to the weekend count, and Monday to Friday add to the working count.</p>} />
}
