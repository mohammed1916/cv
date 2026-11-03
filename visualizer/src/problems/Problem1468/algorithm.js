// Knowledge-derived teaching version. The sample tables are invented for this visualization.
const SQL = `WITH company_max AS (
  SELECT company_id, MAX(salary) AS max_salary
  FROM Salaries
  GROUP BY company_id
)
SELECT s.company_id, s.employee_id, s.employee_name,
  ROUND(s.salary * (1 - CASE WHEN m.max_salary < 1000 THEN 0
                             WHEN m.max_salary <= 10000 THEN 0.24
                             ELSE 0.49 END)) AS salary
FROM Salaries AS s
JOIN company_max AS m ON m.company_id = s.company_id
ORDER BY s.employee_id`

const PANDAS = `import numpy as np

def after_tax(salaries):
    top = salaries.groupby("company_id")["salary"].transform("max")
    rate = np.select([top < 1000, top <= 10000], [0.0, 0.24], default=0.49)
    out = salaries.assign(salary=np.floor(salaries["salary"] * (1 - rate) + 0.5).astype(int))
    return out[["company_id", "employee_id", "employee_name", "salary"]].sort_values("employee_id")`

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

// The rate depends on the company's highest salary, not on each employee's own salary.
function taxPercent(maxSalary) {
  if (maxSalary < 1000) return 0
  if (maxSalary <= 10000) return 24
  return 49
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Salaries) || input.Salaries.length > 12) throw new Error('Use a Salaries list of at most 12 rows.')
  const Salaries = input.Salaries.map(row => {
    if (!row || !Number.isInteger(row.company_id) || !Number.isInteger(row.employee_id) || typeof row.employee_name !== 'string') {
      throw new Error('Each salary row needs integer company_id and employee_id, and an employee_name.')
    }
    if (!Number.isInteger(row.salary) || row.salary < 0) throw new Error('salary is a non-negative integer.')
    return { company_id: row.company_id, employee_id: row.employee_id, employee_name: row.employee_name, salary: row.salary }
  })
  return { Salaries }
}

export function buildTrace({ Salaries }) {
  const frames = [frame('load', 'FROM Salaries AS s', 'def after_tax', `Read ${Salaries.length} employees.`, ['company_id', 'employee_id', 'employee_name', 'salary'], Salaries)]
  const maxByCompany = new Map()
  for (const row of Salaries) maxByCompany.set(row.company_id, Math.max(maxByCompany.get(row.company_id) ?? 0, row.salary))
  const rates = []
  for (const [companyId, max] of maxByCompany) {
    rates.push({ company_id: companyId, max_salary: max, tax_percent: taxPercent(max) })
    frames.push(frame('rate', 'company_max AS', 'rate =',
      `Company ${companyId} has maximum ${max}, so everyone there pays ${taxPercent(max)}%.`,
      ['company_id', 'max_salary', 'tax_percent'], rates))
  }
  const ordered = [...Salaries].sort((a, b) => a.employee_id - b.employee_id)
  const result = []
  for (const row of ordered) {
    const percent = taxPercent(maxByCompany.get(row.company_id))
    // Add half before dividing by 100 so that exact halves round up, matching the SQL ROUND used here.
    const net = Math.floor((row.salary * (100 - percent) + 50) / 100)
    result.push({ company_id: row.company_id, employee_id: row.employee_id, employee_name: row.employee_name, salary: net })
    frames.push(frame('pay', 'ROUND(s.salary', 'out = salaries.assign',
      `${row.employee_name}: ${row.salary} minus ${percent}% is ${net}.`,
      ['company_id', 'employee_id', 'employee_name', 'salary'], result))
  }
  frames.push(frame('done', 'ORDER BY s.employee_id', 'return out', `Returned ${result.length} employees.`, ['company_id', 'employee_id', 'employee_name', 'salary'], result))
  return { input: { Salaries }, result, frames }
}
