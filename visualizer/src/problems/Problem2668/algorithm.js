// Knowledge-derived teaching model. The sample table is invented for this visualization.
// Teaching rule: repeated Salary rows for one employee are raises, so the latest salary is the largest one.
// The model returns every row that carries the top salary, so a tie keeps both rows. Verify the tie and guarantee wording against the official statement.

export function lineOf(lines, text) {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line for: ${text}`)
  return index + 1
}

export const sql = `SELECT s.employee_id, s.name, s.salary
FROM Salary s
JOIN (
  SELECT employee_id, MAX(salary) AS top_salary
  FROM Salary
  GROUP BY employee_id
) latest
  ON latest.employee_id = s.employee_id
 AND latest.top_salary = s.salary
ORDER BY s.employee_id`
const sqlLines = sql.split('\n')
export const code = sqlLines.map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def latest_salaries(salary):
    top = salary.groupby("employee_id", as_index=False)["salary"].max().rename(columns={"salary": "top_salary"})
    joined = salary.merge(top, on="employee_id")
    latest = joined[joined["salary"] == joined["top_salary"]]
    return latest[["employee_id", "name", "salary"]].sort_values("employee_id").reset_index(drop=True)`
const pyLines = python.split('\n')
const sqlLn = text => lineOf(sqlLines, text)
const pyLn = text => lineOf(pyLines, text)

export const phases = [
  { id: 'load', label: 'Salary', description: 'Read the salary records, including repeated ones.' },
  { id: 'top', label: 'Top', description: 'Find the highest salary for each employee.' },
  { id: 'match', label: 'Match', description: 'Keep the records that carry that top salary.' },
  { id: 'done', label: 'Result', description: 'Output the latest salary for each employee.' },
]

const SALARY_COLS = ['employee_id', 'name', 'salary']
const TOP_COLS = ['employee_id', 'top_salary']
const MATCH_COLS = ['employee_id', 'name', 'salary', 'top_salary', 'check']
const RESULT_COLS = ['employee_id', 'name', 'salary']

function frameAt(phase, sqlText, pyText, message, columns, rows) {
  return { phase, activeLine: sqlLn(sqlText), pythonLine: pyLn(pyText), message, columns, rows: rows.map(row => ({ ...row })) }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.Salary)) {
    throw new Error('Use a JSON object with a Salary list.')
  }
  if (input.Salary.length > 14) throw new Error('Salary must have at most 14 rows.')
  input.Salary.forEach((row, index) => {
    for (const column of SALARY_COLS) if (!(column in row)) throw new Error(`Salary row ${index + 1} needs ${column}.`)
    if (!Number.isInteger(row.employee_id) || row.employee_id < 1) throw new Error(`Salary row ${index + 1} employee_id must be a positive whole number.`)
    if (!/^[A-Za-z]+$/.test(row.name)) throw new Error(`Salary row ${index + 1} name must be letters only.`)
    if (!Number.isInteger(row.salary) || row.salary < 1) throw new Error(`Salary row ${index + 1} salary must be a positive whole number.`)
  })
  return input
}

export function buildTrace(input) {
  const salary = input.Salary
  const frames = [frameAt('load', 'FROM Salary s', 'def latest_salaries', `Load ${salary.length} salary records.`, SALARY_COLS, salary)]

  const top = new Map()
  for (const row of salary) {
    top.set(row.employee_id, Math.max(top.get(row.employee_id) ?? 0, row.salary))
  }
  const topRows = [...top.entries()].sort((a, b) => a[0] - b[0]).map(([employee_id, top_salary]) => ({ employee_id, top_salary }))
  frames.push(frameAt('top', 'MAX(salary) AS top_salary', 'top = salary.groupby', `${topRows.length} employees, each with a highest salary.`, TOP_COLS, topRows))

  const matched = salary.map(row => {
    const topSalary = top.get(row.employee_id)
    return { employee_id: row.employee_id, name: row.name, salary: row.salary, top_salary: topSalary, check: row.salary === topSalary ? 'keep' : 'older' }
  })
  frames.push(frameAt('match', 'latest.top_salary = s.salary', 'latest = joined[', 'A record is kept when its salary equals the employee top salary.', MATCH_COLS, matched))

  const result = matched
    .filter(row => row.check === 'keep')
    .map(({ employee_id, name, salary }) => ({ employee_id, name, salary }))
    .sort((a, b) => a.employee_id - b.employee_id)
  frames.push(frameAt('done', 'ORDER BY s.employee_id', 'return latest[', 'Output the latest salary record for each employee.', RESULT_COLS, result))
  return { input, result, frames }
}
