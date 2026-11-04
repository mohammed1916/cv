// SQL walkthrough. The sample tables are invented for this visualization.
export const sql = `WITH shared AS (
  SELECT salary
  FROM Employees
  GROUP BY salary
  HAVING COUNT(*) > 1
),
teams AS (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary) AS team_id
  FROM shared
)
SELECT e.employee_id, e.name, e.salary, t.team_id
FROM Employees e
JOIN teams t ON t.salary = e.salary
ORDER BY t.team_id, e.employee_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def group_employees(employees):
    copies = employees.groupby("salary")["employee_id"].transform("count")
    shared = employees[copies > 1].copy()
    shared["team_id"] = shared["salary"].rank(method="dense").astype(int)
    return shared[["employee_id", "name", "salary", "team_id"]].sort_values(["team_id", "employee_id"])`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the employee rows.' },
  { id: 'count', label: 'Count', description: 'Find salaries that appear more than once.' },
  { id: 'teams', label: 'Teams', description: 'Number the shared salaries from the lowest.' },
  { id: 'done', label: 'Result', description: 'List grouped employees by team, then id.' },
]

const EMPLOYEE_COLUMNS = ['employee_id', 'name', 'salary']
const frame = (phase, sqlKey, pyKey, message, columns, rows, extra = {}) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })), ...extra,
})

function tableRows(input, name, columns, max = 12) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > max) throw new Error(`${name} needs 1 to ${max} rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    return Object.fromEntries(columns.map(column => [column, row[column]]))
  })
}

const isInt = (value, min, max) => Number.isInteger(value) && value >= min && value <= max

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an Employees table.')
  const Employees = tableRows(input, 'Employees', EMPLOYEE_COLUMNS)
  for (const row of Employees) {
    if (!isInt(row.employee_id, 1, 99) || typeof row.name !== 'string' || !isInt(row.salary, 1, 1000)) throw new Error('Use employee_id 1-99, a name, and salary 1-1000.')
  }
  return { Employees }
}

export function buildTrace(input) {
  const { Employees } = input
  const frames = [frame('load', 'FROM Employees', 'def ', 'Read the employee rows.', EMPLOYEE_COLUMNS, Employees)]

  const copies = new Map()
  for (const row of Employees) copies.set(row.salary, (copies.get(row.salary) ?? 0) + 1)
  const shared = [...copies.entries()]
    .filter(([, count]) => count > 1)
    .map(([salary, count]) => ({ salary, copies: count }))
    .sort((a, b) => a.salary - b.salary)
  frames.push(frame('count', 'HAVING COUNT(*)', 'transform(', `${shared.length} salary value(s) appear more than once.`, ['salary', 'copies'], shared))

  const teamOf = new Map(shared.map((row, index) => [row.salary, index + 1]))
  const teams = shared.map(row => ({ salary: row.salary, team_id: teamOf.get(row.salary) }))
  frames.push(frame('teams', 'DENSE_RANK()', 'shared["team_id"]', 'Number the shared salaries from the lowest upward.', ['salary', 'team_id'], teams))

  const result = Employees
    .filter(row => teamOf.has(row.salary))
    .map(row => ({ employee_id: row.employee_id, name: row.name, salary: row.salary, team_id: teamOf.get(row.salary) }))
    .sort((a, b) => a.team_id - b.team_id || a.employee_id - b.employee_id)
  frames.push(frame('done', 'ORDER BY t.team_id', 'return', 'Return the grouped employees.', [...EMPLOYEE_COLUMNS, 'team_id'], result))
  return { input, result, frames }
}
