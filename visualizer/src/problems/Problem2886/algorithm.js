export const COLUMNS = ['student_id', 'name', 'age', 'grade']

export const phases = [
  { id: 'start', label: 'Types', description: 'Read the column types. Only grade is a float.' },
  { id: 'convert', label: 'Convert', description: 'A grade keeps its whole-number part.' },
  { id: 'dtype', label: 'Column type', description: 'The column is now stored as integers.' },
  { id: 'done', label: 'Result', description: 'Return the same table with the new grade column.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.students)) throw new Error('Use an object with a students array.')
  const { students } = input
  if (students.length > 12) throw new Error('This visualization shows up to 12 students.')
  for (const row of students) {
    if (!row || typeof row !== 'object') throw new Error('Each student is an object.')
    if (!Number.isInteger(row.student_id)) throw new Error('student_id is an integer.')
    if (typeof row.name !== 'string') throw new Error('name is text.')
    if (!Number.isInteger(row.age)) throw new Error('age is an integer.')
    if (typeof row.grade !== 'number' || !Number.isFinite(row.grade) || Math.abs(row.grade) >= 1e9) throw new Error('grade is a finite number below one billion in size.')
  }
  return { students }
}

// A float column always prints a decimal point, even for whole values.
export function formatFloat(value) {
  return Number.isInteger(value) ? value.toFixed(1) : String(value)
}

export function buildTrace({ students }) {
  const before = students.map(row => ({ ...row, grade: formatFloat(row.grade) }))
  const after = students.map(row => ({ ...row, grade: '?' }))
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, at: -1, dtype: 'float64', conversion: null, before, after: after.map(row => ({ ...row })), ...extra,
  })
  push('start', L('read the column types'), P('def change_datatype'), 'student_id and age are integers and name is text. Only grade is a float, so it is the only column to change.')
  students.forEach((row, at) => {
    const whole = Math.trunc(row.grade) + 0
    const shown = formatFloat(row.grade)
    const dropped = shown.split('.')[1]
    after[at].grade = whole
    const lost = Number(dropped) !== 0
    push('convert', L('keep the whole-number part'), P('astype(int)'), lost
      ? `${row.name}: ${shown} becomes ${whole}. The digits after the point are dropped, not rounded.`
      : `${row.name}: ${shown} becomes ${whole}. The value does not change, only how it is stored.`,
    { at, conversion: { shown, whole, dropped, lost } })
  })
  push('dtype', L('mark the grade column'), P('astype(int)'), 'The assignment replaces the column in one go, so grade is stored as int64 from here on.', { dtype: 'int64' })
  push('done', L('return the table'), P('return students'), students.length ? `Return all ${students.length} row${students.length === 1 ? '' : 's'}; only the grade column differs.` : 'The table has no rows. It still has its columns, and grade is now integer.', { dtype: 'int64' })
  const result = students.map(row => ({ ...row, grade: Math.trunc(row.grade) + 0 }))
  return { input: { students }, result, frames }
}

export const code = `convert the grade column to integers
  read the column types of the table
  for each grade (pandas does all of them in one call)
    keep the whole-number part and drop what follows the point
  mark the grade column as integer
  return the table`.split('\n').map((text, index) => ({ line: index + 1, text }))
function L(s) {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `import pandas as pd

def change_datatype(students):
    students['grade'] = students['grade'].astype(int)
    return students
`
function P(s) {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
