// Teaching version of the query. The sample tables are invented for this visualization.
const SQL = `SELECT m.employee_id, m.name,
       COUNT(*) AS reports_count,
       ROUND(AVG(e.age)) AS average_age
FROM Employees AS e
JOIN Employees AS m ON e.reports_to = m.employee_id
GROUP BY m.employee_id, m.name
ORDER BY m.employee_id`

const PANDAS = `import numpy as np
import pandas as pd

def report_summary(employees):
    reports = employees.dropna(subset=["reports_to"])
    grouped = (reports.groupby("reports_to")
                      .agg(reports_count=("employee_id", "size"), mean_age=("age", "mean"))
                      .reset_index())
    managers = employees[["employee_id", "name"]].merge(grouped, left_on="employee_id", right_on="reports_to")
    managers["average_age"] = np.floor(managers["mean_age"] + 0.5).astype(int)
    return managers[["employee_id", "name", "reports_count", "average_age"]].sort_values("employee_id")`

const SQL_LINES = SQL.split('\n')
const PY_LINES = PANDAS.split('\n')

function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing line: ${text}`)
  return index + 1
}

export const sql = SQL
export const python = PANDAS
export const code = SQL_LINES.map((text, index) => ({ line: index + 1, text }))

const frame = (phase, sqlText, pyText, message, columns, rows) => ({
  phase,
  activeLine: lineOf(SQL_LINES, sqlText),
  pythonLine: lineOf(PY_LINES, pyText),
  message,
  columns: [...columns],
  rows: rows.map(row => ({ ...row })),
})

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Employees) || input.Employees.length > 12) throw new Error('Use an Employees list of at most 12 rows.')
  const Employees = input.Employees.map(row => {
    if (!row || !Number.isInteger(row.employee_id) || typeof row.name !== 'string' || !(row.reports_to === null || Number.isInteger(row.reports_to)) || !Number.isInteger(row.age) || row.age < 0) {
      throw new Error('Each employee needs an integer employee_id, a name, reports_to as an integer or null, and a non-negative integer age.')
    }
    return { employee_id: row.employee_id, name: row.name, reports_to: row.reports_to, age: row.age }
  })
  return { Employees }
}

export function buildTrace({ Employees }) {
  const employeeColumns = ['employee_id', 'name', 'reports_to', 'age']
  const summaryColumns = ['employee_id', 'name', 'reports_count', 'average_age']
  const frames = [frame('load', 'FROM Employees', 'def report_summary', `Read ${Employees.length} employees.`, employeeColumns, Employees)]
  const managers = Employees
    .filter(manager => Employees.some(employee => employee.reports_to === manager.employee_id))
    .sort((a, b) => a.employee_id - b.employee_id)
  const summary = []
  for (const manager of managers) {
    const reports = Employees.filter(employee => employee.reports_to === manager.employee_id)
    const total = reports.reduce((sum, employee) => sum + employee.age, 0)
    const average = total / reports.length
    const rounded = Math.floor(average + 0.5)
    summary.push({ employee_id: manager.employee_id, name: manager.name, reports_count: reports.length, average_age: rounded })
    frames.push(frame('scan', 'ROUND(AVG', 'np.floor',
      `${manager.name} has ${reports.length} direct reports with average age ${average}, which rounds half up to ${rounded}.`,
      summaryColumns, summary))
  }
  frames.push(frame('done', 'ORDER BY m.employee_id', 'return managers[', `Returned ${summary.length} managers.`, summaryColumns, summary))
  return { input: { Employees }, result: summary, frames }
}
