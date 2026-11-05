export const COLUMNS = ['student_id', 'age']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.data) || input.data.length < 1 || input.data.length > 10) throw new Error('data holds 1 to 10 rows.')
  if (input.data.some(row => !Array.isArray(row) || row.length !== 2 || !row.every(Number.isInteger))) throw new Error('Each row is [student_id, age] with two integers.')
  return { data: input.data }
}

// The real solution is one pandas call; the table below builds the same records row by row.
export const code = [
  { line: 1, text: 'import pandas as pd' },
  { line: 2, text: '' },
  { line: 3, text: 'def create_dataframe(student_data):' },
  { line: 4, text: '    return pd.DataFrame(student_data, columns=["student_id", "age"])' },
]

export const python = `import pandas as pd

def create_dataframe(student_data):
    return pd.DataFrame(student_data, columns=["student_id", "age"])
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export function buildTrace({ data }) {
  const table = []
  const frames = []
  frames.push({ phase: 'start', activeLine: 3, pythonLine: PL('def create_dataframe'), table: [], at: -1, message: `Columns are ${COLUMNS.join(' and ')}; ${data.length} rows follow in order.` })
  data.forEach((row, i) => {
    table.push({ student_id: row[0], age: row[1] })
    frames.push({ phase: 'row', activeLine: 4, pythonLine: PL('return pd.DataFrame'), table: table.map(r => ({ ...r })), at: i, message: `Row ${i} becomes student ${row[0]} aged ${row[1]}.` })
  })
  frames.push({ phase: 'done', activeLine: 4, pythonLine: PL('return pd.DataFrame'), table: table.map(r => ({ ...r })), at: -1, result: data.length, message: 'The DataFrame keeps the rows in the same order.' })
  return { input: { data }, result: table, frames }
}
