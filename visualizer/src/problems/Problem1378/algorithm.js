// Knowledge-derived walkthrough written for this visualizer. The sample tables are invented.
const SQL_TEXT = `SELECT u.unique_id, e.name
FROM Employees AS e
LEFT JOIN EmployeeUNI AS u ON u.id = e.id`

export const sql = SQL_TEXT
export const code = SQL_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `import pandas as pd

def replace_ids(employees, employee_uni):
    joined = employees.merge(employee_uni, on="id", how="left")
    return joined[["unique_id", "name"]]
`

export const phases = [
  { id: 'load', label: 'Employees', description: 'Read the employee rows.' },
  { id: 'lookup', label: 'Lookup', description: 'Find each employee in the identifier table.' },
  { id: 'done', label: 'Result', description: 'Show the rows the query returns.' },
]

export const sample = {
  Employees: [
    { id: 1, name: 'Alice' },
    { id: 7, name: 'Bob' },
    { id: 11, name: 'Meir' },
    { id: 90, name: 'Winston' },
    { id: 3, name: 'Jonathan' },
  ],
  EmployeeUNI: [
    { id: 3, unique_id: 1 },
    { id: 11, unique_id: 2 },
    { id: 90, unique_id: 3 },
  ],
}

export const examples = [{ label: 'Five employees', input: JSON.stringify(sample) }]
export const inputLabel = 'Object with Employees and EmployeeUNI lists'
export const complexity = 'O(e + u) with a hash lookup on employee id. The visualization caps each table at 12 rows.'
export const reasoning = [
  'The query starts from Employees so that nobody is dropped.',
  'A left join attaches the identifier when one exists. When no mapping exists, the identifier column is empty.',
]

const L = key => {
  const index = code.findIndex(line => line.text.includes(key))
  if (index < 0) throw new Error(`No SQL line contains "${key}".`)
  return index + 1
}
const P = key => {
  const index = python.split('\n').findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`No Python line contains "${key}".`)
  return index + 1
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.Employees) || !Array.isArray(input.EmployeeUNI)) throw new Error('Use an object with Employees and EmployeeUNI lists.')
  if (input.Employees.length > 12 || input.EmployeeUNI.length > 12) throw new Error('Keep each table to 12 rows.')
  for (const row of [...input.Employees, ...input.EmployeeUNI]) {
    if (!Number.isInteger(row.id)) throw new Error('Each row needs an integer id.')
  }
  for (const row of input.EmployeeUNI) {
    if (!Number.isInteger(row.unique_id)) throw new Error('Each mapping needs an integer unique_id.')
  }
  return { Employees: input.Employees, EmployeeUNI: input.EmployeeUNI }
}

export function buildTrace({ Employees, EmployeeUNI }) {
  const frames = []
  const push = (phase, sqlKey, pyKey, message, caption, columns, rows) => frames.push({
    phase, activeLine: L(sqlKey), pythonLine: P(pyKey), message,
    view: { caption, columns, rows: rows.map(row => ({ ...row })) },
  })
  push('load', 'FROM Employees', 'def replace_ids', `Read ${Employees.length} employees.`, 'Employees', ['id', 'name'], Employees)
  const lookup = new Map(EmployeeUNI.map(row => [row.id, row.unique_id]))
  const joined = Employees.map(employee => ({
    unique_id: lookup.has(employee.id) ? lookup.get(employee.id) : null,
    name: employee.name,
  }))
  push('lookup', 'LEFT JOIN EmployeeUNI', 'joined = employees.merge', 'Attach each identifier, or leave it empty when no mapping exists.', 'Joined', ['unique_id', 'name'], joined)
  const result = joined
  push('done', 'SELECT u.unique_id', 'return joined', `Return ${result.length} rows.`, 'Result', ['unique_id', 'name'], result)
  return { input: { Employees, EmployeeUNI }, result, frames }
}
