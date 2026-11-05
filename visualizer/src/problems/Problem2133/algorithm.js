// LeetCode 2133: Check if Every Row and Column Contains All Numbers.
// In an n x n matrix with values 1 to n, a row or column is complete when it holds n distinct values.
// Track a set per row and per column.

export function parseInput(text) {
  let matrix
  try { matrix = JSON.parse(text) } catch { throw new Error('Use a JSON array of rows, e.g. [[1,2],[2,1]].') }
  const n = Array.isArray(matrix) ? matrix.length : 0
  if (n < 1 || n > 9 || matrix.some(row => !Array.isArray(row) || row.length !== n || row.some(v => !Number.isInteger(v) || v < 1 || v > n))) {
    throw new Error('Use an n x n matrix (n from 1 to 9) whose values are integers from 1 to n.')
  }
  return { matrix }
}

export const code = `function checkValid(matrix) {
  const n = matrix.length
  for (let i = 0; i < n; i++) {
    const row = new Set()
    const column = new Set()
    for (let j = 0; j < n; j++) {
      row.add(matrix[i][j])
      column.add(matrix[j][i])
    }
    if (row.size !== n || column.size !== n) return false
  }
  return true
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: check_valid
def check_valid(matrix):
    n = len(matrix)
    for i in range(n):
        row = set()
        column = set()
        for j in range(n):
            row.add(matrix[i][j])
            column.add(matrix[j][i])
        if len(row) != n or len(column) != n:
            return False
    return True
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'row', label: 'Row', description: 'Collect the values of row i.' },
  { id: 'column', label: 'Column', description: 'Collect the values of column i.' },
  { id: 'fail', label: 'Incomplete', description: 'A row or column repeats a value and misses another.' },
  { id: 'done', label: 'Result', description: 'Whether every row and column is complete.' },
]

export function buildTrace({ matrix }) {
  const frames = []
  const n = matrix.length
  const rows = []
  let ok = true
  for (let i = 0; i < n && ok; i++) {
    const row = new Set()
    const column = new Set()
    for (let j = 0; j < n; j++) {
      row.add(matrix[i][j])
      column.add(matrix[j][i])
    }
    const missingRow = [...Array(n)].map((_, k) => k + 1).filter(v => !row.has(v))
    const missingCol = [...Array(n)].map((_, k) => k + 1).filter(v => !column.has(v))
    rows.push({ line: `row ${i}`, values: matrix[i].join(' '), missing: missingRow.join(' ') || 'none' }, { line: `column ${i}`, values: matrix.map(r => r[i]).join(' '), missing: missingCol.join(' ') || 'none' })
    frames.push({ phase: 'row', activeLine: L('row.add'), pythonLine: P('row.add'), message: `Row ${i} has ${row.size} distinct values of ${n}; column ${i} has ${column.size}.`, rows: [...rows], current: i })
    if (row.size !== n || column.size !== n) {
      ok = false
      frames.push({ phase: 'fail', activeLine: L('if (row.size'), pythonLine: P('if len(row)'), message: `Line ${i} is incomplete, so the matrix is not valid.`, rows: [...rows], current: i })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return true'), pythonLine: P('return True'), message: ok ? 'Every row and column contains 1 to n.' : 'Some row or column is incomplete.', rows: [...rows], current: null })
  return { input: { matrix }, result: ok, frames }
}
