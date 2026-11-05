// LeetCode 1965 (SQL): an ID is missing when the employee has no name or no salary row, or when a salary row has no employee. Two outer-style passes, a union, then order.
const SOURCE = [
  'function employeesWithMissingInfo(employees, salaries) {',
  '  const salaryIds = new Set(salaries.map(([id]) => id))',
  '  const employeeIds = new Set(employees.map(([id]) => id))',
  '  const missing = new Set()',
  '  for (const [id, name] of employees) {',
  '    if (name === null || !salaryIds.has(id)) missing.add(id)',
  '  }',
  '  for (const [id] of salaries) {',
  '    if (!employeeIds.has(id)) missing.add(id)',
  '  }',
  '  return [...missing].sort((a, b) => a - b)',
  '}',
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def employees_with_missing_information(employees, salaries):
    salary_ids = {row[0] for row in salaries}
    employee_ids = {row[0] for row in employees}
    missing = set()
    for employee_id, name in employees:
        if name is None or employee_id not in salary_ids:
            missing.add(employee_id)
    for employee_id, _ in salaries:
        if employee_id not in employee_ids:
            missing.add(employee_id)
    return sorted(missing)
`

export const sql = `SELECT e.employee_id
FROM Employees e
LEFT JOIN Salaries s ON e.employee_id = s.employee_id
WHERE e.name IS NULL OR s.employee_id IS NULL
UNION
SELECT s.employee_id
FROM Salaries s
LEFT JOIN Employees e ON s.employee_id = e.employee_id
WHERE e.employee_id IS NULL
ORDER BY employee_id;
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'source', label: 'Source tables', description: 'Employees and salaries as stored.' },
  { id: 'join', label: 'Left joins', description: 'Match each side to the other and keep the unmatched or nameless rows.' },
  { id: 'group', label: 'Union', description: 'Combine both sides without duplicates.' },
  { id: 'order', label: 'Order', description: 'Sorted employee IDs.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"employees":[[1,"Ann"],[2,null]],"salaries":[[1,5000]]}.') }
  const { employees, salaries } = input || {}
  if (!Array.isArray(employees) || employees.length < 1 || employees.length > 8) throw new Error('employees holds 1 to 8 rows.')
  if (!Array.isArray(salaries) || salaries.length > 8) throw new Error('salaries holds up to 8 rows.')
  const empIds = new Set()
  for (const r of employees) {
    if (!Array.isArray(r) || r.length !== 2 || !Number.isInteger(r[0]) || r[0] < 1 || (r[1] !== null && typeof r[1] !== 'string')) throw new Error('Each employee is [employee_id, name or null].')
    if (empIds.has(r[0])) throw new Error('employee_id is unique.')
    empIds.add(r[0])
  }
  const salIds = new Set()
  for (const r of salaries) {
    if (!Array.isArray(r) || r.length !== 2 || !Number.isInteger(r[0]) || r[0] < 1 || !Number.isInteger(r[1])) throw new Error('Each salary is [employee_id, salary].')
    if (salIds.has(r[0])) throw new Error('Each employee has at most one salary row.')
    salIds.add(r[0])
  }
  return { employees, salaries }
}

export function buildTrace({ employees, salaries }) {
  const frames = []
  frames.push({ phase: 'source', activeLine: L('const salaryIds'), pythonLine: P('salary_ids ='), message: `${employees.length} employee row(s) and ${salaries.length} salary row(s).`, stage: 'source', rows: employees.map(([id, name]) => [id, name ?? 'NULL']), cols: ['employee_id', 'name'], side: salaries.map(([id, sal]) => [id, sal]) })
  const salaryIds = new Set(salaries.map(([id]) => id))
  const employeeIds = new Set(employees.map(([id]) => id))
  const leftPart = employees.filter(([id, name]) => name === null || !salaryIds.has(id)).map(([id, name]) => [id, name ?? 'NULL', salaryIds.has(id) ? 'has salary' : 'no salary'])
  const rightPart = salaries.filter(([id]) => !employeeIds.has(id)).map(([id, sal]) => [id, sal, 'no employee row'])
  frames.push({ phase: 'join', activeLine: L('for (const [id, name] of employees)'), pythonLine: P('for employee_id, name in employees'), message: `Employees with a missing name or salary: ${leftPart.map(r => r[0]).join(', ') || 'none'}. Salary rows without an employee: ${rightPart.map(r => r[0]).join(', ') || 'none'}.`, stage: 'join', rows: [...leftPart, ...rightPart], cols: ['employee_id', 'name or salary', 'reason'], side: null })
  const missing = new Set([...leftPart.map(r => r[0]), ...rightPart.map(r => r[0])])
  frames.push({ phase: 'group', activeLine: L('const missing'), pythonLine: P('missing = set()'), message: `Union without duplicates: ${[...missing].join(', ') || 'none'}.`, stage: 'group', rows: [...missing].map(id => [id]), cols: ['employee_id'], side: null })
  const sorted = [...missing].sort((a, b) => a - b)
  frames.push({ phase: 'order', activeLine: L('return [...missing]'), pythonLine: P('return sorted(missing)'), message: 'Result ordered by employee_id.', stage: 'order', rows: sorted.map(id => [id]), cols: ['employee_id'], side: null, result: sorted })
  return { input: { employees, salaries }, result: sorted, frames }
}
