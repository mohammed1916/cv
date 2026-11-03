// Knowledge-derived teaching model. The sample tables are invented for this visualization.
const COLS = ['employee_id', 'employee_name', 'salary', 'department']
const DEPTS = ['Marketing', 'Engineering']

export function snap(rows) {
  return rows.map(row => ({ ...row }))
}

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export function requireRows(input, name, columns) {
  const rows = input?.[name]
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 12) throw new Error(`${name} must be a list of 1 to 12 rows.`)
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${name} row ${index + 1} must be an object.`)
    columns.forEach(column => { if (!(column in row)) throw new Error(`${name} row ${index + 1} needs ${column}.`) })
  })
  return rows
}

export const sql = `WITH top_pay AS (
  SELECT department, MAX(salary) AS top_salary
  FROM Salaries
  WHERE department IN ('Marketing', 'Engineering')
  GROUP BY department
)
SELECT ABS(m.top_salary - e.top_salary) AS salary_difference
FROM top_pay m
JOIN top_pay e ON m.department = 'Marketing' AND e.department = 'Engineering'`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def highest_salaries_difference(salaries):
    pair = salaries[salaries["department"].isin(["Marketing", "Engineering"])]
    top_pay = pair.groupby("department", as_index=False)["salary"].max()
    marketing = top_pay.loc[top_pay["department"] == "Marketing", "salary"].item()
    engineering = top_pay.loc[top_pay["department"] == "Engineering", "salary"].item()
    return pd.DataFrame({"salary_difference": [abs(marketing - engineering)]})`
const pyLines = python.split('\n')
const L = text => lineOf(sqlLines, text)
const P = text => lineOf(pyLines, text)

export const phases = [
  { id: 'load', label: 'Load', description: 'Read the salary rows.' },
  { id: 'filter', label: 'Filter', description: 'Keep only Marketing and Engineering rows.' },
  { id: 'top', label: 'Top pay', description: 'Take the largest salary in each department.' },
  { id: 'pair', label: 'Pair', description: 'Place the two largest salaries side by side.' },
  { id: 'difference', label: 'Difference', description: 'Take the absolute gap.' },
  { id: 'done', label: 'Result', description: 'Return one row with the gap.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  const rows = requireRows(input, 'Salaries', COLS)
  rows.forEach((row, index) => {
    if (!Number.isInteger(row.salary) || row.salary < 0) throw new Error(`Salaries row ${index + 1} needs a whole-number salary.`)
  })
  const departments = new Set(rows.map(row => row.department))
  DEPTS.forEach(department => { if (!departments.has(department)) throw new Error(`Include at least one ${department} salary.`) })
  return input
}

export function buildTrace(input) {
  const rows = input.Salaries
  const frames = []
  const add = (phase, sqlText, pyText, message, columns, data) => frames.push({ phase, activeLine: L(sqlText), pythonLine: P(pyText), message, columns, rows: snap(data) })
  add('load', 'FROM Salaries', 'def highest', `Read ${rows.length} salary rows.`, COLS, rows)
  const pair = rows.filter(row => DEPTS.includes(row.department))
  add('filter', 'WHERE department IN', 'pair = ', `Keep the ${pair.length} rows in Marketing or Engineering.`, COLS, pair)
  const top = DEPTS.map(department => ({
    department,
    top_salary: Math.max(...pair.filter(row => row.department === department).map(row => row.salary)),
  }))
  add('top', 'GROUP BY department', 'top_pay = ', 'Take the largest salary in each department.', ['department', 'top_salary'], top)
  const [marketing, engineering] = top
  add('pair', 'JOIN top_pay', 'marketing = ', 'Place the two largest salaries side by side.', ['marketing_top', 'engineering_top'], [{ marketing_top: marketing.top_salary, engineering_top: engineering.top_salary }])
  const difference = Math.abs(marketing.top_salary - engineering.top_salary)
  add('difference', 'SELECT ABS', 'return pd', `Gap is |${marketing.top_salary} - ${engineering.top_salary}| = ${difference}.`, ['salary_difference'], [{ salary_difference: difference }])
  const result = [{ salary_difference: difference }]
  add('done', 'SELECT ABS', 'return pd', 'Return the single gap row.', ['salary_difference'], result)
  return { input, result, frames }
}
