export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with employees.')
  const { employees } = input
  if (!Array.isArray(employees) || employees.length < 1 || employees.length > 12) throw new Error('employees has 1 to 12 rows.')
  for (const row of employees) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Each row is an object with name and salary.')
    if (typeof row.name !== 'string' || !row.name) throw new Error('Each row needs a non-empty name.')
    if (!Number.isSafeInteger(row.salary)) throw new Error('Each salary is a whole number.')
    if (!Number.isSafeInteger(row.salary * 2)) throw new Error('Each doubled salary must stay a safe whole number.')
  }
  return { employees: employees.map(({ name, salary }) => ({ name, salary })) }
}

export const phases = [
  { id: 'load', label: 'Load', description: 'The DataFrame arrives with name and salary.' },
  { id: 'select', label: 'Select', description: 'Pick out the whole salary column.' },
  { id: 'double', label: 'Double', description: 'The multiplication reaches every row of the column.' },
  { id: 'attach', label: 'Attach', description: 'The new values become the bonus column, matched by row label.' },
  { id: 'done', label: 'Result', description: 'Return the frame with its extra column.' },
]

export const code = `add a bonus column to the employees frame
  select the whole salary column
  multiply that column by 2, row by row
  store the doubled column as bonus, matched by row label
  return the frame`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `import pandas as pd


def create_bonus_column(employees: pd.DataFrame) -> pd.DataFrame:
    doubled = employees['salary'] * 2
    employees['bonus'] = doubled
    return employees
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

export function buildTrace({ employees }) {
  const frames = []
  const doubled = employees.map(() => null)
  const snapshot = () => [...doubled]
  frames.push({ phase: 'load', activeLine: L('add a bonus'), pythonLine: P('def create_bonus_column'), at: -1, doubled: snapshot(), attached: false, focus: 'none', message: `The frame has ${employees.length} row${employees.length === 1 ? '' : 's'} and no bonus column yet.` })
  frames.push({ phase: 'select', activeLine: L('select the whole'), pythonLine: P("doubled = employees['salary']"), at: -1, doubled: snapshot(), attached: false, focus: 'salary', message: 'Take the salary column as one unit. No row is handled by a Python loop.' })
  employees.forEach((row, index) => {
    doubled[index] = row.salary * 2
    frames.push({ phase: 'double', activeLine: L('multiply that column'), pythonLine: P("doubled = employees['salary']"), at: index, doubled: snapshot(), attached: false, focus: 'salary', message: `Row ${index}: ${row.salary} × 2 = ${doubled[index]}.` })
  })
  frames.push({ phase: 'attach', activeLine: L('store the doubled'), pythonLine: P("employees['bonus'] = doubled"), at: -1, doubled: snapshot(), attached: true, focus: 'bonus', message: 'Assigning to a new name adds a column. Values line up by row label, so each bonus stays with its employee.' })
  const result = employees.map((row, index) => ({ ...row, bonus: doubled[index] }))
  frames.push({ phase: 'done', activeLine: L('return the frame'), pythonLine: P('return employees'), at: -1, doubled: snapshot(), attached: true, focus: 'none', message: `Return all ${employees.length} row${employees.length === 1 ? '' : 's'} with name, salary and bonus.` })
  return { input: { employees }, result, frames }
}
