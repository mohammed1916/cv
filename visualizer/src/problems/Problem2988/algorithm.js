// SQL walkthrough with invented sample tables.
export const sql = `WITH headcount AS (
  SELECT dep_id, COUNT(*) AS staff
  FROM Employees
  GROUP BY dep_id
),
largest AS (
  SELECT dep_id
  FROM headcount
  WHERE staff = (SELECT MAX(staff) FROM headcount)
)
SELECT e.emp_id, e.emp_name, e.dep_id
FROM Employees AS e
JOIN largest AS l ON l.dep_id = e.dep_id
WHERE e.position = 'Manager'
ORDER BY e.emp_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def largest_department_managers(employees):
    staff = employees.groupby("dep_id").size()
    top = staff[staff == staff.max()].index
    managers = employees[employees["dep_id"].isin(top) & (employees["position"] == "Manager")]
    return managers[["emp_id", "emp_name", "dep_id"]].sort_values("emp_id")`
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
  { id: 'load', label: 'Load', description: 'Read the employee records.' },
  { id: 'count', label: 'Count', description: 'Count the staff in each department.' },
  { id: 'largest', label: 'Largest', description: 'Keep the department(s) with the top count.' },
  { id: 'managers', label: 'Managers', description: 'Find the managers inside those departments.' },
  { id: 'done', label: 'Result', description: 'Report the managers in order of employee id.' },
]

function tableRows(input, name, columns) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 20) throw new Error(`${name} needs 1 to 20 rows.`)
  return rows.map(row => {
    if (!row || typeof row !== 'object' || columns.some(column => !(column in row))) throw new Error(`${name} rows need ${columns.join(', ')}.`)
    return Object.fromEntries(columns.map(column => [column, row[column]]))
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with an Employees table.')
  return { Employees: tableRows(input, 'Employees', ['emp_id', 'emp_name', 'dep_id', 'position']) }
}

export function buildTrace(input) {
  const rows = input.Employees
  const frames = []
  frames.push(frame('load', 'FROM Employees', 'def largest', 'Read the employee records.', ['emp_id', 'emp_name', 'dep_id', 'position'], rows))

  const counts = new Map()
  for (const row of rows) counts.set(row.dep_id, (counts.get(row.dep_id) || 0) + 1)
  const deps = [...counts.keys()].sort((a, b) => a - b)
  const headcount = deps.map(dep => ({ dep_id: dep, staff: counts.get(dep) }))
  frames.push(frame('count', 'COUNT(*) AS staff', 'staff = ', 'Count the employees in each department.', ['dep_id', 'staff'], headcount))

  const top = Math.max(...counts.values())
  const largest = deps.filter(dep => counts.get(dep) === top).map(dep => ({ dep_id: dep }))
  frames.push(frame('largest', 'WHERE staff = (SELECT', 'top = ', `The largest count is ${top}, so ${largest.length === 1 ? 'one department qualifies' : `${largest.length} departments qualify`}.`, ['dep_id'], largest))

  const topDeps = new Set(largest.map(row => row.dep_id))
  const managersFound = []
  for (const row of rows) {
    if (topDeps.has(row.dep_id) && row.position === 'Manager') {
      managersFound.push({ emp_id: row.emp_id, emp_name: row.emp_name, dep_id: row.dep_id })
    }
  }
  managersFound.sort((a, b) => a.emp_id - b.emp_id)
  frames.push(frame('managers', 'WHERE e.position', 'managers = ', `Keep the managers inside the qualifying departments: ${managersFound.length} found.`, ['emp_id', 'emp_name', 'dep_id'], managersFound))

  frames.push(frame('done', 'ORDER BY e.emp_id', 'return', `Return ${managersFound.length} manager${managersFound.length === 1 ? '' : 's'}.`, ['emp_id', 'emp_name', 'dep_id'], managersFound))
  return { input, result: managersFound, frames }
}
