// Knowledge-derived SQL walkthrough. The sample rows are invented for this visualization.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the task counts and the execution log.' },
  { id: 'slots', label: 'Expand', description: 'Number each task from 1 up to its subtask count.' },
  { id: 'done', label: 'Result', description: 'Return the numbered pairs that have no execution row.' },
]

export const sql = `WITH RECURSIVE Slots(task_id, subtask_id, subtasks_count) AS (
  SELECT task_id, 1, subtasks_count FROM Tasks
  UNION ALL
  SELECT task_id, subtask_id + 1, subtasks_count FROM Slots WHERE subtask_id < subtasks_count
)
SELECT s.task_id, s.subtask_id
FROM Slots s
LEFT JOIN Executed e
  ON e.task_id = s.task_id AND e.subtask_id = s.subtask_id
WHERE e.task_id IS NULL
ORDER BY s.task_id, s.subtask_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def missing_subtasks(tasks, executed):
    slots = [(t, k) for t, n in zip(tasks.task_id, tasks.subtasks_count) for k in range(1, n + 1)]
    slots = pd.DataFrame(slots, columns=["task_id", "subtask_id"])
    done = executed[["task_id", "subtask_id"]].drop_duplicates()
    merged = slots.merge(done, how="left", indicator=True)
    missing = merged[merged["_merge"] == "left_only"]
    return missing[["task_id", "subtask_id"]].sort_values(["task_id", "subtask_id"])`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const TASK_COLUMNS = ['task_id', 'subtasks_count']
const EXEC_COLUMNS = ['task_id', 'subtask_id']
const SLOT_COLUMNS = ['task_id', 'subtask_id', 'executed']
const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Tasks and Executed.')
  const { Tasks, Executed } = input
  if (!Array.isArray(Tasks) || Tasks.length < 1 || Tasks.length > 12) throw new Error('Tasks needs 1 to 12 rows.')
  if (!Array.isArray(Executed) || Executed.length > 12) throw new Error('Executed holds at most 12 rows.')
  const tasks = Tasks.map(row => {
    if (!row || !Number.isInteger(row.task_id) || !Number.isInteger(row.subtasks_count) || row.subtasks_count < 1 || row.subtasks_count > 6) throw new Error('Tasks rows need task_id and subtasks_count from 1 to 6.')
    return { task_id: row.task_id, subtasks_count: row.subtasks_count }
  })
  const executed = Executed.map(row => {
    if (!row || !Number.isInteger(row.task_id) || !Number.isInteger(row.subtask_id)) throw new Error('Executed rows need task_id and subtask_id.')
    return { task_id: row.task_id, subtask_id: row.subtask_id }
  })
  return { Tasks: tasks, Executed: executed }
}

export function buildTrace(input) {
  const { Tasks, Executed } = input
  const frames = [
    frame('load', 'FROM Tasks', 'def ', 'Load the task counts.', TASK_COLUMNS, Tasks),
    frame('load', 'LEFT JOIN Executed', 'done = ', 'Load the execution log.', EXEC_COLUMNS, Executed),
  ]
  const done = new Set(Executed.map(row => `${row.task_id}:${row.subtask_id}`))
  const slots = []
  const missing = []
  for (const task of Tasks) {
    for (let k = 1; k <= task.subtasks_count; k++) {
      const executed = done.has(`${task.task_id}:${k}`)
      const row = { task_id: task.task_id, subtask_id: k, executed: executed ? 'yes' : 'no' }
      slots.push(row)
      if (!executed) missing.push({ task_id: task.task_id, subtask_id: k })
      frames.push(frame('slots', 'subtask_id + 1', 'for t, n', `Task ${task.task_id}, subtask ${k} ${executed ? 'has' : 'has no'} execution row.`, SLOT_COLUMNS, slots))
    }
  }
  missing.sort((a, b) => a.task_id - b.task_id || a.subtask_id - b.subtask_id)
  frames.push(frame('done', 'ORDER BY s.task_id', 'return', `Return ${missing.length} missing pair${missing.length === 1 ? '' : 's'}.`, EXEC_COLUMNS, missing))
  return { input, result: missing, frames }
}
