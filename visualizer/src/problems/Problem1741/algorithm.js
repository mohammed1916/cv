// Total time per employee per day: sum of out_time minus in_time over every entry, grouped by day and employee.
export const sql = `SELECT event_day AS day, emp_id, SUM(out_time - in_time) AS total_time
FROM Employees
GROUP BY emp_id, event_day;`

const JS_LINES = [
  { text: 'const totals = new Map()', py: 'totals = {}' },
  { text: 'for (const row of rows) {', py: 'for row in rows' },
  { text: 'const key = `${row.event_day}|${row.emp_id}`', py: 'key = (row' },
  { text: 'totals.set(key, (totals.get(key) ?? 0) + row.out_time - row.in_time)', py: 'totals[key] = totals.get' },
  { text: '}', py: null },
  { text: 'return [...totals].map(([key, total_time]) => ({ key, total_time }))', py: 'return [' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def totalTimeSpent(rows):
    totals = {}
    for row in rows:
        key = (row['event_day'], row['emp_id'])
        totals[key] = totals.get(key, 0) + row['out_time'] - row['in_time']
    return [{'day': d, 'emp_id': e, 'total_time': t} for (d, e), t in totals.items()]
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return [')]))

export const phases = [
  { id: 'from', label: 'FROM', description: 'Read each entry and exit pair.' },
  { id: 'group', label: 'GROUP BY', description: 'Entries of one employee on one day share a group.' },
  { id: 'sum', label: 'SUM', description: 'Add out_time minus in_time to the group total.' },
  { id: 'done', label: 'Output', description: 'One row per employee and day.' },
]

export const examples = [
  { label: 'Two visits one day', input: '[{"emp_id":3,"event_day":"2026-02-01","in_time":2,"out_time":9},{"emp_id":3,"event_day":"2026-02-01","in_time":12,"out_time":20},{"emp_id":5,"event_day":"2026-02-01","in_time":1,"out_time":6},{"emp_id":3,"event_day":"2026-02-02","in_time":4,"out_time":5}]' },
  { label: 'Single entry', input: '[{"emp_id":8,"event_day":"2026-03-10","in_time":100,"out_time":160}]' },
]

export const complexity = 'O(n) time and O(g) space for n entries and g employee-day groups.'

export function parseInput(text) {
  const rows = JSON.parse(text)
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 30) throw new Error('Use a JSON array of 1 to 30 entries (visual cap).')
  for (const row of rows) {
    if (!Number.isInteger(row.emp_id) || typeof row.event_day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.event_day)) throw new Error('Each row has an integer emp_id and an event_day date.')
    if (!Number.isInteger(row.in_time) || !Number.isInteger(row.out_time) || row.in_time < 1 || row.out_time > 1440 || row.in_time >= row.out_time) throw new Error('Times are minutes from 1 to 1440, with in_time before out_time.')
  }
  return rows
}

export function buildTrace(rows) {
  const frames = []
  const totals = new Map()
  const snap = extra => ({ totals: [...totals].map(([k, v]) => ({ key: k, total: v })), ...extra })
  rows.forEach((row, i) => {
    frames.push({ phase: 'from', activeLine: 2, index: i, message: `Employee ${row.emp_id} on ${row.event_day}: in ${row.in_time}, out ${row.out_time}.`, snapshot: snap({}) })
    const key = `${row.event_day}|${row.emp_id}`
    const before = totals.get(key) ?? 0
    totals.set(key, before + row.out_time - row.in_time)
    frames.push({ phase: 'sum', activeLine: 4, index: i, message: `Adds ${row.out_time - row.in_time} minutes; the group now totals ${totals.get(key)}.`, snapshot: snap({ current: key }) })
  })
  const result = [...totals].map(([key, total_time]) => { const [day, emp] = key.split('|'); return { day, emp_id: Number(emp), total_time } })
  frames.push({ phase: 'done', activeLine: 6, index: -1, result, message: `${result.length} employee-day rows.`, snapshot: snap({ result }) })
  return { input: rows, result, frames }
}
