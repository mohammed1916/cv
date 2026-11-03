// Knowledge-derived teaching model: the tables, SQL and pandas steps are written for this site.
// Rule used here: a NULL department_id is not a reference to a missing department, so that row is skipped.
const SQL = `SELECT s.id, s.name
FROM Students s
WHERE s.department_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM Departments d WHERE d.id = s.department_id)
ORDER BY s.id;`

const PY_SRC = `import pandas as pd

def invalid_students(departments, students):
    known = set(departments["id"])
    flagged = students[students["department_id"].notna()]
    flagged = flagged[~flagged["department_id"].isin(known)]
    return flagged[["id", "name"]].sort_values("id")`

const lines = text => text.split('\n').map((t, i) => ({ line: i + 1, text: t }))
const lineOf = (list, text) => {
  const hit = list.find(l => l.text.includes(text))
  if (!hit) throw new Error(`Missing line: ${text}`)
  return hit.line
}

export const code = lines(SQL)
export const python = PY_SRC
const PY = lines(PY_SRC)
const sqlLine = text => lineOf(code, text)
const pyLine = text => lineOf(PY, text)

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the departments and students.' },
  { id: 'skip', label: 'Skip NULL', description: 'A missing department is not a reference.' },
  { id: 'check', label: 'Look up', description: 'Search the departments for this id.' },
  { id: 'flag', label: 'Flag', description: 'No department has this id: the student is invalid.' },
  { id: 'output', label: 'Result', description: 'Report the flagged students by id.' },
]

const frame = (phase, sql, py, message, rows) => ({
  phase,
  activeLine: sqlLine(sql),
  pythonLine: pyLine(py),
  message,
  rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with departments and students.')
  const { departments, students } = input
  if (!Array.isArray(departments) || !Array.isArray(students)) throw new Error('departments and students are lists.')
  if (departments.length > 10 || students.length > 12) throw new Error('Keep the sample small: at most 10 departments and 12 students.')
  for (const d of departments) {
    if (!Number.isInteger(d.id) || typeof d.name !== 'string') throw new Error('Each department has an integer id and a name.')
  }
  for (const s of students) {
    if (!Number.isInteger(s.id) || typeof s.name !== 'string') throw new Error('Each student has an integer id and a name.')
    if (s.department_id !== null && !Number.isInteger(s.department_id)) throw new Error('department_id is an integer or null.')
  }
  return { departments, students }
}

export function buildTrace(input) {
  const { departments, students } = input
  const known = new Set(departments.map(d => d.id))
  const frames = []
  const verdicts = students.map(() => 'pending')
  const view = () => students.map((s, i) => ({ id: s.id, name: s.name, department_id: s.department_id === null ? 'NULL' : s.department_id, verdict: verdicts[i] }))

  frames.push(frame('load', 'FROM Students s', 'known = set(departments', `Compare ${students.length} students with ${departments.length} departments.`, view()))

  students.forEach((s, i) => {
    if (s.department_id === null) {
      verdicts[i] = 'skipped (NULL)'
      frames.push(frame('skip', 'WHERE s.department_id IS NOT NULL', 'flagged = students[students["department_id"].notna()]', `${s.name} has no department, so the row is skipped.`, view()))
    } else if (known.has(s.department_id)) {
      verdicts[i] = 'found'
      frames.push(frame('check', 'AND NOT EXISTS', 'flagged = flagged[~flagged', `Department ${s.department_id} exists for ${s.name}.`, view()))
    } else {
      verdicts[i] = 'missing'
      frames.push(frame('flag', 'SELECT 1 FROM Departments d', 'flagged = flagged[~flagged', `Department ${s.department_id} is missing for ${s.name}: flag it.`, view()))
    }
  })

  const result = students
    .filter((s, i) => verdicts[i] === 'missing')
    .map(s => ({ id: s.id, name: s.name }))
    .sort((a, b) => a.id - b.id)
  frames.push(frame('output', 'ORDER BY s.id', 'return flagged[["id", "name"]]', `${result.length} invalid student${result.length === 1 ? '' : 's'}.`, result))
  return { input, result, frames }
}
