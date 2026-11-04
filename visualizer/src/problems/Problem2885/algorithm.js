export const RENAMES = { id: 'student_id', first: 'first_name', last: 'last_name', age: 'age_in_years' }
const OLD_COLUMNS = Object.keys(RENAMES)
const MAX_ROWS = 12

export const phases = [
  { id: 'load', label: 'Load', description: 'The table arrives with its original headers.' },
  { id: 'map', label: 'Mapping', description: 'Write down each old name with its new name.' },
  { id: 'lookup', label: 'Look up', description: 'Find the current column by name in the mapping.' },
  { id: 'rename', label: 'Rename', description: 'Only the header text changes.' },
  { id: 'keep', label: 'Keep rows', description: 'Rows and values stay exactly as they were.' },
  { id: 'done', label: 'Result', description: 'Return the relabelled table.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with students.')
  const { students } = input
  if (!Array.isArray(students) || students.length > MAX_ROWS) throw new Error(`students is a list of at most ${MAX_ROWS} rows.`)
  for (const row of students) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error('Each student is an object.')
    const keys = Object.keys(row)
    if (keys.length !== 4 || !OLD_COLUMNS.every(column => column in row)) throw new Error('Each student has exactly id, first, last and age.')
    if (!Number.isInteger(row.id) || !Number.isInteger(row.age)) throw new Error('id and age are integers.')
    if (typeof row.first !== 'string' || typeof row.last !== 'string') throw new Error('first and last are text.')
  }
  return { students }
}

export const code = `relabel the students table
  write the mapping from old names to new names
  for each column in the table, in its current order
    look the column name up in the mapping
    replace the header text with the new name
  keep every row and every value where it is
  return the relabelled table`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `import pandas as pd


def rename_columns(students):
    mapping = {
        'id': 'student_id',
        'first': 'first_name',
        'last': 'last_name',
        'age': 'age_in_years',
    }
    return pd.DataFrame(students).rename(columns=mapping)
`
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

export function buildTrace({ students }) {
  const columns = students.length ? Object.keys(students[0]) : [...OLD_COLUMNS]
  const frames = []
  const renamed = {}
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, activeLine, pythonLine, message, renamed: { ...renamed }, activeColumn: null, showResult: false, ...extra })
  const rowsWord = students.length === 1 ? '1 row' : `${students.length} rows`
  push('load', L('relabel the students'), P('def rename_columns'), `The table has ${rowsWord} under the headers ${columns.join(', ')}.`)
  push('map', L('write the mapping'), P('mapping = {'), 'The mapping pairs each old name with its new name, so column position does not matter.')
  for (const column of columns) {
    const target = RENAMES[column]
    push('lookup', L('look the column name'), P(`'${column}': '${target}'`), `Column ${column} is looked up by name and maps to ${target}.`, { activeColumn: column })
    renamed[column] = target
    push('rename', L('replace the header'), P('.rename(columns=mapping)'), `The header ${column} becomes ${target}. Its ${students.length} value${students.length === 1 ? '' : 's'} stay below it.`, { activeColumn: column })
  }
  const result = students.map(row => Object.fromEntries(columns.map(column => [RENAMES[column], row[column]])))
  push('keep', L('keep every row'), P('.rename(columns=mapping)'), students.length ? `All ${rowsWord} keep their order and values; only the labels above them changed.` : 'There are no rows to keep, yet the empty table still gets its new headers.', { showResult: true })
  push('done', L('return the relabelled'), P('.rename(columns=mapping)'), `Return the table with headers ${columns.map(column => RENAMES[column]).join(', ')}.`, { showResult: true })
  return { input: { students }, columns, result, frames }
}
