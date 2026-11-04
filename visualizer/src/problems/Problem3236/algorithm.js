// Teaching model. The sample tables are invented for this visualization.
export function snap(rows) {
  return rows.map(row => ({ ...row }))
}

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export function parseJsonObject(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a JSON object whose keys name the tables.')
  return input
}

export function requireRows(input, name, columns, maxRows = 12) {
  const rows = input[name]
  if (!Array.isArray(rows) || rows.length > maxRows) throw new Error(`${name} must be a list of at most ${maxRows} rows.`)
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${name} row ${index + 1} must be an object.`)
    columns.forEach(column => { if (!(column in row)) throw new Error(`${name} row ${index + 1} needs ${column}.`) })
  })
  return rows
}

export const sql = `WITH RECURSIVE reports AS (
  SELECT manager_id AS boss_id, employee_id AS member_id
  FROM Employees
  WHERE manager_id IS NOT NULL
  UNION ALL
  SELECT r.boss_id, e.employee_id
  FROM reports r
  JOIN Employees e ON e.manager_id = r.member_id
),
hierarchy AS (
  SELECT employee_id, 1 AS level
  FROM Employees
  WHERE manager_id IS NULL
  UNION ALL
  SELECT e.employee_id, h.level + 1
  FROM hierarchy h
  JOIN Employees e ON e.manager_id = h.employee_id
)
SELECT h.employee_id, e.employee_name, h.level,
       COUNT(r.member_id) AS subordinate_count
FROM hierarchy h
JOIN Employees e ON e.employee_id = h.employee_id
LEFT JOIN reports r ON r.boss_id = h.employee_id
GROUP BY h.employee_id, e.employee_name, h.level
ORDER BY h.level, h.employee_id`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def ceo_hierarchy(employees):
    children = {}
    for _, row in employees.dropna(subset=["manager_id"]).iterrows():
        children.setdefault(int(row["manager_id"]), []).append(int(row["employee_id"]))
    ceo = int(employees.loc[employees["manager_id"].isna(), "employee_id"].iloc[0])
    levels = {ceo: 1}
    queue = [ceo]
    while queue:
        boss = queue.pop(0)
        for member in children.get(boss, []):
            levels[member] = levels[boss] + 1
            queue.append(member)
    def count_below(boss):
        return sum(1 + count_below(m) for m in children.get(boss, []))
    rows = [{"employee_id": e, "level": lvl, "subordinate_count": count_below(e)} for e, lvl in levels.items()]
    out = pd.DataFrame(rows).merge(employees[["employee_id", "employee_name"]], on="employee_id")
    return out.sort_values(["level", "employee_id"])`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frameAt = (phase, sqlText, pyText, message, columns, rows) => ({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(rows) })

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the employees and their managers.' },
  { id: 'walk', label: 'Walk', description: 'Start at the CEO and add one level of reports at a time.' },
  { id: 'count', label: 'Count', description: 'Count everyone below each person.' },
  { id: 'done', label: 'Result', description: 'Output the hierarchy, top level first.' },
]

const COLS = ['employee_id', 'employee_name', 'manager_id', 'salary']
const WALK_COLS = ['employee_id', 'employee_name', 'level']
const RESULT_COLS = ['employee_id', 'employee_name', 'level', 'subordinate_count']

export function parseInput(text) {
  const input = parseJsonObject(text)
  const rows = requireRows(input, 'Employees', COLS)
  const ceos = rows.filter(row => row.manager_id === null)
  if (ceos.length !== 1) throw new Error('Exactly one employee has no manager.')
  const ids = new Set(rows.map(row => row.employee_id))
  for (const row of rows) {
    if (row.manager_id !== null && !ids.has(row.manager_id)) throw new Error(`Employee ${row.employee_id} has an unknown manager.`)
  }
  const { levels } = levelsFrom(rows, ceos[0].employee_id)
  if (levels.size !== rows.length) throw new Error('Every employee must reach the CEO through managers.')
  return input
}

function childrenOf(rows) {
  const children = new Map()
  for (const row of rows) {
    if (row.manager_id === null) continue
    children.set(row.manager_id, [...(children.get(row.manager_id) || []), row.employee_id])
  }
  return children
}

function levelsFrom(rows, ceoId) {
  const children = childrenOf(rows)
  const levels = new Map([[ceoId, 1]])
  let frontier = [ceoId]
  const layers = [[ceoId]]
  while (frontier.length) {
    const next = []
    for (const boss of frontier) {
      for (const member of children.get(boss) || []) {
        if (levels.has(member)) continue
        levels.set(member, levels.get(boss) + 1)
        next.push(member)
      }
    }
    if (next.length) layers.push(next)
    frontier = next
  }
  return { levels, layers, children }
}

export function buildTrace(input) {
  const rows = input.Employees
  const byId = new Map(rows.map(row => [row.employee_id, row]))
  const ceo = rows.find(row => row.manager_id === null)
  const frames = [frameAt('load', 'WITH RECURSIVE reports', 'def ceo_hierarchy', `Read ${rows.length} employees and find the CEO.`, COLS, rows)]
  const { levels, layers, children } = levelsFrom(rows, ceo.employee_id)
  const walked = []
  layers.forEach((layer, index) => {
    for (const id of layer) walked.push({ employee_id: id, employee_name: byId.get(id).employee_name, level: index + 1 })
    frames.push(frameAt('walk', 'hierarchy AS (', 'levels[member] = levels[boss] + 1', `Level ${index + 1} has ${layer.length} employee${layer.length === 1 ? '' : 's'}.`, WALK_COLS, walked))
  })
  const countBelow = id => (children.get(id) || []).reduce((sum, member) => sum + 1 + countBelow(member), 0)
  const result = walked
    .map(row => ({ employee_id: row.employee_id, employee_name: row.employee_name, level: levels.get(row.employee_id), subordinate_count: countBelow(row.employee_id) }))
    .sort((a, b) => a.level - b.level || a.employee_id - b.employee_id)
  frames.push(frameAt('count', 'LEFT JOIN reports', 'count_below(e)', 'Count the direct and indirect reports of each person.', RESULT_COLS, result))
  frames.push(frameAt('done', 'ORDER BY h.level', 'return out.sort_values', 'Output the hierarchy, top level first.', RESULT_COLS, result))
  return { input, result, frames }
}
