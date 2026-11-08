// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT student_id, department_id,
  CASE WHEN COUNT(*) OVER w = 1 THEN 0
       ELSE ROUND(100.0 * (RANK() OVER w - 1) / (COUNT(*) OVER w - 1), 2) END AS percentage
FROM Students
WINDOW w AS (PARTITION BY department_id ORDER BY mark DESC)
ORDER BY student_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def rank_percentage(students):
    students["rank"] = students.groupby("department_id")["mark"].rank(method="min", ascending=False)
    size = students.groupby("department_id")["mark"].transform("count")
    students["percentage"] = ((students["rank"] - 1) / (size - 1) * 100).where(size > 1, 0).round(2)
    return students.sort_values("student_id")[["student_id", "department_id", "percentage"]].to_dict("records")`
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
  { id: 'load', label: 'Load', description: 'Read the students and their marks.' },
  { id: 'rank', label: 'Rank', description: 'Rank each mark within its department, highest first. Equal marks share a rank.' },
  { id: 'size', label: 'Size', description: 'Count the students in each department.' },
  { id: 'percent', label: 'Percent', description: 'Turn the rank into (rank - 1) / (count - 1), or 0 for a one-student department.' },
  { id: 'order', label: 'Order', description: 'Sort the output by student ID.' },
  { id: 'done', label: 'Result', description: 'Report each student’s percentage.' },
]

export const inputLabel = 'Object with a Students table'
export const complexity = 'O(n²) for this visual rank count over n students. A window function gives O(n log n) per department in SQL. The visualizer caps the table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Students":[{"student_id":1,"department_id":1,"mark":88},{"student_id":2,"department_id":1,"mark":91},{"student_id":3,"department_id":1,"mark":88},{"student_id":4,"department_id":1,"mark":75},{"student_id":5,"department_id":2,"mark":60}]}',
}, {
  label: 'One student',
  input: '{"Students":[{"student_id":1,"department_id":1,"mark":90}]}',
}, {
  label: 'Equal marks keep ids in order',
  input: '{"Students":[{"student_id":3,"department_id":1,"mark":80},{"student_id":1,"department_id":1,"mark":80},{"student_id":2,"department_id":1,"mark":80}]}',
}, {
  label: 'Largest marks, 12 students',
  input: '{"Students":[{"student_id":1,"department_id":1,"mark":100},{"student_id":2,"department_id":2,"mark":99},{"student_id":3,"department_id":1,"mark":98},{"student_id":4,"department_id":2,"mark":97},{"student_id":5,"department_id":1,"mark":96},{"student_id":6,"department_id":2,"mark":95},{"student_id":7,"department_id":1,"mark":94},{"student_id":8,"department_id":2,"mark":93},{"student_id":9,"department_id":1,"mark":92},{"student_id":10,"department_id":2,"mark":91},{"student_id":11,"department_id":1,"mark":90},{"student_id":12,"department_id":2,"mark":89}]}',
}, {
  label: 'Long run: 12 students',
  input: '{"Students":[{"student_id":1,"department_id":1,"mark":7},{"student_id":2,"department_id":1,"mark":51},{"student_id":3,"department_id":3,"mark":75},{"student_id":4,"department_id":2,"mark":94},{"student_id":5,"department_id":3,"mark":35},{"student_id":6,"department_id":1,"mark":30},{"student_id":7,"department_id":1,"mark":85},{"student_id":8,"department_id":2,"mark":98},{"student_id":9,"department_id":1,"mark":98},{"student_id":10,"department_id":3,"mark":3},{"student_id":11,"department_id":3,"mark":94},{"student_id":12,"department_id":3,"mark":48}]}',
}]

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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Students table.')
  return { Students: tableRows(input, 'Students', ['student_id', 'department_id', 'mark']) }
}

const round2 = value => Math.round(value * 100) / 100

export function buildTrace(input) {
  const { Students } = input
  const base = ['student_id', 'department_id', 'mark']
  const frames = [frame('load', 'FROM Students', 'def ', `Load ${Students.length} students.`, base, Students)]
  const ranked = Students.map(row => ({ ...row }))
  for (const row of ranked) {
    const peers = Students.filter(other => other.department_id === row.department_id)
    row.rank = 1 + peers.filter(other => other.mark > row.mark).length
    frames.push(frame('rank', 'WINDOW w', 'rank(', `Student ${row.student_id} has rank ${row.rank} in department ${row.department_id}.`, [...base, 'rank'], ranked))
  }
  for (const row of ranked) row.size = Students.filter(other => other.department_id === row.department_id).length
  frames.push(frame('size', 'COUNT(*) OVER w', 'transform', 'Each student now knows how many peers share the department.', [...base, 'rank', 'size'], ranked))
  for (const row of ranked) {
    row.percentage = row.size === 1 ? 0 : round2(((row.rank - 1) / (row.size - 1)) * 100)
  }
  frames.push(frame('percent', 'CASE WHEN', 'where(', 'Convert each rank to a percentage, using 0 for one-student departments.', [...base, 'rank', 'percentage'], ranked))
  const sorted = [...ranked].sort((a, b) => a.student_id - b.student_id)
  const result = sorted.map(row => ({ student_id: row.student_id, department_id: row.department_id, percentage: row.percentage }))
  frames.push(frame('order', 'ORDER BY student_id', 'sort_values', 'Order the output by student ID.', ['student_id', 'department_id', 'percentage'], result))
  frames.push(frame('done', 'SELECT', 'return', `Return ${result.length} rows.`, ['student_id', 'department_id', 'percentage'], result))
  return { input, result, frames }
}
