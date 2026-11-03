// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT p.project_id, ROUND(AVG(e.experience_years), 2) AS average_years
FROM Project p
JOIN Employee e ON e.employee_id = p.employee_id
GROUP BY p.project_id
ORDER BY p.project_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def project_average(project, employee):
    joined = project.merge(employee, on="employee_id")
    avg = joined.groupby("project_id")["experience_years"].mean().round(2)
    return [{"project_id": p, "average_years": f"{v:.2f}"} for p, v in avg.items()]`
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
  { id: 'group', label: 'Group', description: 'Average the experience of each project.' },
  { id: 'done', label: 'Result', description: 'Output one average per project.' },
]

export const inputLabel = 'Object with Project and Employee tables'
export const complexity = 'O(n + m) with a lookup map from employee to experience. The visualizer caps each table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Project":[{"project_id":5,"employee_id":1},{"project_id":5,"employee_id":2},{"project_id":6,"employee_id":3},{"project_id":6,"employee_id":4},{"project_id":6,"employee_id":1},{"project_id":7,"employee_id":2},{"project_id":7,"employee_id":4}],"Employee":[{"employee_id":1,"name":"Ana","experience_years":3},{"employee_id":2,"name":"Ben","experience_years":10},{"employee_id":3,"name":"Cy","experience_years":2},{"employee_id":4,"name":"Dee","experience_years":5}]}',
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

  const joined = []
  for (const row of Project) {
    if (!experience.has(row.employee_id)) continue
    joined.push({ project_id: row.project_id, employee_id: row.employee_id, experience_years: experience.get(row.employee_id) })
    frames.push(frame('join', 'JOIN Employee e', 'joined =', `Attach experience ${experience.get(row.employee_id)} to employee ${row.employee_id}.`, ['project_id', 'employee_id', 'experience_years'], joined))
  }

  const groups = new Map()
  for (const row of joined) {
    if (!groups.has(row.project_id)) groups.set(row.project_id, { sum: 0, count: 0 })
    const group = groups.get(row.project_id)
    group.sum += row.experience_years
    group.count += 1
  }
  const summary = []
  const result = []
  for (const project of [...groups.keys()].sort((a, b) => a - b)) {
    const { sum, count } = groups.get(project)
    const average = (Math.round((sum / count) * 100) / 100).toFixed(2)
    summary.push({ project_id: project, average_years: average })
    result.push({ project_id: project, average_years: average })
    frames.push(frame('group', 'GROUP BY p.project_id', 'avg =', `Project ${project} averages ${average} years over ${count} employees.`, ['project_id', 'average_years'], summary))
  }
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} project rows.`, ['project_id', 'average_years'], result))
  return { input, result, frames }
}
