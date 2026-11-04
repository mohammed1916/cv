const isInt = v => Number.isInteger(v)

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with students.')
  const { students } = input
  if (!Array.isArray(students) || students.length > 14) throw new Error('students is a list of at most 14 rows.')
  for (const row of students) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Each row is an object with student_id, name and age.')
    if (!isInt(row.student_id)) throw new Error('student_id must be an integer.')
    if (!isInt(row.age)) throw new Error('age must be an integer.')
    if (row.name !== null && typeof row.name !== 'string') throw new Error('name must be text, or null when it is missing.')
  }
  return { students: students.map(({ student_id, name, age }) => ({ student_id, name, age })) }
}

export function buildTrace({ students }) {
  const frames = []
  const mask = students.map(() => null)
  const kept = []
  const push = (phase, lineKey, pyKey, message, extra = {}) => frames.push({
    phase, activeLine: L(lineKey), pythonLine: P(pyKey), message,
    at: -1, mask: [...mask], kept: [...kept], ...extra,
  })
  push('start', 'take the students', 'def drop_missing_data', `The table has ${students.length} row${students.length === 1 ? '' : 's'}. Only the name column decides what stays.`)
  students.forEach((row, i) => {
    mask[i] = row.name !== null
    push('mask', 'for each row', "keep = students['name']", row.name === null
      ? `Row ${i}: name is missing, so the mask gets False.`
      : `Row ${i}: name is ${JSON.stringify(row.name)}, a real value, so the mask gets True.`, { at: i })
  })
  students.forEach((row, i) => {
    if (mask[i]) kept.push(i)
    push('filter', 'walk the mask', 'return students[keep]', mask[i]
      ? `Mask is True at index ${i}: the row stays and keeps its index label ${i}.`
      : `Mask is False at index ${i}: student ${row.student_id} is dropped.`, { at: i })
  })
  const dropped = students.length - kept.length
  push('done', 'return the rows', 'return students[keep]', `Result has ${kept.length} row${kept.length === 1 ? '' : 's'}; ${dropped} dropped.`)
  return { input: { students }, result: kept.map(i => students[i]), frames }
}

export const phases = [
  { id: 'start', label: 'Start', description: 'The full table before anything is checked.' },
  { id: 'mask', label: 'Build mask', description: 'Test the name in each row; missing gives False.' },
  { id: 'filter', label: 'Filter', description: 'Keep exactly the rows whose mask is True.' },
  { id: 'done', label: 'Result', description: 'The rows that survived, with their original index labels.' },
]

export const code = `take the students table
for each row, write True in the mask when name is present, else False
walk the mask and keep the rows marked True
return the rows that were kept`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd


def drop_missing_data(students: pd.DataFrame) -> pd.DataFrame:
    keep = students['name'].notnull()
    return students[keep]
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.split('\n').findIndex(t => t.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}
