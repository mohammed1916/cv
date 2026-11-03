// Knowledge-derived SQL walkthrough. The sample tables are invented for this visualization.
export const phases = [
  { id: 'load', label: 'Load', description: 'Read the employees and their log sessions.' },
  { id: 'session', label: 'Sessions', description: 'Round each session up to whole minutes.' },
  { id: 'total', label: 'Totals', description: 'Add the rounded minutes per employee.' },
  { id: 'filter', label: 'Filter', description: 'Keep employees whose total is below the requirement.' },
  { id: 'done', label: 'Result', description: 'Return the qualifying employee ids.' },
]

export const sql = `SELECT e.employee_id
FROM Employees e
LEFT JOIN (
  SELECT employee_id,
         SUM(CEIL((out_time - in_time) / 60.0)) AS minutes
  FROM Logs
  GROUP BY employee_id
) t ON t.employee_id = e.employee_id
WHERE COALESCE(t.minutes, 0) < e.needed_hours * 60
ORDER BY e.employee_id`

export const code = sql.split('\n').map((text, index) => ({ line: index + 1, text }))
const SQL = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`Missing SQL line: ${key}`)
  return index + 1
}

export const python = `def employees_with_deductions(employees, logs):
    logs = logs.assign(minutes=np.ceil((logs["out_time"] - logs["in_time"]) / 60))
    totals = logs.groupby("employee_id")["minutes"].sum()
    merged = employees.merge(totals, on="employee_id", how="left").fillna({"minutes": 0})
    kept = merged[merged["minutes"] < merged["needed_hours"] * 60]
    return kept[["employee_id"]].sort_values("employee_id")`
const PY_LINES = python.split('\n')
const PY = key => {
  const index = PY_LINES.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing Python line: ${key}`)
  return index + 1
}

const toInt = (value, name) => {
  if (!Number.isInteger(value) || value < 0 || value > 86400) throw new Error(`${name} must be whole seconds from 0 to 86400.`)
  return value
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Employees) || !Array.isArray(input.Logs)) throw new Error('Use an object with Employees and Logs arrays.')
  if (input.Employees.length < 1 || input.Employees.length > 12) throw new Error('Employees needs 1 to 12 rows.')
  if (input.Logs.length > 12) throw new Error('Logs has at most 12 rows.')
  const employees = input.Employees.map(row => {
    if (!row || !Number.isInteger(row.employee_id) || !Number.isInteger(row.needed_hours) || row.needed_hours < 0) throw new Error('Each employee needs integer employee_id and needed_hours.')
    return { employee_id: row.employee_id, needed_hours: row.needed_hours }
  })
  const logs = input.Logs.map(row => {
    if (!row || !Number.isInteger(row.employee_id)) throw new Error('Each log needs an integer employee_id.')
    const in_time = toInt(row.in_time, 'in_time')
    const out_time = toInt(row.out_time, 'out_time')
    if (out_time < in_time) throw new Error('out_time cannot be before in_time.')
    return { employee_id: row.employee_id, in_time, out_time }
  })
  return { Employees: employees, Logs: logs }
}

export function buildTrace(input) {
  const { Employees, Logs } = input
  const frames = []
  const EMP_COLUMNS = ['employee_id', 'needed_hours']
  frames.push({ phase: 'load', activeLine: SQL('FROM Employees e'), pythonLine: PY('def '), message: `Load ${Employees.length} employees and ${Logs.length} log sessions.`, columns: EMP_COLUMNS, rows: Employees.map(row => ({ ...row })) })

  const sessions = Logs.map(row => ({ ...row, minutes: Math.ceil((row.out_time - row.in_time) / 60) }))
  const SESSION_COLUMNS = ['employee_id', 'in_time', 'out_time', 'minutes']
  sessions.forEach((row, i) => {
    frames.push({ phase: 'session', activeLine: SQL('SUM(CEIL'), pythonLine: PY('assign'), message: `Session of employee ${row.employee_id} lasts ${row.out_time - row.in_time} seconds, rounded up to ${row.minutes} minute${row.minutes === 1 ? '' : 's'}.`, columns: SESSION_COLUMNS, rows: sessions.slice(0, i + 1).map(s => ({ ...s })) })
  })

  const result = []
  const summary = []
  for (const emp of Employees) {
    const minutes = sessions.filter(s => s.employee_id === emp.employee_id).reduce((sum, s) => sum + s.minutes, 0)
    const required = emp.needed_hours * 60
    summary.push({ employee_id: emp.employee_id, needed_minutes: required, minutes })
    frames.push({ phase: 'total', activeLine: SQL('GROUP BY'), pythonLine: PY('groupby'), message: `Employee ${emp.employee_id} totals ${minutes} minute${minutes === 1 ? '' : 's'} against ${required} required.`, columns: ['employee_id', 'needed_minutes', 'minutes'], rows: summary.map(s => ({ ...s })) })
    const kept = minutes < required
    if (kept) result.push({ employee_id: emp.employee_id })
    summary[summary.length - 1].kept = kept ? 'yes' : 'no'
    frames.push({ phase: 'filter', activeLine: SQL('WHERE COALESCE'), pythonLine: PY('kept ='), message: `${minutes} is ${kept ? 'below' : 'not below'} ${required}, so employee ${emp.employee_id} ${kept ? 'stays' : 'is dropped'}.`, columns: ['employee_id', 'needed_minutes', 'minutes', 'kept'], rows: summary.map(s => ({ ...s })) })
  }
  result.sort((a, b) => a.employee_id - b.employee_id)
  frames.push({ phase: 'done', activeLine: SQL('ORDER BY e.employee_id'), pythonLine: PY('return'), message: `Return ${result.length} employee id${result.length === 1 ? '' : 's'}.`, columns: ['employee_id'], rows: result.map(row => ({ ...row })) })
  return { input, result, frames }
}
