// Knowledge-derived teaching model. The sample tables are invented for this visualization.
// Teaching rule: an assignment is shown when its workload is above the average workload of all assignments by its team.
export const sql = `WITH team_avg AS (
  SELECT e.team, AVG(p.workload) AS avg_workload
  FROM Project p
  JOIN Employees e ON e.employee_id = p.employee_id
  GROUP BY e.team
)
SELECT e.employee_id, e.name, p.project_id, p.workload
FROM Project p
JOIN Employees e ON e.employee_id = p.employee_id
JOIN team_avg t ON t.team = e.team
WHERE p.workload > t.avg_workload
ORDER BY e.employee_id, p.project_id`

export const python = `import pandas as pd

def above_team_average(project, employees):
    joined = project.merge(employees, on="employee_id")
    team_avg = joined.groupby("team")["workload"].mean().rename("avg_workload")
    joined = joined.merge(team_avg, left_on="team", right_index=True)
    picked = joined[joined["workload"] > joined["avg_workload"]]
    return picked[["employee_id", "name", "project_id", "workload"]].sort_values(["employee_id", "project_id"])`

const sqlLines = sql.split('\n')
const pyLines = python.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)
const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: rows.map(row => ({ ...row })),
})

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the assignments.' },
  { id: 'join', label: 'Join', description: 'Attach each employee’s name and team.' },
  { id: 'team', label: 'Team average', description: 'Average the workload inside each team.' },
  { id: 'filter', label: 'Filter', description: 'Keep assignments above their team’s average.' },
  { id: 'order', label: 'Order', description: 'Sort by employee and project.' },
  { id: 'done', label: 'Result', description: 'Output the selected assignments.' },
]

const PROJECT_COLS = ['project_id', 'employee_id', 'workload']
const JOIN_COLS = ['employee_id', 'name', 'team', 'project_id', 'workload']
const OUT_COLS = ['employee_id', 'name', 'project_id', 'workload']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Project) || !Array.isArray(input.Employees)) {
    throw new Error('Use an object with Project and Employees lists.')
  }
  if (input.Project.length < 1 || input.Project.length > 14 || input.Employees.length > 10) throw new Error('Project has 1 to 14 rows and Employees at most 10.')
  for (const row of input.Project) {
    if (!Number.isInteger(row?.project_id) || !Number.isInteger(row.employee_id) || !Number.isInteger(row.workload) || row.workload < 0) {
      throw new Error('Each project row needs integer project_id, employee_id and a non-negative integer workload.')
    }
  }
  const ids = new Set()
  for (const row of input.Employees) {
    if (!Number.isInteger(row?.employee_id) || typeof row.name !== 'string' || typeof row.team !== 'string') throw new Error('Each employee needs an integer employee_id, a name and a team.')
    if (ids.has(row.employee_id)) throw new Error('employee_id values must be unique.')
    ids.add(row.employee_id)
  }
  return {
    Project: input.Project.map(row => ({ project_id: row.project_id, employee_id: row.employee_id, workload: row.workload })),
    Employees: input.Employees.map(row => ({ employee_id: row.employee_id, name: row.name, team: row.team })),
  }
}

const byKey = (a, b) => a.employee_id - b.employee_id || a.project_id - b.project_id

export function buildTrace(input) {
  const { Project, Employees } = input
  const frames = [frame('load', 'FROM Project p', 'def above_team_average', `Load ${Project.length} assignments.`, PROJECT_COLS, Project)]
  const people = new Map(Employees.map(row => [row.employee_id, row]))
  const joined = Project.filter(row => people.has(row.employee_id)).map(row => ({
    employee_id: row.employee_id, name: people.get(row.employee_id).name, team: people.get(row.employee_id).team,
    project_id: row.project_id, workload: row.workload,
  }))
  frames.push(frame('join', 'JOIN Employees e', 'joined = project.merge', `${joined.length} assignments have a known employee.`, JOIN_COLS, joined))
  const teams = [...new Set(joined.map(row => row.team))].sort()
  const averages = teams.map(team => {
    const rows = joined.filter(row => row.team === team)
    const total = rows.reduce((sum, row) => sum + row.workload, 0)
    return { team, avg: total / rows.length }
  })
  const avgRows = averages.map(({ team, avg }) => ({ team, avg_workload: Number(avg.toFixed(2)) }))
  frames.push(frame('team', 'AVG(p.workload)', 'team_avg = joined.groupby', 'Each team average uses every assignment of its members.', ['team', 'avg_workload'], avgRows))
  const avgOf = new Map(averages.map(({ team, avg }) => [team, avg]))
  const picked = joined.filter(row => row.workload > avgOf.get(row.team)).map(({ employee_id, name, project_id, workload }) => ({ employee_id, name, project_id, workload }))
  frames.push(frame('filter', 'WHERE p.workload', 'picked = joined[', `${picked.length} assignments are above their team average.`, OUT_COLS, picked))
  const result = [...picked].sort(byKey)
  frames.push(frame('order', 'ORDER BY e.employee_id', 'picked[["employee_id"', 'Sort by employee, then project.', OUT_COLS, result))
  frames.push(frame('done', 'SELECT e.employee_id', 'return picked', 'Output the selected assignments.', OUT_COLS, result))
  return { input, result, frames }
}
