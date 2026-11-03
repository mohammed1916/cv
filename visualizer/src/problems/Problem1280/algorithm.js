const SQL = `SELECT s.student_id, s.student_name, sub.subject_name,
  COUNT(e.subject_name) AS attended_exams
FROM Students s
CROSS JOIN Subjects sub
LEFT JOIN Examinations e
  ON e.student_id = s.student_id
 AND e.subject_name = sub.subject_name
GROUP BY s.student_id, s.student_name, sub.subject_name
ORDER BY s.student_id, sub.subject_name;`

const PY = `import pandas as pd

def students_and_exams(students, subjects, exams):
    grid = students.merge(pd.DataFrame({"subject_name": subjects}), how="cross")
    counts = exams.groupby(["student_id", "subject_name"]).size().rename("attended_exams").reset_index()
    out = grid.merge(counts, on=["student_id", "subject_name"], how="left").fillna({"attended_exams": 0})
    result = out.astype({"attended_exams": int}).sort_values(["student_id", "subject_name"])
    return result
`

const snap = rows => JSON.parse(JSON.stringify(rows))
const SQL_LINES = SQL.split('\n')
const PY_LINES = PY.split('\n')
function lookup(lines, fragment, label) {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`${label} has no line containing "${fragment}"`)
  return index + 1
}
const sqlLine = fragment => lookup(SQL_LINES, fragment, 'SQL')
const pyLine = fragment => lookup(PY_LINES, fragment, 'Python')
const frame = (phase, sqlFragment, pyFragment, message, rows) => ({
  phase, activeLine: sqlLine(sqlFragment), pythonLine: pyLine(pyFragment), message, rows: snap(rows),
})

export const sql = SQL
export const python = PY
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))
export const phases = [
  { id: 'cross', label: 'Pairs', description: 'Start with every student and subject pair at zero.' },
  { id: 'count', label: 'Count', description: 'Each examination row adds one attendance to its pair.' },
  { id: 'done', label: 'Result', description: 'All pairs sorted by student and subject.' },
]
export const sample = {
  students: [
    { student_id: 21, student_name: 'Mira' },
    { student_id: 22, student_name: 'Tomas' },
    { student_id: 35, student_name: 'Priya' },
  ],
  subjects: ['Biology', 'Chemistry', 'History'],
  exams: [
    { student_id: 21, subject_name: 'Biology' },
    { student_id: 21, subject_name: 'Chemistry' },
    { student_id: 21, subject_name: 'Chemistry' },
    { student_id: 21, subject_name: 'History' },
    { student_id: 22, subject_name: 'History' },
    { student_id: 22, subject_name: 'History' },
    { student_id: 35, subject_name: 'Chemistry' },
    { student_id: 35, subject_name: 'History' },
  ],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  const { students, subjects, exams } = input
  if (!Array.isArray(students) || !Array.isArray(subjects) || !Array.isArray(exams)) throw new Error('Provide students, subjects and exams arrays.')
  const ids = new Set(students.map(s => s.student_id))
  for (const e of exams) {
    if (!ids.has(e.student_id)) throw new Error(`Exam names unknown student ${e.student_id}.`)
  }
  return input
}

export function buildTrace(input) {
  const students = [...input.students].sort((a, b) => a.student_id - b.student_id)
  const subjects = [...input.subjects].sort()
  const grid = []
  const index = new Map()
  for (const s of students) {
    for (const subject of subjects) {
      const key = `${s.student_id}|${subject}`
      index.set(key, grid.length)
      grid.push({ student_id: s.student_id, student_name: s.student_name, subject_name: subject, attended_exams: 0 })
    }
  }
  const frames = [frame('cross', 'CROSS JOIN', 'grid = students.merge', `Every student meets every subject: ${grid.length} pairs start at zero.`, grid)]
  for (const e of input.exams) {
    const row = grid[index.get(`${e.student_id}|${e.subject_name}`)]
    row.attended_exams += 1
    frames.push(frame('count', 'LEFT JOIN Examinations', 'counts = exams.groupby', `Attendance for student ${e.student_id} in ${e.subject_name} goes up.`, grid))
  }
  frames.push(frame('done', 'ORDER BY s.student_id', 'return result', 'Every pair listed, zero counts included.', grid))
  return { input, result: grid, frames }
}
