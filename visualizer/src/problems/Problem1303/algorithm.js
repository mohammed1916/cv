const SQL = `WITH sizes AS (
  SELECT team_id, COUNT(*) AS team_size
  FROM Employee
  GROUP BY team_id
)
SELECT e.employee_id, s.team_size
FROM Employee e
JOIN sizes s ON s.team_id = e.team_id
ORDER BY e.employee_id;`

const PY = `import pandas as pd

def team_size(employee):
    sizes = employee.groupby("team_id")["employee_id"].transform("count")
    out = employee.assign(team_size=sizes)
    return out[["employee_id", "team_size"]].sort_values("employee_id")
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
  { id: 'count', label: 'Count', description: 'Count the rows of each team.' },
  { id: 'join', label: 'Attach', description: 'Each employee takes the size of their team.' },
  { id: 'done', label: 'Result', description: 'Employees sorted by id.' },
]
export const sample = {
  employee: [
    { employee_id: 11, team_id: 40 },
    { employee_id: 12, team_id: 40 },
    { employee_id: 13, team_id: 40 },
    { employee_id: 14, team_id: 50 },
    { employee_id: 15, team_id: 60 },
    { employee_id: 16, team_id: 50 },
  ],
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.employee)) throw new Error('Provide an employee array.')
  const ids = new Set(input.employee.map(e => e.employee_id))
  if (ids.size !== input.employee.length) throw new Error('employee_id must be unique.')
  return input
}

export function buildTrace(input) {
  const { employee } = input
  const sizes = new Map()
  const frames = []
  const sizeRows = () => [...sizes.entries()].map(([team_id, team_size]) => ({ team_id, team_size }))
  for (const e of employee) sizes.set(e.team_id, (sizes.get(e.team_id) || 0) + 1)
  frames.push(frame('count', 'COUNT(*) AS team_size', 'sizes = employee.groupby', 'Every team and its number of rows.', sizeRows()))
  const attached = []
  for (const e of [...employee].sort((a, b) => a.employee_id - b.employee_id)) {
    attached.push({ employee_id: e.employee_id, team_size: sizes.get(e.team_id) })
    frames.push(frame('join', 'JOIN sizes s', 'out = employee.assign', `Employee ${e.employee_id} is on team ${e.team_id}, size ${sizes.get(e.team_id)}.`, attached))
  }
  const result = attached
  frames.push(frame('done', 'ORDER BY e.employee_id', 'return out', 'Employees sorted by id.', result))
  return { input, result, frames }
}
