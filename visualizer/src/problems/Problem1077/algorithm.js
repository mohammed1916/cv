// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT p.project_id, p.employee_id
FROM Project p
JOIN Employee e ON e.employee_id = p.employee_id
WHERE e.experience_years = (
  SELECT MAX(e2.experience_years)
  FROM Project p2
  JOIN Employee e2 ON e2.employee_id = p2.employee_id
  WHERE p2.project_id = p.project_id
)
ORDER BY p.project_id, p.employee_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def top_experience_per_project(project, employee):
    joined = project.merge(employee, on="employee_id")
    best = joined.groupby("project_id")["experience_years"].transform("max")
    kept = joined[joined["experience_years"] == best]
    return kept[["project_id", "employee_id"]].sort_values(["project_id", "employee_id"]).to_dict("records")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const frame = (phase, sqlKey, pyKey, message, columns, rows, extra = {}) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })), ...extra,
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the project assignments.' },
  { id: 'join', label: 'Join', description: 'Attach each employee experience.' },
  { id: 'max', label: 'Maximum', description: 'Compare each row with its project maximum.' },
  { id: 'done', label: 'Result', description: 'Output the tied top employees.' },
]

export const inputLabel = 'Object with Project and Employee tables'
export const complexity = 'O(n) with a per-project maximum map. The visualizer caps each table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Project":[{"project_id":1,"employee_id":1},{"project_id":1,"employee_id":2},{"project_id":1,"employee_id":3},{"project_id":2,"employee_id":2},{"project_id":2,"employee_id":4}],"Employee":[{"employee_id":1,"experience_years":3},{"employee_id":2,"experience_years":10},{"employee_id":3,"experience_years":10},{"employee_id":4,"experience_years":5}]}',
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with Project and Employee tables.')
  return {
    Project: tableRows(input, 'Project', ['project_id', 'employee_id']),
    Employee: tableRows(input, 'Employee', ['employee_id', 'experience_years']),
  }
}

export function buildTrace(input) {
  const { Project, Employee } = input
  const experience = new Map(Employee.map(row => [row.employee_id, row.experience_years]))
  const frames = []
  frames.push(frame('load', 'FROM Project p', 'def ', 'Read the project assignments.', ['project_id', 'employee_id'], Project))

  const joined = Project.filter(row => experience.has(row.employee_id)).map(row => ({
    project_id: row.project_id, employee_id: row.employee_id, experience_years: experience.get(row.employee_id),
  }))
  frames.push(frame('join', 'JOIN Employee e', 'joined =', `Attach experience to ${joined.length} assignments.`, ['project_id', 'employee_id', 'experience_years'], joined))

  const best = new Map()
  for (const row of joined) best.set(row.project_id, Math.max(best.get(row.project_id) ?? -Infinity, row.experience_years))
  const marked = joined.map(row => ({ ...row, kept: row.experience_years === best.get(row.project_id) ? 'yes' : 'no' }))
  frames.push(frame('max', 'WHERE e.experience_years', 'kept =', 'Compare each assignment with its project maximum.', ['project_id', 'employee_id', 'experience_years', 'kept'], marked))

  const result = marked.filter(row => row.kept === 'yes').map(row => ({ project_id: row.project_id, employee_id: row.employee_id }))
    .sort((a, b) => a.project_id - b.project_id || a.employee_id - b.employee_id)
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} rows.`, ['project_id', 'employee_id'], result))
  return { input, result, frames }
}
