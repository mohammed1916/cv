const MAX_ROWS = 12

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with employees.')
  const { employees } = input
  if (!Array.isArray(employees)) throw new Error('employees must be a list of rows.')
  if (employees.length > MAX_ROWS) throw new Error(`The visualization shows at most ${MAX_ROWS} rows.`)
  for (const row of employees) {
    if (!row || typeof row !== 'object' || typeof row.name !== 'string' || !row.name) throw new Error('Each row needs a non-empty name.')
    if (!Number.isSafeInteger(row.salary) || !Number.isSafeInteger(row.salary * 2)) throw new Error('Each salary must be an integer small enough to double exactly.')
  }
  return { employees: employees.map(({ name, salary }) => ({ name, salary })) }
}

export const code = `double every salary in the table
  for each row in its current position
    read that row's salary
    write salary times 2 back into the same row
  return the table with the same rows and names`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd

def modify_salary_column(employees):
    employees['salary'] = employees['salary'] * 2
    return employees
`

const L = text => {
  const hit = code.find(line => line.text.includes(text))
  if (!hit) throw new Error(`Missing pseudocode line: ${text}`)
  return hit.line
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing Python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'load', label: 'Table', description: 'The frame as it arrives.' },
  { id: 'read', label: 'Read', description: 'Pick up the salary of one row.' },
  { id: 'write', label: 'Double', description: 'Store twice that salary in the same row.' },
  { id: 'done', label: 'Result', description: 'The same frame with a doubled salary column.' },
]

export function buildTrace({ employees }) {
  const salaries = employees.map(row => row.salary)
  const frames = []
  const emit = (phase, activeLine, pythonLine, at, message, extra = {}) =>
    frames.push({ phase, activeLine, pythonLine, at, written: extra.written ?? 0, salaries: [...salaries], message })
  emit('load', L('double every'), P('def modify'), -1,
    employees.length ? `The frame has ${employees.length} row${employees.length === 1 ? '' : 's'}. Only the salary column will change.` : 'The frame has no rows, so there is nothing to double.')
  for (let i = 0; i < employees.length; i++) {
    emit('read', L('read that'), P("employees['salary'] ="), i, `Row ${i} (${employees[i].name}) currently has salary ${salaries[i]}.`, { written: i })
    const before = salaries[i]
    salaries[i] = before * 2
    emit('write', L('write salary'), P("employees['salary'] ="), i, `${before} × 2 = ${salaries[i]}, written back to row ${i}. The name stays ${employees[i].name}.`, { written: i + 1 })
  }
  const result = employees.map((row, i) => ({ name: row.name, salary: salaries[i] }))
  emit('done', L('return the'), P('return employees'), -1, `All ${employees.length} salary value${employees.length === 1 ? '' : 's'} doubled; row order and names are unchanged.`, { written: employees.length })
  return { input: { employees }, result, frames }
}

export const inputLabel = 'Object with employees (rows of name and salary)'
export const complexity = 'O(r) for r rows; pandas multiplies the whole column in one vectorised step, and the frames split that step by row so each write can be seen. The visualization caps the table at 12 rows.'
export const examples = [
  { label: 'Workshop crew', input: JSON.stringify({ employees: [{ name: 'Noor', salary: 41000 }, { name: 'Tomas', salary: 58250 }, { name: 'Ife', salary: 30500 }, { name: 'Tomas', salary: 72125 }] }) },
  { label: 'Zero salary', input: JSON.stringify({ employees: [{ name: 'Intern', salary: 0 }, { name: 'Lead', salary: 90000 }] }) },
  { label: 'Empty frame', input: JSON.stringify({ employees: [] }) },
]
