const COLUMNS = ['student_id', 'name', 'age']
const MAX_ROWS = 20

function checkFrame(rows, label) {
  if (!Array.isArray(rows)) throw new Error(`${label} must be an array of rows.`)
  if (rows.length > MAX_ROWS) throw new Error(`${label} has at most ${MAX_ROWS} rows in this visualization.`)
  return rows.map((row, i) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`${label}[${i}] must be an object.`)
    const keys = Object.keys(row)
    if (keys.length !== COLUMNS.length || !COLUMNS.every(c => keys.includes(c))) throw new Error(`${label}[${i}] needs exactly student_id, name and age.`)
    if (!Number.isInteger(row.student_id)) throw new Error(`${label}[${i}].student_id must be an integer.`)
    if (typeof row.name !== 'string') throw new Error(`${label}[${i}].name must be a string.`)
    if (!Number.isInteger(row.age)) throw new Error(`${label}[${i}].age must be an integer.`)
    return { student_id: row.student_id, name: row.name, age: row.age }
  })
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with df1 and df2.')
  return { df1: checkFrame(input.df1, 'df1'), df2: checkFrame(input.df2, 'df2') }
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Both DataFrames are ready and the result is empty.' },
  { id: 'gather', label: 'Gather', description: 'List the DataFrames in the order they will be stacked.' },
  { id: 'first', label: 'First frame', description: 'Rows of df1 go on top and keep their positions.' },
  { id: 'second', label: 'Second frame', description: 'Rows of df2 follow, and their labels continue the numbering.' },
  { id: 'done', label: 'Result', description: 'Return the stacked DataFrame.' },
]

export const code = `stack two tables that share the same columns
  list the tables in order: df1, then df2
  for each row of df1 in order
    append it to the result with the next row label
  for each row of df2 in order
    append it to the result with the next row label
  return the result, keeping duplicates and row order`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import pandas as pd


def concatenateTables(df1, df2):
    frames = [df1, df2]
    result = pd.concat(frames, ignore_index=True)
    return result
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.trim().split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

export function buildTrace({ df1, df2 }) {
  const frames = []
  const out = []
  const push = (phase, activeLine, pythonLine, message, source = null, sourceIndex = -1) => frames.push({
    phase, activeLine, pythonLine, message, source, sourceIndex, out: out.map(r => ({ ...r })),
  })
  push('start', L('stack two tables'), P('def concatenateTables'), `df1 has ${df1.length} row${df1.length === 1 ? '' : 's'} and df2 has ${df2.length}. The result is empty.`)
  push('gather', L('list the tables'), P('frames ='), `Order matters: df1 goes on top, so the result will have ${df1.length} + ${df2.length} = ${df1.length + df2.length} rows.`)
  const copy = (rows, source, phase, header) => {
    if (!rows.length) {
      push(phase, L(header), P('pd.concat'), `${source} has no rows, so it adds nothing and the columns stay the same.`, source)
      return
    }
    rows.forEach((row, i) => {
      const index = out.length
      out.push({ index, ...row, from: `${source} row ${i}` })
      push(phase, L(`append it`) + (source === 'df2' ? 2 : 0), P('pd.concat'),
        i === index
          ? `${source} row ${i} (${row.name}) keeps label ${index}.`
          : `${source} row ${i} (${row.name}) is relabelled ${index}, because ${index} rows are already above it.`,
        source, i)
    })
  }
  copy(df1, 'df1', 'first', 'for each row of df1')
  copy(df2, 'df2', 'second', 'for each row of df2')
  const result = out.map(({ student_id, name, age }) => ({ student_id, name, age }))
  push('done', L('return the result'), P('return result'), `Return ${result.length} row${result.length === 1 ? '' : 's'}: all of df1, then all of df2, labelled 0 to ${Math.max(0, result.length - 1)}.`)
  return { input: { df1, df2 }, result, frames }
}
