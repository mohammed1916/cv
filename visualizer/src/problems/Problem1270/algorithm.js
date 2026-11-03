// Knowledge-derived walkthrough: a recursive query starts at the direct reports of employee 1 and keeps following manager links until no new employees appear.
export const phases = [
  { id: 'start', label: 'Direct', description: 'Begin with the people whose manager is employee 1.' },
  { id: 'visit', label: 'Follow', description: 'Each reached employee brings in their own reports.' },
  { id: 'done', label: 'Result', description: 'Report everyone reached, excluding employee 1.' },
]

const SQL_SOURCE = `WITH RECURSIVE reports AS (
  SELECT employee_id FROM Employees WHERE manager_id = 1
  UNION
  SELECT e.employee_id FROM Employees e
  JOIN reports r ON e.manager_id = r.employee_id
)
SELECT employee_id FROM reports WHERE employee_id <> 1 ORDER BY employee_id;`

const PY_SOURCE = `import pandas as pd
from collections import deque

def all_reports(employees, boss=1):
    children = {}
    for emp, mgr in zip(employees.employee_id, employees.manager_id):
        if pd.notna(mgr):
            children.setdefault(int(mgr), []).append(int(emp))
    found, queue = [], deque(children.get(boss, []))
    while queue:
        emp = queue.popleft()
        found.append(emp)
        queue.extend(children.get(emp, []))
    return pd.DataFrame({"employee_id": sorted(found)})`

const SQL_LINES = SQL_SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
const PY_LINES = PY_SOURCE.split('\n').map((text, index) => ({ line: index + 1, text }))
export const code = SQL_LINES
export const sql = SQL_SOURCE
export const python = PY_SOURCE

const COLUMNS = ['employee_id']
const BOSS = 1
const at = (lines, fragment) => {
  const hit = lines.find(line => line.text.includes(fragment))
  if (!hit) throw new Error(`No line contains "${fragment}"`)
  return hit.line
}
const copy = rows => JSON.parse(JSON.stringify(rows))

export function parseInput(text) {
  const input = JSON.parse(text)
  const rows = input?.employees
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > 12) throw new Error('employees has 1 to 12 rows.')
  const managerOf = new Map()
  for (const row of rows) {
    if (!Number.isInteger(row?.employee_id) || row.employee_id < 1 || row.employee_id > 999) throw new Error('Each employee needs an integer employee_id from 1 to 999.')
    if (managerOf.has(row.employee_id)) throw new Error('employee_id must be unique.')
    if (row.manager_id !== null && !Number.isInteger(row.manager_id)) throw new Error('manager_id is an integer or null.')
    managerOf.set(row.employee_id, row.manager_id)
  }
  for (const [id, manager] of managerOf) {
    if (manager === null) continue
    if (!managerOf.has(manager) || manager === id) throw new Error('Each manager must be a listed employee other than the employee.')
    let hops = 0
    let current = manager
    while (current !== null && hops <= rows.length) { current = managerOf.get(current); hops += 1 }
    if (current !== null) throw new Error('Manager links must not form a cycle.')
  }
  return { employees: rows.map(row => ({ employee_id: row.employee_id, manager_id: row.manager_id })) }
}

export function buildTrace(input) {
  const { employees } = input
  const children = new Map()
  for (const row of employees) {
    if (row.manager_id === null) continue
    if (!children.has(row.manager_id)) children.set(row.manager_id, [])
    children.get(row.manager_id).push(row.employee_id)
  }
  const frames = []
  const found = []
  const push = (phase, sqlFragment, pyFragment, message) => frames.push({
    phase, activeLine: at(SQL_LINES, sqlFragment), pythonLine: at(PY_LINES, pyFragment),
    message, columns: COLUMNS, rows: copy(found.map(id => ({ employee_id: id }))),
  })
  const queue = [...(children.get(BOSS) ?? [])]
  push('start', 'WHERE manager_id = 1', 'found, queue = ', `${queue.length} employees report to employee ${BOSS} directly.`)
  let head = 0
  while (head < queue.length) {
    const emp = queue[head]
    head += 1
    found.push(emp)
    const next = children.get(emp) ?? []
    queue.push(...next)
    push('visit', 'JOIN reports r', 'emp = queue.popleft()', `Employee ${emp} reports up to ${BOSS}; ${next.length} more reports are queued below.`)
  }
  const result = found.slice().sort((a, b) => a - b).map(id => ({ employee_id: id }))
  frames.push({
    phase: 'done', activeLine: at(SQL_LINES, 'FROM reports WHERE'), pythonLine: at(PY_LINES, 'return pd.DataFrame'),
    message: `${result.length} employees report to ${BOSS} directly or indirectly.`, columns: COLUMNS, rows: copy(result),
  })
  return { input, result: copy(result), columns: COLUMNS, frames }
}
