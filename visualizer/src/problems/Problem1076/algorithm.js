// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `SELECT project_id
FROM Project
GROUP BY project_id
HAVING COUNT(employee_id) = (
  SELECT MAX(c.n) FROM (SELECT COUNT(employee_id) AS n FROM Project GROUP BY project_id) c
)
ORDER BY project_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def busiest_projects(project):
    counts = project.groupby("project_id")["employee_id"].count()
    kept = counts[counts == counts.max()].index
    return [{"project_id": p} for p in sorted(kept)]`
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
  { id: 'count', label: 'Count', description: 'Count the employees of each project.' },
  { id: 'max', label: 'Maximum', description: 'Find the largest count and mark ties.' },
  { id: 'done', label: 'Result', description: 'Output every project at the maximum.' },
]

export const inputLabel = 'Object with a Project table'
export const complexity = 'O(n) to count and O(p) to compare the counts. The visualizer caps the table at 12 rows.'
export const examples = [{
  label: 'Sample',
  input: '{"Project":[{"project_id":1,"employee_id":1},{"project_id":1,"employee_id":2},{"project_id":1,"employee_id":3},{"project_id":2,"employee_id":1},{"project_id":2,"employee_id":2},{"project_id":3,"employee_id":4},{"project_id":4,"employee_id":5},{"project_id":4,"employee_id":6},{"project_id":4,"employee_id":7}]}',
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
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a Project table.')
  return { Project: tableRows(input, 'Project', ['project_id', 'employee_id']) }
}

export function buildTrace(input) {
  const { Project } = input
  const frames = []
  frames.push(frame('load', 'FROM Project', 'def ', 'Read the project assignments.', ['project_id', 'employee_id'], Project))

  const counts = new Map()
  for (const row of Project) counts.set(row.project_id, (counts.get(row.project_id) ?? 0) + 1)
  const summary = []
  for (const [project, employees] of counts) {
    summary.push({ project_id: project, employees })
    frames.push(frame('count', 'GROUP BY project_id', 'counts =', `Project ${project} has ${employees} employee${employees === 1 ? '' : 's'}.`, ['project_id', 'employees'], summary))
  }

  const top = Math.max(...counts.values())
  const marked = summary.map(row => ({ ...row, kept: row.employees === top ? 'yes' : 'no' }))
  frames.push(frame('max', 'HAVING COUNT', 'kept =', `The largest count is ${top}.`, ['project_id', 'employees', 'kept'], marked))

  const result = marked.filter(row => row.kept === 'yes').map(row => ({ project_id: row.project_id })).sort((a, b) => a.project_id - b.project_id)
  frames.push(frame('done', 'ORDER BY', 'return', `Return ${result.length} project${result.length === 1 ? '' : 's'}.`, ['project_id'], result))
  return { input, result, frames }
}
