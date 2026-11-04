// Teaching version of the query. The sample rows are invented for this visualization.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read each employee-department association.' },
  { id: 'check', label: 'Check', description: 'Decide whether each employee keeps a department.' },
  { id: 'done', label: 'Result', description: 'Return the kept departments.' },
]

export const sql = `SELECT employee_id, department_id
FROM Employee
WHERE primary_flag = 'Y'
   OR employee_id IN (
     SELECT employee_id
     FROM Employee
     GROUP BY employee_id
     HAVING COUNT(*) = 1
   )
ORDER BY employee_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def primary_departments(employee):
    counts = employee.groupby("employee_id")["department_id"].transform("size")
    keep = (employee["primary_flag"] == "Y") | (counts == 1)
    return employee.loc[keep, ["employee_id", "department_id"]].sort_values("employee_id")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const COLUMNS = ['employee_id', 'department_id', 'primary_flag']
const CHECK_COLUMNS = ['employee_id', 'department_id', 'primary_flag', 'kept']
const frame = (phase, sqlKey, pyKey, message, columns, rows) => ({
  phase, activeLine: SQL(sqlKey), pythonLine: PY(pyKey), message, columns, rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input) || input.length < 1 || input.length > 12) throw new Error('Use 1 to 12 Employee rows.')
  const rows = input.map(row => {
    if (!row || !Number.isInteger(row.employee_id) || !Number.isInteger(row.department_id) || !['Y', 'N'].includes(row.primary_flag)) {
      throw new Error('Each row needs integer employee_id and department_id and a primary_flag of Y or N.')
    }
    return { employee_id: row.employee_id, department_id: row.department_id, primary_flag: row.primary_flag }
  })
  const counts = new Map()
  const flags = new Map()
  for (const row of rows) {
    counts.set(row.employee_id, (counts.get(row.employee_id) ?? 0) + 1)
    if (row.primary_flag === 'Y') flags.set(row.employee_id, (flags.get(row.employee_id) ?? 0) + 1)
  }
  for (const [id, count] of counts) {
    if (count > 1 && flags.get(id) !== 1) throw new Error(`Employee ${id} has several departments and needs exactly one Y.`)
  }
  return rows
}

export function buildTrace(input) {
  const frames = [frame('load', 'FROM Employee', 'def ', 'Load the associations.', COLUMNS, input)]
  const counts = new Map()
  for (const row of input) counts.set(row.employee_id, (counts.get(row.employee_id) ?? 0) + 1)
  const employees = [...counts.keys()].sort((a, b) => a - b)
  const checked = []
  const result = []
  for (const id of employees) {
    const rows = input.filter(row => row.employee_id === id)
    const single = counts.get(id) === 1
    for (const row of rows) {
      const kept = row.primary_flag === 'Y' || single
      checked.push({ ...row, kept: kept ? 'yes' : 'no' })
      if (kept) result.push({ employee_id: id, department_id: row.department_id })
    }
    frames.push(frame('check', "primary_flag = 'Y'", 'keep =', `Employee ${id} ${single ? 'has one department, so it is kept' : 'keeps the department flagged Y'}.`, CHECK_COLUMNS, checked))
  }
  result.sort((a, b) => a.employee_id - b.employee_id)
  frames.push(frame('done', 'ORDER BY employee_id', 'return', `Return ${result.length} employee row${result.length === 1 ? '' : 's'}.`, ['employee_id', 'department_id'], result))
  return { input, result, frames }
}
