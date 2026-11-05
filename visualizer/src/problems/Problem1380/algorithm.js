export const phases = [
  { id: 'start', label: 'Start', description: 'A lucky number is the smallest value in its row and the largest value in its column.' },
  { id: 'rowmin', label: 'Row minimum', description: 'Find the smallest value in the current row and mark its column.' },
  { id: 'colmax', label: 'Column maximum', description: 'Check whether that value is also the largest in its column.' },
  { id: 'lucky', label: 'Lucky', description: 'The value is the row minimum and the column maximum, so it is lucky.' },
  { id: 'done', label: 'Complete', description: 'Return every lucky number.' },
]

export const examples = [
  { label: 'Single lucky', input: '{"matrix":[[3,7,8],[9,11,13],[15,16,17]]}' },
  { label: 'Corner value', input: '{"matrix":[[1,10,4,2],[9,3,8,7],[15,16,17,12]]}' },
  { label: 'None', input: '{"matrix":[[7,8],[1,2]]}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.matrix)) throw new Error('Use an object with a matrix list, such as {"matrix":[[1,2],[3,4]]}.')
  const m = data.matrix.length
  if (m < 1 || m > 8) throw new Error('matrix must have 1 to 8 rows in this visualization.')
  const n = Array.isArray(data.matrix[0]) ? data.matrix[0].length : 0
  if (n < 1 || n > 8) throw new Error('matrix must have 1 to 8 columns in this visualization.')
  if (data.matrix.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('Every row must have the same length.')
  if (data.matrix.some(row => row.some(v => !Number.isInteger(v) || v < 1 || v > 100))) throw new Error('Every value must be an integer from 1 to 100.')
  const flat = data.matrix.flat()
  if (new Set(flat).size !== flat.length) throw new Error('All values must be distinct.')
  return { matrix: data.matrix }
}

export function buildTrace({ matrix }) {
  const m = matrix.length, n = matrix[0].length
  const result = []
  const snap = (extra = {}) => ({ matrix, found: [...result], ...extra })
  const frames = [{ phase: 'start', activeLine: L('const result = []'), pythonLine: P('result = []'), snapshot: snap(),
    message: 'Look at each row for its smallest value, then check that value against its column.' }]
  for (let r = 0; r < m; r++) {
    let minCol = 0
    for (let c = 1; c < n; c++) if (matrix[r][c] < matrix[r][minCol]) minCol = c
    const value = matrix[r][minCol]
    frames.push({ phase: 'rowmin', activeLine: L('let minCol = 0'), pythonLine: P('min_col = 0'), snapshot: snap({ row: r, col: minCol, value }),
      message: `Row ${r}: the smallest value is ${value}, in column ${minCol}.` })
    let colMax = true
    for (let rr = 0; rr < m; rr++) if (matrix[rr][minCol] > value) colMax = false
    frames.push({ phase: 'colmax', activeLine: L('for (let rr = 0'), pythonLine: P('for rr in range'), snapshot: snap({ row: r, col: minCol, value, colMax }),
      message: colMax ? `${value} is the largest in column ${minCol}, so it is lucky.` : `${value} has a bigger value below or above it in column ${minCol}, so it is not lucky.` })
    if (colMax) {
      result.push(value)
      frames.push({ phase: 'lucky', activeLine: L('result.push(value)'), pythonLine: P('result.append'), snapshot: snap({ row: r, col: minCol, value, colMax: true }),
        message: `${value} is lucky.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), snapshot: snap({ result: [...result] }),
    message: `Return [${result.join(', ')}].`, result })
  return { input: { matrix }, result, frames }
}

export const code = `function luckyNumbers(matrix) {
  const m = matrix.length, n = matrix[0].length
  const result = []
  for (let r = 0; r < m; r++) {
    let minCol = 0
    for (let c = 1; c < n; c++) if (matrix[r][c] < matrix[r][minCol]) minCol = c
    const value = matrix[r][minCol]
    let colMax = true
    for (let rr = 0; rr < m; rr++) if (matrix[rr][minCol] > value) colMax = false
    if (colMax) result.push(value)
  }
  return result
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def lucky_numbers(matrix):
    m, n = len(matrix), len(matrix[0])
    result = []
    for r in range(m):
        min_col = 0
        for c in range(1, n):
            if matrix[r][c] < matrix[r][min_col]:
                min_col = c
        value = matrix[r][min_col]
        col_max = True
        for rr in range(m):
            if matrix[rr][min_col] > value:
                col_max = False
        if col_max:
            result.append(value)
    return result
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
