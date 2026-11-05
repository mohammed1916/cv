// LeetCode 1978 (SQL): filter to salaries below 30000 with a manager set, then keep those whose manager no longer appears in the table, and order the IDs.
const SOURCE = [
  'function managerLeft(employees) {',
  '  const ids = new Set(employees.map(e => e.id))',
  '  const filtered = employees.filter(e => e.salary < 30000 && e.manager !== null)',
  '  const left = filtered.filter(e => !ids.has(e.manager))',
  '  return left.map(e => e.id).sort((a, b) => a - b)',
  '}',
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def employees_whose_manager_left(employees):
    ids = {e["id"] for e in employees}
    filtered = [e for e in employees if e["salary"] < 30000 and e["manager"] is not None]
    left = [e for e in filtered if e["manager"] not in ids]
    return sorted(e["id"] for e in left)
`

export const sql = `SELECT e.employee_id
FROM Employees e
WHERE e.salary < 30000
  AND e.manager_id IS NOT NULL
  AND e.manager_id NOT IN (SELECT employee_id FROM Employees)
ORDER BY e.employee_id;
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'source', label: 'Source rows', description: 'Employees as stored.' },
  { id: 'filter', label: 'Filter', description: 'Salary below 30000 and a manager is recorded.' },
  { id: 'join', label: 'Manager missing', description: 'The recorded manager is no longer in the table.' },
  { id: 'order', label: 'Order', description: 'Sorted employee IDs.' },
]

export function parseInput(text) {
  let input
  try { input = JSON.parse(text) } catch { throw new Error('Enter JSON like {"employees":[[1,"Kalel",11,30000]]}.') }
  const rows = input?.employees
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 10) throw new Error('employees holds 1 to 10 rows.')
  const ids = new Set()
  const employees = rows.map(r => {
    if (!Array.isArray(r) || r.length !== 4 || !Number.isInteger(r[0]) || typeof r[1] !== 'string' || !(r[2] === null || Number.isInteger(r[2])) || !Number.isInteger(r[3])) throw new Error('Each row is [employee_id, name, manager_id or null, salary].')
    if (ids.has(r[0])) throw new Error('employee_id is the primary key.')
    ids.add(r[0])
    return { id: r[0], name: r[1], manager: r[2], salary: r[3] }
  })
  return { employees }
}

export function buildTrace({ employees }) {
  const frames = []
  const fmt = e => [e.id, e.name, e.manager ?? 'NULL', e.salary]
  const cols = ['employee_id', 'name', 'manager_id', 'salary']
  frames.push({ phase: 'source', activeLine: L('const ids'), pythonLine: P('ids ='), message: `${employees.length} employee row(s) in the table.`, stage: 'source', rows: employees.map(fmt), cols })
  const ids = new Set(employees.map(e => e.id))
  const filtered = employees.filter(e => e.salary < 30000 && e.manager !== null)
  frames.push({ phase: 'filter', activeLine: L('const filtered'), pythonLine: P('filtered ='), message: `${filtered.length} row(s) earn under 30000 and name a manager.`, stage: 'filter', rows: filtered.map(fmt), cols })
  const left = filtered.filter(e => !ids.has(e.manager))
  frames.push({ phase: 'join', activeLine: L('const left'), pythonLine: P('left ='), message: `Manager no longer in the table: ${left.map(e => e.id).join(', ') || 'none'}.`, stage: 'join', rows: left.map(fmt), cols })
  const sorted = left.map(e => e.id).sort((a, b) => a - b)
  frames.push({ phase: 'order', activeLine: L('return left.map'), pythonLine: P('return sorted'), message: 'Result ordered by employee_id.', stage: 'order', rows: sorted.map(id => [id]), cols: ['employee_id'], result: sorted })
  return { input: { employees }, result: sorted, frames }
}
