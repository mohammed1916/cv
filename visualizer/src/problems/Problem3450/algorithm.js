// Knowledge-derived teaching model of a SQL aggregation task. Not the official statement.
// Rule: count distinct students per bench, then return the largest count (0 for an empty table in this teaching version).

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Students table.' },
  { id: 'dedupe', label: 'Dedupe', description: 'Keep each student and bench pair once.' },
  { id: 'group', label: 'Group', description: 'Count distinct students per bench.' },
  { id: 'output', label: 'Output', description: 'Return the largest count.' },
]

export const sql = `SELECT MAX(student_count) AS max_students
FROM (
  SELECT bench_id, COUNT(DISTINCT student_id) AS student_count
  FROM students
  GROUP BY bench_id
) AS per_bench;`

export const python = `def max_students_on_a_bench(students):
    pairs = students[["student_id", "bench_id"]].drop_duplicates()
    per_bench = pairs.groupby("bench_id")["student_id"].count()
    return int(per_bench.max()) if len(per_bench) else 0`

const sqlLines = sql.split('\n')
const pyLines = python.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
function L(text) {
  const index = sqlLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No SQL line contains: ${text}`)
  return index + 1
}
function P(text) {
  const index = pyLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.students) || input.students.length > 15) throw new Error('Use an object with a students list of at most 15 rows.')
  const students = input.students.map(row => {
    if (!Number.isInteger(row?.student_id) || typeof row.bench_id !== 'string') throw new Error('Each row needs an integer student_id and a text bench_id.')
    return { student_id: row.student_id, bench_id: row.bench_id }
  })
  return { students }
}

const copy = list => list.map(row => ({ ...row }))

export function buildTrace(input) {
  const rows = input.students
  const frames = []
  frames.push({ phase: 'load', activeLine: L('FROM students'), pythonLine: P('def max_students'), message: `Loaded ${rows.length} rows.`, rows: copy(rows) })
  const seen = new Set()
  const distinct = []
  for (const row of rows) {
    const key = `${row.student_id}|${row.bench_id}`
    const fresh = !seen.has(key)
    if (fresh) {
      seen.add(key)
      distinct.push({ student_id: row.student_id, bench_id: row.bench_id })
    }
    frames.push({ phase: 'dedupe', activeLine: L('COUNT(DISTINCT'), pythonLine: P('drop_duplicates'), message: `(${row.student_id}, ${row.bench_id}) ${fresh ? 'is new' : 'repeats, so skip it'}.`, rows: copy(distinct) })
  }
  const counts = new Map()
  for (const row of distinct) counts.set(row.bench_id, (counts.get(row.bench_id) || 0) + 1)
  const grouped = []
  for (const [bench, count] of counts) {
    grouped.push({ bench_id: bench, student_count: count })
    frames.push({ phase: 'group', activeLine: L('GROUP BY'), pythonLine: P('groupby'), message: `Bench ${bench} has ${count} distinct student${count === 1 ? '' : 's'}.`, rows: copy(grouped) })
  }
  const max = grouped.reduce((best, group) => Math.max(best, group.student_count), 0)
  const result = [{ max_students: max }]
  frames.push({ phase: 'output', activeLine: L('SELECT MAX'), pythonLine: P('return int'), message: `The largest count is ${max}.`, rows: copy(result) })
  return { input, result, frames }
}
