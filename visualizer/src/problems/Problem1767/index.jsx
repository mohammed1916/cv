import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'

const inputLabel = 'Object with Tasks and Executed tables'
const complexity = 'Creates one slot per subtask, so the work is proportional to the total number of slots. The visualizer caps each table at 12 rows and each task at 6 subtasks.'
const examples = [{
  label: 'Sample',
  input: '{"Tasks":[{"task_id":1,"subtasks_count":3},{"task_id":2,"subtasks_count":2},{"task_id":3,"subtasks_count":4}],"Executed":[{"task_id":1,"subtask_id":1},{"task_id":1,"subtask_id":3},{"task_id":2,"subtask_id":1},{"task_id":2,"subtask_id":2}]}',
}]

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

const CELL = { border: '1px solid var(--border)', padding: '3px 8px', color: 'var(--text)', fontFamily: 'monospace' }

function Rows({ columns = [], rows = [] }) {
  return <div style={{ overflowX: 'auto' }}>
    <table style={{ borderCollapse: 'collapse' }}>
      <thead><tr>{columns.map(column => <th key={column} scope="col" style={CELL}>{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column} style={CELL}>{String(row[column] ?? '')}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

// One line per task, one box per numbered subtask. Filled boxes have an execution row; empty boxes are missing.
// The slot being checked is highlighted.
function SlotGrid({ tasks, executed, current, missing }) {
  const hasRun = new Set(executed.map(r => `${r.task_id}:${r.subtask_id}`))
  const missingSet = new Set((missing ?? []).map(r => `${r.task_id}:${r.subtask_id}`))
  return <div role="img" aria-label="Subtask slots per task" style={{ display: 'grid', gap: 6 }}>
    {tasks.map(task => <div key={task.task_id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 70, fontFamily: 'monospace', color: 'var(--text)' }}>task {task.task_id}</span>
      {Array.from({ length: task.subtasks_count }, (_, k) => {
        const id = k + 1
        const key = `${task.task_id}:${id}`
        const isCurrent = current && current.task_id === task.task_id && current.subtask_id === id
        const done = hasRun.has(key)
        const isMissing = missingSet.has(key)
        return <span key={id} title={`task ${task.task_id}, subtask ${id}`} style={{
          width: 40, height: 34, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: 'monospace', borderRadius: 6,
          border: `${isCurrent ? 3 : 1}px ${done || isMissing ? 'solid' : 'dashed'} ${isCurrent || isMissing ? 'var(--primary)' : 'var(--border)'}`,
          background: done ? 'var(--surface2)' : isMissing ? 'var(--primary)' : 'var(--surface)',
          color: isMissing ? 'var(--on-primary, #fff)' : 'var(--text)',
        }}>{id}</span>
      })}
    </div>)}
    <span style={{ fontSize: 12, color: 'var(--text-muted, var(--text))' }}>Grey: has an execution row. Blue: no execution row. Thick outline: the slot being checked.</span>
  </div>
}

export default function MissingSubtasksVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const current = step.phase === 'slots' ? step.rows[step.rows.length - 1] : null;
    const shownTasks = run.input.Tasks;
    const missing = step.phase === 'done' ? step.rows : null;
    return <>
      <SlotGrid tasks={shownTasks} executed={run.input.Executed} current={current} missing={missing} />
      <output aria-label="Query output" style={{ display: 'block', margin: '10px 0' }}>{step.phase === 'done' ? `Output rows: ${run.result.length}` : step.message}</output>
      {step.phase === 'done' ? <Rows columns={step.columns} rows={step.rows} /> : <Rows columns={['task_id', 'subtask_id', 'executed']} rows={step.phase === 'slots' ? step.rows : []} />}
    </>
  }} renderReasoning={() => <p>The recursive part writes every numbered subtask of each task. The left join then keeps only the numbers that never appear in the execution log.</p>} />
}
