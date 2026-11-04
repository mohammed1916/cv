const TARGET = 101
const MAX_ROWS = 12

export const python = `import pandas as pd

def select_data(students):
    is_target = students["student_id"] == 101
    matching = students[is_target]
    return matching[["name", "age"]]`

const pseudo = `read the students table
mark each row: is student_id equal to 101?
keep only the marked rows
keep only the name and age columns
return what is left`
export const code = pseudo.split('\n').map((text, index) => ({ line: index + 1, text }))

const lineIn = (lines, text) => {
  const index = lines.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing code line: ${text}`)
  return index + 1
}
const pyLines = python.split('\n')
const L = text => lineIn(pseudo.split('\n'), text)
const P = text => lineIn(pyLines, text)

export const phases = [
  { id: 'load', label: 'Load', description: 'Start from every row and every column.' },
  { id: 'mask', label: 'Mask', description: 'Compare each student_id with 101.' },
  { id: 'filter', label: 'Filter rows', description: 'Rows marked false are removed.' },
  { id: 'project', label: 'Pick columns', description: 'Only name and age survive.' },
  { id: 'done', label: 'Result', description: 'Return the remaining cells.' },
]
export const inputLabel = 'Object with a students table (student_id, name, age)'
export const complexity = 'O(n) time for n rows: one comparison per row. The visualization caps the table at 12 rows.'
export const url = 'https://leetcode.com/problems/select-data/'
export const examples = [
  { label: 'Student present', input: JSON.stringify({ students: [
    { student_id: 44, name: 'Priya', age: 12 },
    { student_id: 101, name: 'Tomas', age: 15 },
    { student_id: 7, name: 'Amara', age: 9 },
    { student_id: 210, name: 'Kenji', age: 14 },
  ] }) },
  { label: 'No student 101', input: JSON.stringify({ students: [
    { student_id: 100, name: 'Lena', age: 11 },
    { student_id: 102, name: 'Omar', age: 13 },
  ] }) },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with a students list.')
  const { students } = input
  if (!Array.isArray(students) || students.length > MAX_ROWS) throw new Error(`students must be a list of at most ${MAX_ROWS} rows.`)
  students.forEach((row, index) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`Row ${index + 1} must be an object.`)
    if (!Number.isInteger(row.student_id)) throw new Error(`Row ${index + 1} needs an integer student_id.`)
    if (typeof row.name !== 'string') throw new Error(`Row ${index + 1} needs a text name.`)
    if (!Number.isInteger(row.age)) throw new Error(`Row ${index + 1} needs an integer age.`)
  })
  return { students: students.map(({ student_id, name, age }) => ({ student_id, name, age })) }
}

export function buildTrace({ students }) {
  const frames = []
  const mask = students.map(() => null)
  const push = (phase, pseudoText, pyText, message, at = -1, result = null) => frames.push({
    phase, activeLine: L(pseudoText), pythonLine: P(pyText), message, at, mask: [...mask], result: result && result.map(row => ({ ...row })),
  })
  push('load', 'read the students', 'def select_data', `The table has ${students.length} row${students.length === 1 ? '' : 's'} and three columns.`)
  students.forEach((row, index) => {
    mask[index] = row.student_id === TARGET
    push('mask', 'mark each row', 'is_target =', `Row ${index}: ${row.student_id} ${mask[index] ? '==' : '!='} ${TARGET}, so the mask is ${mask[index] ? 'True' : 'False'}.`, index)
  })
  const kept = students.filter((_, index) => mask[index])
  push('filter', 'keep only the marked', 'matching =', kept.length ? `${kept.length} of ${students.length} rows have a True mask and stay.` : 'No row has a True mask, so every row is removed.')
  const result = kept.map(({ name, age }) => ({ name, age }))
  push('project', 'keep only the name', 'return matching', 'Drop student_id. It was only needed for the comparison.', -1, result)
  push('done', 'return what', 'return matching', result.length ? `Return ${result.map(row => `${row.name}, ${row.age}`).join('; ')}.` : 'Return an empty table that still has the name and age columns.', -1, result)
  return { input: { students }, result, frames }
}
