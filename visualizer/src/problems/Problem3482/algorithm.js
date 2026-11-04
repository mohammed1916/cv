// Knowledge-derived teaching model of a recursive-CTE hierarchy task. Not the official statement.
// Rules: exactly one root (manager_id null); level = 1 + number of managers above; team_size = people below;
// budget = own salary plus the salaries of everyone below. Output is ordered by employee_id.

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the Employees table.' },
  { id: 'climb', label: 'Levels', description: 'Walk up each chain of managers to count levels.' },
  { id: 'team', label: 'Subtree', description: 'Add up the people and salaries below each employee.' },
  { id: 'output', label: 'Output', description: 'Return rows ordered by employee_id.' },
]

export const sql = `WITH RECURSIVE above AS (
  SELECT employee_id AS member_id, manager_id AS boss_id
  FROM employees
  WHERE manager_id IS NOT NULL
  UNION ALL
  SELECT a.member_id, e.manager_id
  FROM above a
  JOIN employees e ON e.employee_id = a.boss_id
  WHERE e.manager_id IS NOT NULL
)
SELECT e.employee_id,
       1 + (SELECT COUNT(*) FROM above a WHERE a.member_id = e.employee_id) AS level,
       (SELECT COUNT(*) FROM above a WHERE a.boss_id = e.employee_id) AS team_size,
       e.salary + COALESCE((SELECT SUM(m.salary) FROM above a JOIN employees m ON m.employee_id = a.member_id WHERE a.boss_id = e.employee_id), 0) AS budget
FROM employees e
ORDER BY e.employee_id;`

export const python = `import pandas as pd

def analyze_hierarchy(employees):
    boss_of = dict(zip(employees["employee_id"], employees["manager_id"]))
    salary = dict(zip(employees["employee_id"], employees["salary"]))

    def ancestors(member):
        found, node = [], boss_of[member]
        while pd.notna(node):
            found.append(int(node))
            node = boss_of[int(node)]
        return found

    rows = []
    for emp in employees["employee_id"]:
        under = [m for m in employees["employee_id"] if emp in ancestors(m)]
        total = salary[emp] + sum(salary[m] for m in under)
        rows.append({"employee_id": int(emp), "level": len(ancestors(emp)) + 1,
                     "team_size": len(under), "budget": int(total)})
    return pd.DataFrame(rows).sort_values("employee_id")`

const sqlLines = sql.split('\n')
const pyLines = python.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
function L(text) {
  const index = sqlLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No SQL line contains: ${text}`)
  return index + 1
}
function P(text) {
  const index = pyLines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`No Python line contains: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.employees) || input.employees.length < 1 || input.employees.length > 12) throw new Error('Use an object with 1 to 12 employees.')
  const employees = input.employees.map(row => {
    if (!Number.isInteger(row?.employee_id) || typeof row.employee_name !== 'string' || typeof row.department !== 'string') throw new Error('Each employee needs an integer employee_id, a name and a department.')
    if (!(row.manager_id === null || Number.isInteger(row.manager_id))) throw new Error('manager_id is an integer or null.')
    if (!Number.isInteger(row.salary) || row.salary < 0) throw new Error('salary is a non-negative integer.')
    return { employee_id: row.employee_id, employee_name: row.employee_name, manager_id: row.manager_id, salary: row.salary, department: row.department }
  })
  const byId = new Map(employees.map(row => [row.employee_id, row]))
  if (byId.size !== employees.length) throw new Error('employee_id values must be unique.')
  if (employees.filter(row => row.manager_id === null).length !== 1) throw new Error('Exactly one employee has no manager.')
  for (const row of employees) {
    let boss = row.manager_id
    let steps = 0
    while (boss !== null) {
      if (!byId.has(boss) || ++steps > employees.length) throw new Error('Every manager must exist, and each chain must end at the top.')
      boss = byId.get(boss).manager_id
    }
  }
  return { employees }
}

const copy = list => list.map(row => ({ ...row }))

export function buildTrace(input) {
  const people = input.employees
  const byId = new Map(people.map(row => [row.employee_id, row]))
  const ancestors = id => {
    const found = []
    let boss = byId.get(id).manager_id
    while (boss !== null) {
      found.push(boss)
      boss = byId.get(boss).manager_id
    }
    return found
  }
  const ids = people.map(row => row.employee_id).sort((a, b) => a - b)
  const frames = []
  frames.push({ phase: 'load', focus: null, activeLine: L('FROM employees e'), pythonLine: P('def analyze_hierarchy'), message: `Loaded ${people.length} employees.`, rows: copy(people) })
  const levels = new Map()
  const climbed = []
  for (const id of ids) {
    const level = ancestors(id).length + 1
    levels.set(id, level)
    climbed.push({ employee_id: id, level })
    frames.push({ phase: 'climb', activeLine: L('WITH RECURSIVE above'), pythonLine: P('def ancestors'), focus: id, message: `Employee ${id} has ${level - 1} manager${level === 2 ? '' : 's'} above, so level ${level}.`, rows: copy(climbed) })
  }
  const computed = []
  for (const id of ids) {
    const under = ids.filter(other => ancestors(other).includes(id))
    const budget = byId.get(id).salary + under.reduce((sum, other) => sum + byId.get(other).salary, 0)
    computed.push({ employee_id: id, level: levels.get(id), team_size: under.length, budget })
    frames.push({ phase: 'team', activeLine: L('SELECT e.employee_id'), pythonLine: P('rows.append'), focus: id, message: `Employee ${id}: ${under.length} below, budget ${budget}.`, rows: copy(computed) })
  }
  const result = copy(computed)
  frames.push({ phase: 'output', focus: null, activeLine: L('ORDER BY e.employee_id'), pythonLine: P('return pd.DataFrame'), message: `Returned ${result.length} rows.`, rows: copy(result) })
  return { input, result, frames }
}
