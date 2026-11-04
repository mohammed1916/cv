// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
// Intervals are treated as half-open: a task ending at t and another starting at t do not overlap.
export const sql = `WITH ordered AS (
  SELECT task_id, employee_id, start_time, end_time,
         MAX(end_time) OVER (
           PARTITION BY employee_id
           ORDER BY start_time, end_time
           ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
         ) AS latest_end_before
  FROM Tasks
),
marked AS (
  SELECT task_id, employee_id, start_time, end_time,
         SUM(CASE WHEN latest_end_before IS NULL OR start_time >= latest_end_before THEN 1 ELSE 0 END)
           OVER (PARTITION BY employee_id ORDER BY start_time, end_time) AS block_id
  FROM ordered
),
blocks AS (
  SELECT employee_id, block_id, MIN(start_time) AS block_start, MAX(end_time) AS block_end
  FROM marked
  GROUP BY employee_id, block_id
),
covered AS (
  SELECT employee_id, SUM(block_end - block_start) AS total_task_duration
  FROM blocks
  GROUP BY employee_id
),
events AS (
  SELECT employee_id, start_time AS at_time, 1 AS delta FROM Tasks
  UNION ALL
  SELECT employee_id, end_time AS at_time, -1 AS delta FROM Tasks
),
depth AS (
  SELECT employee_id,
         SUM(delta) OVER (PARTITION BY employee_id ORDER BY at_time, delta ROWS UNBOUNDED PRECEDING) AS running
  FROM events
),
peak AS (
  SELECT employee_id, MAX(running) AS max_concurrent_tasks
  FROM depth
  GROUP BY employee_id
)
SELECT c.employee_id, FLOOR(c.total_task_duration / 3600) AS total_task_hours, p.max_concurrent_tasks
FROM covered c
JOIN peak p ON p.employee_id = c.employee_id
ORDER BY c.employee_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def task_duration_and_peak(tasks):
    result = []
    for emp, group in tasks.sort_values(["employee_id", "start_time"]).groupby("employee_id"):
        covered, block_start, block_end = 0, None, None
        for start, end in group[["start_time", "end_time"]].itertuples(index=False):
            if block_end is None or start >= block_end:
                if block_end is not None:
                    covered += block_end - block_start
                block_start, block_end = start, end
            else:
                block_end = max(block_end, end)
        covered += block_end - block_start
        events = [(s, 1) for s in group["start_time"]] + [(e, -1) for e in group["end_time"]]
        peak = running = 0
        for _, delta in sorted(events):
            running += delta
            peak = max(peak, running)
        result.append({"employee_id": emp, "total_task_hours": covered // 3600, "max_concurrent_tasks": peak})
    return result`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the task intervals.' },
  { id: 'cover', label: 'Merge', description: 'Join overlapping tasks into blocks, per employee.' },
  { id: 'total', label: 'Covered', description: 'Add the length of each block.' },
  { id: 'depth', label: 'Sweep', description: 'Walk the start and end events in time order.' },
  { id: 'peak', label: 'Peak', description: 'Record the highest number of running tasks.' },
  { id: 'done', label: 'Result', description: 'Return one row per employee.' },
]

const TASK_COLUMNS = ['task_id', 'employee_id', 'start_time', 'end_time']

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error(`${name} needs 1 to 12 rows.`)
  for (const row of rows) {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
  }
  return rows.map(row => Object.fromEntries(columns.map(column => [column, row[column]])))
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Tasks table.')
  const Tasks = tableRows(input, 'Tasks', TASK_COLUMNS)
  for (const row of Tasks) {
    if (![row.task_id, row.employee_id, row.start_time, row.end_time].every(Number.isInteger)) throw new Error('Every column is an integer.')
    if (row.start_time < 0 || row.end_time > 3600000) throw new Error('Times are whole seconds between 0 and 3600000.')
    if (row.end_time <= row.start_time) throw new Error('Each task ends after it starts.')
  }
  return { Tasks }
}

export function buildTrace(input) {
  const { Tasks } = input
  const frames = []
  frames.push(frame('load', 'FROM Tasks', 'def ', `Load ${Tasks.length} tasks.`, TASK_COLUMNS, Tasks))

  const ordered = [...Tasks].sort((a, b) => a.employee_id - b.employee_id || a.start_time - b.start_time || a.end_time - b.end_time)
  const byEmployee = new Map()
  for (const task of ordered) {
    if (!byEmployee.has(task.employee_id)) byEmployee.set(task.employee_id, [])
    byEmployee.get(task.employee_id).push(task)
  }

  const blockRows = []
  const totals = []
  const depthRows = []
  const peaks = []
  const blockColumns = [...TASK_COLUMNS, 'block_id']
  for (const [employee_id, tasks] of byEmployee) {
    let block = 0
    let blockStart = null
    let blockEnd = null
    let covered = 0
    for (const task of tasks) {
      const startsBlock = blockEnd === null || task.start_time >= blockEnd
      if (startsBlock) {
        if (blockEnd !== null) covered += blockEnd - blockStart
        block += 1
        blockStart = task.start_time
        blockEnd = task.end_time
      } else {
        blockEnd = Math.max(blockEnd, task.end_time)
      }
      blockRows.push({ ...task, block_id: block })
      frames.push(frame('cover', 'marked AS', 'block_end is None or start',
        `Task ${task.task_id} ${startsBlock ? 'starts a new block' : 'overlaps the current block'} for employee ${employee_id}.`, blockColumns, blockRows))
    }
    covered += blockEnd - blockStart
    totals.push({ employee_id, total_task_duration: covered })
    frames.push(frame('total', 'covered AS', 'covered += block_end',
      `Employee ${employee_id} is busy for ${covered} time units.`, ['employee_id', 'total_task_duration'], totals))

    const events = [
      ...tasks.map(task => ({ employee_id, at_time: task.start_time, delta: 1 })),
      ...tasks.map(task => ({ employee_id, at_time: task.end_time, delta: -1 })),
    ].sort((a, b) => a.at_time - b.at_time || a.delta - b.delta)
    let running = 0
    let peak = 0
    for (const event of events) {
      running += event.delta
      peak = Math.max(peak, running)
      depthRows.push({ ...event, running })
      frames.push(frame('depth', 'depth AS', 'events = ',
        `At time ${event.at_time} the count moves by ${event.delta > 0 ? '+' : ''}${event.delta} to ${running}.`, ['employee_id', 'at_time', 'delta', 'running'], depthRows))
    }
    const total = totals.at(-1).total_task_duration
    peaks.push({ employee_id, total_task_duration: total, max_concurrent_tasks: peak })
    frames.push(frame('peak', 'peak AS', 'peak = max',
      `Employee ${employee_id} never has more than ${peak} task${peak === 1 ? '' : 's'} running at once.`, ['employee_id', 'total_task_duration', 'max_concurrent_tasks'], peaks))
  }

  const result = peaks.map(row => ({ employee_id: row.employee_id, total_task_hours: Math.floor(row.total_task_duration / 3600), max_concurrent_tasks: row.max_concurrent_tasks })).sort((a, b) => a.employee_id - b.employee_id)
  frames.push(frame('done', 'ORDER BY c.employee_id', 'return result', `Return ${result.length} employee row${result.length === 1 ? '' : 's'}.`, ['employee_id', 'total_task_hours', 'max_concurrent_tasks'], result))
  return { input, result, frames }
}
